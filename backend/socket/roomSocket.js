// const mongoose = require('mongoose');
// const Room = require('../database/models/room.model');
// const User = require('../database/models/user.model');

// module.exports = (io) => {
//   const roomState = {
//     users: {}, // { roomId: [{ socketId, userId, userName, joinTime, isAudioEnabled, isVideoEnabled, photo }] }
//     owners: {}, // { roomId: ownerUserId }
//     sessionTimes: {}, // { socketId: startTime }
//     roomCache: {}, // { roomId: boolean } to cache room existence
//     socketData: {}, // { socketId: { roomId, userId, userName } } to persist socket state
//   };

//   const checkRoomExists = async (roomId) => {
//     if (roomState.roomCache[roomId] !== undefined) return roomState.roomCache[roomId];
//     const room = await Room.findOne({ roomId }).select('maxParticipants participants');
//     roomState.roomCache[roomId] = !!room;
//     return { exists: !!room, maxParticipants: room?.maxParticipants || 0, currentParticipants: room?.participants.length || 0 };
//   };

//   const addUserToRoom = async (roomId, userData) => {
//     if (!roomState.users[roomId]) roomState.users[roomId] = [];
//     const roomInfo = await checkRoomExists(roomId);
//     if (!roomInfo.exists) {
//       await Room.create({ roomId, createdBy: new mongoose.Types.ObjectId(userData.userId), participants: [new mongoose.Types.ObjectId(userData.userId)], isLive: true, maxParticipants: 10 }); // Default max if not set
//       roomState.roomCache[roomId] = true;
//     } else if (roomState.users[roomId].length >= roomInfo.maxParticipants) {
//       return { error: 'room full' };
//     }

//     const existingUserIndex = roomState.users[roomId].findIndex((u) => u.userId === userData.userId);
//     if (existingUserIndex !== -1) {
//       roomState.users[roomId][existingUserIndex].socketId = userData.socketId;
//       const oldSocket = io.sockets.sockets.get(roomState.users[roomId][existingUserIndex].socketId);
//       if (oldSocket && oldSocket.id !== userData.socketId) oldSocket.disconnect(true);
//     } else {
//       roomState.users[roomId].push(userData);
//       await Room.findOneAndUpdate(
//         { roomId },
//         { $addToSet: { participants: new mongoose.Types.ObjectId(userData.userId) } },
//         { upsert: true, new: true, useFindAndModify: false }
//       );
//     }
//     const usersInThisRoom = roomState.users[roomId].filter((u) => u.userId !== userData.userId).map((u) => u.socketId);
//     io.to(roomId).emit('userConnected', { userId: userData.userId, socketId: userData.socketId });
//     socket.emit('all users', usersInThisRoom);
//     emitRoomUpdate(roomId);
//     return roomState.users[roomId];
//   };

//   const removeUserFromRoom = async (roomId, userId) => {
//     if (!roomState.users[roomId]) return null;
//     const userIndex = roomState.users[roomId].findIndex((u) => u.userId === userId);
//     if (userIndex === -1) return null;
//     const removedUser = roomState.users[roomId][userIndex];
//     roomState.users[roomId].splice(userIndex, 1);
//     await Room.findOneAndUpdate(
//       { roomId },
//       { $pull: { participants: new mongoose.Types.ObjectId(userId) }, isLive: roomState.users[roomId].length > 0 },
//       { useFindAndModify: false }
//     );
//     io.to(roomId).emit('user left', removedUser.socketId);
//     emitRoomUpdate(roomId);
//     return removedUser;
//   };

//   const updateUserStats = async (userId, sessionDuration) => {
//     const sessionHours = sessionDuration / (1000 * 60 * 60);
//     await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalHours': sessionHours } });
//   };

//   const handleOwnershipTransfer = (roomId, leavingUserId) => {
//     if (roomState.owners[roomId] === leavingUserId && roomState.users[roomId]?.length > 0) {
//       const newOwner = roomState.users[roomId][0];
//       roomState.owners[roomId] = newOwner.userId;
//       io.to(roomId).emit('ownershipTransferred', { newOwnerId: newOwner.userId });
//       return newOwner.userId;
//     }
//     return null;
//   };

