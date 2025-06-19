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

    const existingUser = roomState.users[roomId].find((u) => u.userId === userData.userId);
    if (!existingUser) {
      roomState.users[roomId].push(userData);
      try {
        await Room.findOneAndUpdate(
          { roomId },
          {
            $addToSet: {
              participants: new mongoose.Types.ObjectId(userData.userId),
            },
          },
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
        room.participants = room.participants.filter(p => p.toString() !== userId);
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
        const room = await Room.findOne({ roomId }).populate('participants', 'name photo');
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.userName = userName;

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

    socket.on('offer', ({ toSocketId, offer }) => {
      socket.to(toSocketId).emit('offer', { fromSocketId: socket.id, offer });
    });

    socket.on('answer', ({ toSocketId, answer }) => {
      socket.to(toSocketId).emit('answer', { fromSocketId: socket.id, answer });
    });

    socket.on('iceCandidate', ({ toSocketId, candidate }) => {
      socket.to(toSocketId).emit('iceCandidate', { fromSocketId: socket.id, candidate });
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
          io.to(roomId).emit('userLeft', { userId, socketId: socket.id });
          io.to(roomId).emit('userDisconnected', { userId });
        }

        delete roomState.sessionTimes[socket.id];
        socket.leave(roomId);
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