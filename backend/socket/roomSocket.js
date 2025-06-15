const Room = require('../database/models/room.model');
const User = require('../database/models/user.model');

module.exports = (io) => {
  // In-memory state management
  const roomState = {
    users: {}, // { roomId: [{ socketId, userId, userName, joinTime, isAudioEnabled, isVideoEnabled }] }
    owners: {}, // { roomId: ownerUserId }
    sessionTimes: {} // { socketId: startTime }
  };

  // Helper functions
  const addUserToRoom = async (roomId, userData) => {
    if (!roomState.users[roomId]) {
      roomState.users[roomId] = [];
    }
    
    const existingUser = roomState.users[roomId].find(u => u.userId === userData.userId);
    if (!existingUser) {
      roomState.users[roomId].push(userData);
      
      // Update database
      await Room.findOneAndUpdate(
        { roomId },
        { $addToSet: { participants: userData.userId } },
        { upsert: true }
      );
    }
    
    return roomState.users[roomId];
  };

  const removeUserFromRoom = async (roomId, userId) => {
    if (!roomState.users[roomId]) return null;

    const userIndex = roomState.users[roomId].findIndex(u => u.userId === userId);
    if (userIndex === -1) return null;

    const removedUser = roomState.users[roomId][userIndex];
    roomState.users[roomId].splice(userIndex, 1);

    // Update database
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        room.participants.pull(userId);
        await room.save();

        // Clean up empty room
        if (roomState.users[roomId].length === 0) {
          await Room.deleteOne({ roomId });
          delete roomState.users[roomId];
          delete roomState.owners[roomId];
          console.log(`✅ Room ${roomId} cleaned up - empty room deleted`);
        }
      }
    } catch (error) {
      console.error(`❌ Error cleaning up room ${roomId}:`, error);
    }

    return removedUser;
  };

  const updateUserStats = async (userId, sessionDuration) => {
    try {
      const sessionHours = sessionDuration / (1000 * 60 * 60);
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalHours': sessionHours }
      });
      console.log(`📊 Updated stats for user ${userId}: +${sessionHours.toFixed(2)} hours`);
    } catch (error) {
      console.error(`❌ Error updating user stats:`, error);
    }
  };

  const handleOwnershipTransfer = (roomId, leavingUserId) => {
    if (roomState.owners[roomId] === leavingUserId && roomState.users[roomId]?.length > 0) {
      const newOwner = roomState.users[roomId][0];
      roomState.owners[roomId] = newOwner.userId;
      console.log(`👑 Ownership transferred in room ${roomId} to ${newOwner.userName}`);
      return newOwner.userId;
    }
    return null;
  };

  const emitRoomUpdate = (roomId) => {
    io.to(roomId).emit("roomUsers", {
      users: roomState.users[roomId] || [],
      ownerId: roomState.owners[roomId],
    });
  };

  // Socket connection handler
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join room handler
    socket.on("joinRoom", async ({ roomId, userId, userName, roomTitle }) => {
      try {
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.userName = userName;

        // Set room owner if first user
        if (!roomState.owners[roomId]) {
          roomState.owners[roomId] = userId;
          await Room.findOneAndUpdate(
            { roomId }, 
            { createdBy: userId, title: roomTitle }, 
            { upsert: true }
          );
        }

        // Fetch user data
        const user = await User.findById(userId).select("name photo stats");
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        // Add user to room
        const userData = { 
          socketId: socket.id, 
          userId, 
          userName: user.name, 
          photo: user.photo, 
          joinTime: new Date(),
          isAudioEnabled: true,
          isVideoEnabled: true,
        };
        
        await addUserToRoom(roomId, userData);

        // Update user session count
        await User.findByIdAndUpdate(userId, { $inc: { sessions: 1 } });

        // Track session start time
        roomState.sessionTimes[socket.id] = new Date();

        // Add recent activity
        await User.findByIdAndUpdate(userId, {
          $push: { 
            recentActivity: { 
              type: 'session', 
              timestamp: new Date(), 
              details: roomTitle 
            } 
          }
        });

        // Emit updates
        emitRoomUpdate(roomId);
        socket.to(roomId).emit("userJoined", {
          userId,
          userName: user.name,
          photo: user.photo,
          socketId: socket.id,
        });
        socket.to(roomId).emit("userConnected", { userId, socketId: socket.id });

        console.log(`👤 User ${user.name} joined room ${roomId}`);
      } catch (error) {
        console.error('❌ Error in joinRoom:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // WebRTC signaling handlers
    socket.on("offer", ({ toSocketId, offer }) => {
      socket.to(toSocketId).emit("offer", { fromSocketId: socket.id, offer });
    });

    socket.on("answer", ({ toSocketId, answer }) => {
      socket.to(toSocketId).emit("answer", { fromSocketId: socket.id, answer });
    });

    socket.on("iceCandidate", ({ toSocketId, candidate }) => {
      socket.to(toSocketId).emit("iceCandidate", { fromSocketId: socket.id, candidate });
    });

    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', { from: socket.id, data });
    });

    // Leave room handler
    socket.on("leaveRoom", async ({ roomId, userId }) => {
      try {
        const removedUser = await removeUserFromRoom(roomId, userId);
        if (removedUser) {
          const sessionDuration = new Date() - removedUser.joinTime;
          await updateUserStats(userId, sessionDuration);

          const newOwnerId = handleOwnershipTransfer(roomId, userId);
          if (newOwnerId) {
            io.to(roomId).emit('ownershipTransferred', { newOwnerId });
          }

          emitRoomUpdate(roomId);
          socket.to(roomId).emit("userDisconnected", { userId });
          console.log(`👋 User ${userId} left room ${roomId}`);
        }

        delete roomState.sessionTimes[socket.id];
        socket.leave(roomId);
      } catch (error) {
        console.error('❌ Error in leaveRoom:', error);
      }
    });

    // Chat message handler
    socket.on("sendMessage", ({ message, userName, time }) => {
      if (!socket.roomId) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }
      
      socket.broadcast.to(socket.roomId).emit("receiveMessage", {
        message,
        userName,
        time,
      });
    });
    
    // Media state change handler
    socket.on('mediaStateChange', ({ userId, mediaType, isEnabled }) => {
      const { roomId } = socket;
      if (roomId && roomState.users[roomId]) {
        const userInRoom = roomState.users[roomId].find(u => u.userId === userId);
        if (userInRoom) {
          if (mediaType === 'audio') {
            userInRoom.isAudioEnabled = isEnabled;
          } else if (mediaType === 'video') {
            userInRoom.isVideoEnabled = isEnabled;
          }
          emitRoomUpdate(roomId);
          console.log(`🎤 Media state changed for ${userInRoom.userName} in room ${roomId}: ${mediaType} is ${isEnabled ? 'ON' : 'OFF'}`);
        }
      }
    });

    // Kick user handler (room owner only)
    socket.on('kickUser', async ({ roomId, targetUserId }) => {
      try {
        const ownerId = roomState.owners[roomId];
        if (socket.userId !== ownerId) {
          socket.emit('kickFailed', 'Only the room owner can kick users.');
          return;
        }

        const targetUser = roomState.users[roomId]?.find(u => u.userId === targetUserId);
        if (!targetUser) {
          socket.emit('kickFailed', 'User not found in room.');
          return;
        }

        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.emit('kicked', { reason: 'Kicked by room owner' });
          targetSocket.leave(roomId);
        }

        await removeUserFromRoom(roomId, targetUserId);
        emitRoomUpdate(roomId);
        io.to(roomId).emit('userKicked', { userId: targetUserId });
        
        console.log(`🚫 User ${targetUserId} kicked from room ${roomId} by owner ${ownerId}`);
      } catch (error) {
        console.error('❌ Error in kickUser:', error);
        socket.emit('kickFailed', 'Failed to kick user.');
      }
    });

    // Disconnect handler
    socket.on("disconnect", async () => {
      try {
        const { roomId, userId } = socket;
        if (!roomId || !userId) return;

        console.log(`🔌 Client disconnected: ${socket.id} from room ${roomId}`);

        const removedUser = await removeUserFromRoom(roomId, userId);
        if (removedUser) {
          const sessionDuration = new Date() - removedUser.joinTime;
          await updateUserStats(userId, sessionDuration);

          const newOwnerId = handleOwnershipTransfer(roomId, userId);
          if (newOwnerId) {
            io.to(roomId).emit('ownershipTransferred', { newOwnerId });
          }

          emitRoomUpdate(roomId);
          io.to(roomId).emit("userLeft", { userId, socketId: socket.id });
        }

        delete roomState.sessionTimes[socket.id];
        socket.leave(roomId);
      } catch (error) {
        console.error('❌ Error during disconnect cleanup:', error);
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Cleanup function for graceful shutdown
  const cleanup = () => {
    console.log('🧹 Cleaning up socket connections...');
    // Additional cleanup logic if needed
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  return { roomState, cleanup };
};
