const mongoose = require('mongoose');
const Room = require('../database/models/room.model');
const User = require('../database/models/user.model');

module.exports = (io) => {
  const roomState = {
    users: {}, // { roomId: [{ socketId, userId, userName, joinTime, isAudioEnabled, isVideoEnabled, photo }] }
    owners: {}, // { roomId: ownerUserId }
    sessionTimes: {}, // { socketId: startTime }
  };

  const addUserToRoom = async (roomId, userData) => {
    if (!roomState.users[roomId]) {
      roomState.users[roomId] = [];
    }

    // Update or add user
    const existingUserIndex = roomState.users[roomId].findIndex((u) => u.userId === userData.userId);
    if (existingUserIndex !== -1) {
      // Update socketId for existing user
      roomState.users[roomId][existingUserIndex] = { ...roomState.users[roomId][existingUserIndex], socketId: userData.socketId };
      console.log(`🔄 Updated socketId for user ${userData.userId} in room ${roomId}`);
    } else {
      roomState.users[roomId].push(userData);
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $addToSet: { participants: new mongoose.Types.ObjectId(userData.userId) } },
          { new: true }
        );
      } catch (error) {
        console.error(`❌ Error adding user ${userData.userId} to room ${roomId}:`, error);
        throw error;
      }
    }

    return roomState.users[roomId];
  };

  const removeUserFromRoom = async (roomId, userId) => {
    if (!roomState.users[roomId]) return null;

    const userIndex = roomState.users[roomId].findIndex((u) => u.userId === userId);
    if (userIndex === -1) return null;

    const removedUser = roomState.users[roomId][userIndex];
    roomState.users[roomId].splice(userIndex, 1);

    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        room.participants = room.participants.filter((p) => p.toString() !== userId);
        room.isLive = room.participants.length > 0;
        await room.save();
        console.log(`✅ Updated participants for room ${roomId}:`, room.participants);
      }
    } catch (error) {
      console.error(`❌ Error updating room ${roomId}:`, error);
    }

    return removedUser;
  };

  const updateUserStats = async (userId, sessionDuration) => {
    try {
      const sessionHours = sessionDuration / (1000 * 60 * 60);
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.totalHours': sessionHours },
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
    io.to(roomId).emit('roomUsers', {
      users: roomState.users[roomId] || [],
      ownerId: roomState.owners[roomId] || '',
    });
  };

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('joinRoom', async ({ roomId, userId, userName, roomTitle }) => {
      try {
        // Prevent multiple joins from same user/socket combination
        if (socket.roomId === roomId && socket.userId === userId) {
          console.log(`🔄 User ${userId} already in room ${roomId} on this socket, emitting current state`);
          emitRoomUpdate(roomId);
          return;
        }

        const room = await Room.findOne({ roomId }).populate('participants', 'name photo');
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Clean up any previous room assignment for this socket
        if (socket.roomId && socket.roomId !== roomId && socket.userId) {
          console.log(`🚪 Socket switching from room ${socket.roomId} to ${roomId}`);
          const removedUser = await removeUserFromRoom(socket.roomId, socket.userId);
          if (removedUser) {
            socket.leave(socket.roomId);
            const newOwnerId = handleOwnershipTransfer(socket.roomId, socket.userId);
            if (newOwnerId) {
              io.to(socket.roomId).emit('ownershipTransferred', { newOwnerId });
            }
            emitRoomUpdate(socket.roomId);
            io.to(socket.roomId).emit('userLeft', { userId: socket.userId, socketId: socket.id });
          }
        }

        // Check if user is already in target room from another socket
        const existingUser = roomState.users[roomId]?.find(u => u.userId === userId);
        if (existingUser && existingUser.socketId !== socket.id) {
          console.log(`🔄 User ${userId} switching socket in room ${roomId}, updating socketId from ${existingUser.socketId} to ${socket.id}`);
          existingUser.socketId = socket.id;
          socket.join(roomId);
          socket.roomId = roomId;
          socket.userId = userId;
          socket.userName = userName;
          emitRoomUpdate(roomId);
          return;
        }

        // Proceed with normal join process
        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.userName = userName;

        // Set room owner if not set
        if (!roomState.owners[roomId]) {
          roomState.owners[roomId] = userId;
          await Room.findOneAndUpdate(
            { roomId },
            { createdBy: new mongoose.Types.ObjectId(userId) }
          );
        }

        const user = await User.findById(userId).select('name photo stats');
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        const userData = {
          socketId: socket.id,
          userId,
          userName: user.name,
          photo: user.photo,
          joinTime: new Date(),
          isAudioEnabled: false,
          isVideoEnabled: false,
        };

        await addUserToRoom(roomId, userData);
        await User.findByIdAndUpdate(userId, { $inc: { sessions: 1 } });
        roomState.sessionTimes[socket.id] = new Date();

        await User.findByIdAndUpdate(userId, {
          $push: {
            recentActivity: {
              type: 'session',
              timestamp: new Date(),
              details: room.title,
            },
          },
        });

        emitRoomUpdate(roomId);
        socket.to(roomId).emit('userJoined', {
          userId,
          userName: user.name,
          photo: user.photo,
          socketId: socket.id,
        });
        socket.to(roomId).emit('userConnected', { userId, socketId: socket.id });

        console.log(`👤 User ${user.name} joined room ${roomId}`);
      } catch (error) {
        console.error('❌ Error in joinRoom:', error.message, error.stack);
        socket.emit('error', { message: `Failed to join room: ${error.message}` });
      }
    });

    socket.on('offer', ({ toUserId, offer, roomId }) => {
      const targetUser = roomState.users[roomId]?.find((u) => u.userId === toUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('offer', { fromUserId: socket.userId, offer });
      } else {
        socket.emit('error', { message: `User ${toUserId} not found in room ${roomId}` });
      }
    });

    socket.on('answer', ({ toUserId, answer, roomId }) => {
      const targetUser = roomState.users[roomId]?.find((u) => u.userId === toUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('answer', { fromUserId: socket.userId, answer });
      } else {
        socket.emit('error', { message: `User ${toUserId} not found in room ${roomId}` });
      }
    });

    socket.on('iceCandidate', ({ toUserId, candidate, roomId }) => {
      const targetUser = roomState.users[roomId]?.find((u) => u.userId === toUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('iceCandidate', { fromUserId: socket.userId, candidate });
      } else {
        socket.emit('error', { message: `User ${toUserId} not found in room ${roomId}` });
      }
    });

    socket.on('leaveRoom', async ({ roomId, userId }) => {
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
          socket.to(roomId).emit('userDisconnected', { userId });
          socket.to(roomId).emit('userLeft', { userId, socketId: socket.id });
          console.log(`👋 User ${userId} left room ${roomId}`);
        }

        delete roomState.sessionTimes[socket.id];
        socket.leave(roomId);
        socket.roomId = null;
        socket.userId = null;
        socket.userName = null;
      } catch (error) {
        console.error('❌ Error in leaveRoom:', error);
        socket.emit('error', { message: `Failed to leave room: ${error.message}` });
      }
    });

    socket.on('sendMessage', ({ message, userName, time }) => {
      if (!socket.roomId) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }

      const messageData = { message, userName, time };
      io.to(socket.roomId).emit('receiveMessage', messageData);
      console.log(`💬 Message sent in room ${socket.roomId}:`, messageData);
    });

    socket.on('mediaStateChange', ({ userId, mediaType, isEnabled }) => {
      const { roomId } = socket;
      if (roomId && roomState.users[roomId]) {
        const userInRoom = roomState.users[roomId].find((u) => u.userId === userId);
        if (userInRoom) {
          if (mediaType === 'audio') {
            userInRoom.isAudioEnabled = isEnabled;
          } else if (mediaType === 'video') {
            userInRoom.isVideoEnabled = isEnabled;
          }
          io.to(roomId).emit('mediaStateChange', { userId, mediaType, isEnabled });
          emitRoomUpdate(roomId);
          console.log(`🎤 Media state changed for ${userInRoom.userName} in room ${roomId}: ${mediaType} is ${isEnabled ? 'ON' : 'OFF'}`);
        }
      }
    });

    socket.on('kickUser', async ({ roomId, userId }) => {
      try {
        const ownerId = roomState.owners[roomId];
        if (socket.userId !== ownerId) {
          socket.emit('error', { message: 'Only the room owner can kick users.' });
          return;
        }

        const targetUser = roomState.users[roomId]?.find((u) => u.userId === userId);
        if (!targetUser) {
          socket.emit('error', { message: 'User not found in room.' });
          return;
        }

        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.emit('kicked', { reason: 'Kicked by room owner' });
          targetSocket.leave(roomId);
        }

        await removeUserFromRoom(roomId, userId);
        emitRoomUpdate(roomId);
        io.to(roomId).emit('userLeft', { userId, socketId: targetUser.socketId });
        console.log(`🚫 User ${userId} kicked from room ${roomId} by owner ${ownerId}`);
      } catch (error) {
        console.error('❌ Error in kickUser:', error);
        socket.emit('error', { message: `Failed to kick user: ${error.message}` });
      }
    });

    socket.on('disconnect', async () => {
      try {
        const { roomId, userId } = socket;
        if (!roomId || !userId) {
          console.log(`🔌 Client disconnected: ${socket.id} (no room/user info)`);
          return;
        }

        console.log(`🔌 Client disconnected: ${socket.id} from room ${roomId}`);

        // Add shorter delay to prevent rapid reconnect issues
        setTimeout(async () => {
          try {
            // Check if user has reconnected with different socket
            const currentUser = roomState.users[roomId]?.find(u => u.userId === userId);
            if (currentUser && currentUser.socketId !== socket.id) {
              console.log(`🔄 User ${userId} has reconnected with different socket, skipping disconnect cleanup`);
              return;
            }

            const removedUser = await removeUserFromRoom(roomId, userId);
            if (removedUser) {
              const sessionDuration = new Date() - removedUser.joinTime;
              await updateUserStats(userId, sessionDuration);

              const newOwnerId = handleOwnershipTransfer(roomId, userId);
              if (newOwnerId) {
                io.to(roomId).emit('ownershipTransferred', { newOwnerId });
              }

              emitRoomUpdate(roomId);
              io.to(roomId).emit('userLeft', { userId, socketId: socket.id });
              io.to(roomId).emit('userDisconnected', { userId });
            }

            delete roomState.sessionTimes[socket.id];
          } catch (error) {
            console.error('❌ Error during delayed disconnect cleanup:', error);
          }
        }, 500); // Reduced to 500ms delay

        // Immediate cleanup
        socket.leave(roomId);
        socket.roomId = null;
        socket.userId = null;
        socket.userName = null;
      } catch (error) {
        console.error('❌ Error during disconnect cleanup:', error);
      }
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  process.on('SIGTERM', () => {
    console.log('🧹 Cleaning up socket connections...');
  });
  process.on('SIGINT', () => {
    console.log('🧹 Cleaning up socket connections...');
  });

  return { roomState };
};