//   const emitRoomUpdate = (roomId) => {
//     io.to(roomId).emit('roomUsers', {
//       users: roomState.users[roomId]?.map((u) => ({ userId: u.userId })) || [],
//       ownerId: roomState.owners[roomId] || '',
//     });
//   };

//   io.on('connection', (socket) => {
//     console.log('🔌 Client connected:', socket.id);

//     socket.on('joinRoom', async ({ roomId, userId, userName, roomTitle }) => {
//       try {
//         const roomInfo = await checkRoomExists(roomId);
//         if (!roomInfo.exists) {
//           await Room.create({ roomId, createdBy: new mongoose.Types.ObjectId(userId), participants: [new mongoose.Types.ObjectId(userId)], isLive: true, maxParticipants: 10 }); // Default max if not set
//           roomState.roomCache[roomId] = true;
//         }
//         if (socket.roomId && socket.roomId !== roomId) {
//           await removeUserFromRoom(socket.roomId, socket.userId);
//           socket.leave(socket.roomId);
//           handleOwnershipTransfer(socket.roomId, socket.userId);
//           emitRoomUpdate(socket.roomId);
//         }
//         socket.join(roomId);
//         socket.roomId = roomId;
//         socket.userId = userId;
//         socket.userName = userName;
//         roomState.socketData[socket.id] = { roomId, userId, userName };
//         if (!roomState.owners[roomId]) roomState.owners[roomId] = userId;
//         const user = await User.findById(userId).select('name photo stats');
//         const userData = { socketId: socket.id, userId, userName: user.name, photo: user.photo, joinTime: new Date(), isAudioEnabled: false, isVideoEnabled: false };
//         const result = await addUserToRoom(roomId, userData);
//         if (result.error === 'room full') {
//           socket.emit('room full');
//           socket.leave(roomId);
//           return;
//         }
//         roomState.sessionTimes[socket.id] = new Date();
//         socket.to(roomId).emit('userJoined', { userId, userName: user.name, photo: user.photo, socketId: socket.id });
//         emitRoomUpdate(roomId);
//       } catch (error) {
//         console.error('❌ Error in joinRoom:', error);
//         socket.emit('error', { message: `Failed to join room: ${error.message}` });
//       }
//     });

//     socket.on('sending signal', ({ userToSignal, signal, callerID }) => {
//       const roomId = roomState.socketData[callerID]?.roomId;
//       const targetUser = roomState.users[roomId]?.find((u) => u.socketId === userToSignal);
//       if (targetUser) io.to(userToSignal).emit('user joined', { signal, callerID });
//     });

//     socket.on('returning signal', ({ callerID, signal }) => {
//       io.to(callerID).emit('receiving returned signal', { signal, id: socket.id });
//     });

//     socket.on('change', (payload) => {
//       const { roomId } = socket;
//       if (roomId) io.to(roomId).emit('change', payload);
//     });

//     socket.on('leaveRoom', async ({ roomId, userId }) => {
//       try {
//         const removedUser = await removeUserFromRoom(roomId, userId);
//         if (removedUser) {
//           const sessionDuration = new Date() - removedUser.joinTime;
//           await updateUserStats(userId, sessionDuration);
//           handleOwnershipTransfer(roomId, userId);
//           emitRoomUpdate(roomId);
//           socket.to(roomId).emit('userLeft', { userId, socketId: removedUser.socketId });
//         }
//         socket.leave(roomId);
//         delete socket.roomId;
//         delete socket.userId;
//         delete socket.userName;
//         delete roomState.socketData[socket.id];
//       } catch (error) {
//         console.error('❌ Error in leaveRoom:', error);
//         socket.emit('error', { message: `Failed to leave room: ${error.message}` });
//       }
//     });

//     socket.on('sendMessage', async ({ message, userName, time }) => {
//       if (socket.roomId) io.to(socket.roomId).emit('receiveMessage', { message, userName, time });
//     });

//     socket.on('mediaStateChange', ({ userId, mediaType, isEnabled }) => {
//       const { roomId } = socket;
//       if (roomId && roomState.users[roomId]) {
//         const userInRoom = roomState.users[roomId].find((u) => u.userId === userId);
//         if (userInRoom) {
//           if (mediaType === 'audio') userInRoom.isAudioEnabled = isEnabled;
//           else if (mediaType === 'video') userInRoom.isVideoEnabled = isEnabled;
//           io.to(roomId).emit('mediaStateChange', { userId, mediaType, isEnabled });
//           emitRoomUpdate(roomId);
//         }
//       }
//     });

//     socket.on('kickUser', async ({ roomId, userId }) => {
//       if (socket.userId === roomState.owners[roomId]) {
//         const targetUser = roomState.users[roomId]?.find((u) => u.userId === userId);
//         if (targetUser) {
//           io.to(targetUser.socketId).emit('kicked', { reason: 'Kicked by room owner' });
//           await removeUserFromRoom(roomId, userId);
//           emitRoomUpdate(roomId);
//           io.to(roomId).emit('userLeft', { userId, socketId: targetUser.socketId });
//         }
//       }
//     });

//     socket.on('disconnect', async () => {
//       const { roomId, userId } = socket;
//       if (roomId && userId) {
//         setTimeout(async () => {
//           const removedUser = await removeUserFromRoom(roomId, userId);
//           if (removedUser) {
//             const sessionDuration = new Date() - removedUser.joinTime;
//             await updateUserStats(userId, sessionDuration);
//             handleOwnershipTransfer(roomId, userId);
//             emitRoomUpdate(roomId);
//             io.to(roomId).emit('userLeft', { userId, socketId: removedUser.socketId });
//           }
//           delete roomState.sessionTimes[socket.id];
//           delete roomState.socketData[socket.id];
//         }, 20000);
//       }
//     });

//     socket.on('error', (error) => {
//       console.error(`❌ Socket error for ${socket.id}:`, error);
//     });
//   });

//   process.on('SIGTERM', () => console.log('🧹 Cleaning up socket connections...'));
//   process.on('SIGINT', () => console.log('🧹 Cleaning up socket connections...'));

//   return { roomState };
// };
const mongoose = require('mongoose');
const Room = require('../database/models/room.model');
const User = require('../database/models/user.model');

module.exports = (io) => {
  const roomState = {
    users: {}, // { roomId: [{ socketId, userId, userName, joinTime, isAudioEnabled, isVideoEnabled, photo }] }
    owners: {}, // { roomId: ownerUserId }
    sessionTimes: {}, // { socketId: startTime }
    roomCache: {}, // { roomId: boolean } to cache room existence
    socketData: {}, // { socketId: { roomId, userId, userName } } to persist socket state
  };

  const checkRoomExists = async (roomId) => {
    if (roomState.roomCache[roomId] !== undefined) return roomState.roomCache[roomId];
    const room = await Room.findOne({ roomId });
    roomState.roomCache[roomId] = !!room;
    return roomState.roomCache[roomId];
  };

  const addUserToRoom = async (roomId, userData) => {
    if (!roomState.users[roomId]) roomState.users[roomId] = [];

    const existingUserIndex = roomState.users[roomId].findIndex((u) => u.userId === userData.userId);
    if (existingUserIndex !== -1) {
      const oldSocketId = roomState.users[roomId][existingUserIndex].socketId;
      if (oldSocketId !== userData.socketId) {
        roomState.users[roomId][existingUserIndex] = { ...roomState.users[roomId][existingUserIndex], socketId: userData.socketId };
        console.log(`🔄 Updated socketId for user ${userData.userId} in room ${roomId} from ${oldSocketId} to ${userData.socketId}`);
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket && oldSocketId !== userData.socketId) {
          oldSocket.disconnect(true);
          console.log(`🔌 Disconnected stale socket ${oldSocketId} for user ${userData.userId}`);
        }
      } else {
        console.log(`🔄 User ${userData.userId} already in room ${roomId} with same socketId ${oldSocketId}, skipping update`);
      }
    } else {
      roomState.users[roomId].push(userData);
      try {
        await Room.findOneAndUpdate(
          { roomId },
          { $addToSet: { participants: new mongoose.Types.ObjectId(userData.userId) } },
          { upsert: true, new: true, useFindAndModify: false }
        );
      } catch (error) {
        console.error(`❌ Error adding user ${userData.userId} to room ${roomId}:`, error);
        throw error;
      }
    }

    io.to(roomId).emit('userConnected', { userId: userData.userId, socketId: userData.socketId });
    emitRoomUpdate(roomId);
    return roomState.users[roomId];
  };

  const removeUserFromRoom = async (roomId, userId) => {
    if (!roomState.users[roomId]) return null;

    const userIndex = roomState.users[roomId].findIndex((u) => u.userId === userId);
    if (userIndex === -1) return null;

    const removedUser = roomState.users[roomId][userIndex];
    roomState.users[roomId].splice(userIndex, 1);

    try {
      let updated = false;
      for (let attempts = 0; attempts < 3; attempts++) {
        try {
          const room = await Room.findOne({ roomId });
          if (!room) {
            console.error(`❌ Room ${roomId} not found in database`);
            roomState.roomCache[roomId] = false;
            return removedUser;
          }
          room.participants = room.participants.filter((p) => p.toString() !== userId);
          room.isLive = room.participants.length > 0;
          await room.save({ validateBeforeSave: true });
          console.log(`✅ Updated participants for room ${roomId}:`, room.participants);
          updated = true;
          emitRoomUpdate(roomId);
          break;
        } catch (error) {
          if (error.name === 'VersionError') {
            console.warn(`⚠️ VersionError on attempt ${attempts + 1} for room ${roomId}, retrying...`);
            continue;
          }
          throw error;
        }
      }
      if (!updated) {
        console.error(`❌ Failed to update room ${roomId} after retries`);
      }
    } catch (error) {
      console.error(`❌ Error updating room ${roomId}:`, error);
    }

    io.to(roomId).emit('userDisconnected', { userId });
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
      io.to(roomId).emit('ownershipTransferred', { newOwnerId: newOwner.userId });
      return newOwner.userId;
    }
    return null;
  };

  const emitRoomUpdate = (roomId) => {
    const users = roomState.users[roomId] || [];
    const ownerId = roomState.owners[roomId] || '';
    
    io.to(roomId).emit('roomUsers', {
      users: users,
      ownerId: ownerId,
    });
    
    console.log(`📢 Emitted roomUsers for room ${roomId}: ${users.length} users, owner: ${ownerId}`);
    
    // Also emit to each user individually to ensure they get the update
    users.forEach(user => {
      const userSocket = io.sockets.sockets.get(user.socketId);
      if (userSocket) {
        userSocket.emit('roomUsers', {
          users: users,
          ownerId: ownerId,
        });
      }
    });
  };

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('joinRoom', async ({ roomId, userId, userName, roomTitle }) => {
      try {
        const roomExists = await checkRoomExists(roomId);
        if (!roomExists) {
          console.log(`useRoom: Room ${roomId} not found, attempting to create`);
          await Room.create({ roomId, createdBy: new mongoose.Types.ObjectId(userId), participants: [new mongoose.Types.ObjectId(userId)], isLive: true });
          roomState.roomCache[roomId] = true;
        }

        if (socket.roomId === roomId && socket.userId === userId) {
          console.log(`🔄 User ${userId} already in room ${roomId} on this socket, emitting current state`);
          emitRoomUpdate(roomId);
          return;
        }

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
            io.to(socket.roomId).emit('userDisconnected', { userId: socket.userId });
          }
        }

        const existingUser = roomState.users[roomId]?.find(u => u.userId === userId);
        if (existingUser && existingUser.socketId !== socket.id) {
          console.log(`🔄 User ${userId} switching socket in room ${roomId}, updating socketId from ${existingUser.socketId} to ${socket.id}`);
          const oldSocket = io.sockets.sockets.get(existingUser.socketId);
          if (oldSocket) {
            oldSocket.disconnect(true);
            console.log(`🔌 Disconnected stale socket ${existingUser.socketId} for user ${userId}`);
          }
          existingUser.socketId = socket.id;
          socket.join(roomId);
          socket.roomId = roomId;
          socket.userId = userId;
          socket.userName = userName;
          roomState.socketData[socket.id] = { roomId, userId, userName };
          emitRoomUpdate(roomId);
          return;
        }

        socket.join(roomId);
        socket.roomId = roomId;
        socket.userId = userId;
        socket.userName = userName;
        roomState.socketData[socket.id] = { roomId, userId, userName };
        
        console.log(`🔌 Socket ${socket.id} state after joining:`, {
          roomId: socket.roomId,
          userId: socket.userId,
          userName: socket.userName,
          inRoom: socket.rooms.has(roomId)
        });
        
        console.log(`✅ Socket ${socket.id} joined room ${roomId} as user ${userId} (${userName})`);

        if (!roomState.owners[roomId]) {
          roomState.owners[roomId] = userId;
          await Room.findOneAndUpdate(
            { roomId },
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { new: true, useFindAndModify: false }
          );
        }

        const user = await User.findById(userId).select('name photo stats');
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          console.error(`❌ User ${userId} not found`);
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
              details: roomTitle,
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

    socket.on('offer', ({ toUserId, offer, roomId, fromUserId }) => {
      const targetUsers = roomState.users[roomId]?.filter((u) => u.userId !== fromUserId);
      if (targetUsers) {
        targetUsers.forEach((user) => {
          io.to(user.socketId).emit('offer', { fromUserId, toUserId: user.userId, offer, roomId });
          console.log(`📡 Broadcasted offer from ${fromUserId} to ${user.userId} in room ${roomId}`);
        });
      } else {
        socket.emit('error', { message: `No target users found in room ${roomId}` });
      }
    });

    socket.on('answer', ({ toUserId, answer, roomId, fromUserId }) => {
      const targetUser = roomState.users[roomId]?.find((u) => u.userId === toUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('answer', { fromUserId, toUserId, answer, roomId });
        console.log(`📡 Forwarded answer from ${fromUserId} to ${toUserId} in room ${roomId}`);
      } else {
        socket.emit('error', { message: `User ${toUserId} not found in room ${roomId}` });
      }
    });

    socket.on('iceCandidate', ({ toUserId, candidate, roomId, fromUserId }) => {
      const targetUser = roomState.users[roomId]?.find((u) => u.userId === toUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('iceCandidate', { fromUserId, toUserId, candidate, roomId });
        console.log(`📡 Forwarded ICE candidate from ${fromUserId} to ${toUserId} in room ${roomId}`);
      } else {
        socket.emit('error', { message: `User ${toUserId} not found in room ${roomId}` });
      }
    });

    socket.on('requestRoomUsers', ({ roomId }) => {
      if (socket.roomId === roomId) {
        emitRoomUpdate(roomId);
        console.log(`📡 Sent roomUsers to ${socket.id} for room ${roomId}`);
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
        delete roomState.socketData[socket.id];
      } catch (error) {
        console.error('❌ Error in leaveRoom:', error);
        socket.emit('error', { message: `Failed to leave room: ${error.message}` });
      }
    });

    socket.on('sendMessage', async ({ message, userName, time }) => {
      try {
        const roomId = socket.roomId;
        
        if (!roomId) {
          console.error(`❌ Socket ${socket.id} attempted to send message without roomId. Socket state:`, {
            socketRoomId: socket.roomId,
            socketUserId: socket.userId,
            socketUserName: socket.userName,
            socketDataExists: !!roomState.socketData[socket.id]
          });
          socket.emit('error', { message: 'Not in a room. Please rejoin the room.' });
          return;
        }

        const messageData = { message, userName, time };
        io.to(roomId).emit('receiveMessage', messageData);
        console.log(`💬 Message sent in room ${roomId} by ${userName}: ${message.substring(0, 50)}`);
      } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        socket.emit('error', { message: `Failed to send message: ${error.message}` });
      }
    });

    socket.on('mediaStateChange', ({ userId, mediaType, isEnabled }) => {
      const { roomId } = socket;
      if (roomId && roomState.users[roomId]) {
        const userInRoom = roomState.users[roomId].find((u) => u.userId === userId);
        if (userInRoom) {
          if (mediaType === 'audio') userInRoom.isAudioEnabled = isEnabled;
          else if (mediaType === 'video') userInRoom.isVideoEnabled = isEnabled;
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

        setTimeout(async () => {
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
            if (newOwnerId) io.to(roomId).emit('ownershipTransferred', { newOwnerId });

            emitRoomUpdate(roomId);
            io.to(roomId).emit('userLeft', { userId, socketId: socket.id });
            io.to(roomId).emit('userDisconnected', { userId });
          }

          delete roomState.sessionTimes[socket.id];
          delete roomState.socketData[socket.id];
          delete roomState.roomCache[roomId];
        }, 20000);
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