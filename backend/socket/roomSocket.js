const Room = require('../database/models/room.model');
const User = require('../database/models/user.model');


module.exports = (io) => {
  const roomUsers = {}; // { roomId: [{ socketId, userId, userName }] }
  const roomOwners = {}; // { roomId: ownerUserId }

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

  socket.on("joinRoom", async ({ roomId, userId, userName }) => {
  socket.join(roomId);
  socket.roomId = roomId;
  socket.userId = userId;
  socket.userName = userName;

  if (!roomUsers[roomId]) roomUsers[roomId] = [];
  if (!roomOwners[roomId]) {
    roomOwners[roomId] = userId;
    await Room.findOneAndUpdate({ roomId }, { createdBy: userId }, { upsert: true });
  }

  const user = await User.findById(userId).select("name photo");
  const userData = { socketId: socket.id, userId, userName: user.name, photo: user.photo };
  if (!roomUsers[roomId].some(u => u.userId === userId)) {
    roomUsers[roomId].push(userData);
    await Room.findOneAndUpdate(
      { roomId },
      { $addToSet: { participants: userId } },
      { upsert: true }
    );
  }

  io.to(roomId).emit("roomUsers", {
    users: roomUsers[roomId],
    ownerId: roomOwners[roomId],
  });

  socket.to(roomId).emit("userJoined", {
    userId,
    userName: user.name,
    photo: user.photo,
    socketId: socket.id,
  });

  // Broadcast to all users in the room except the sender
  socket.to(roomId).emit("userConnected", { userId, socketId: socket.id });
});

socket.on("offer", ({ toSocketId, offer }) => {
  socket.to(toSocketId).emit("offer", { fromSocketId: socket.id, offer });
});

socket.on("answer", ({ toSocketId, answer }) => {
  socket.to(toSocketId).emit("answer", { fromSocketId: socket.id, answer });
});

socket.on("iceCandidate", ({ toSocketId, candidate }) => {
  socket.to(toSocketId).emit("iceCandidate", { fromSocketId: socket.id, candidate });
});

socket.on("leaveRoom", ({ roomId, userId }) => {
  if (roomUsers[roomId]) {
    roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== userId);
    io.to(roomId).emit("roomUsers", {
      users: roomUsers[roomId],
      ownerId: roomOwners[roomId],
    });
    socket.to(roomId).emit("userDisconnected", { userId });
    socket.leave(roomId);
  }
});

socket.on("sendMessage", ({ message, userName, time }) => {
  socket.broadcast.to(socket.roomId).emit("receiveMessage", {
    message,
    userName,
    time,
  });
});

    // WebRTC signaling (video/audio)
    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', { from: socket.id, data });
    });

    // Kick user from room (by owner)
    socket.on('kickUser', ({ roomId, targetUserId }) => {
      const ownerId = roomOwners[roomId];
      if (socket.userId !== ownerId) {
        return socket.emit('kickFailed', 'Only the room owner can kick users.');
      }

      const targetUser = roomUsers[roomId]?.find(u => u.userId === targetUserId);
      if (targetUser) {
        const targetSocket = io.sockets.sockets.get(targetUser.socketId);
        if (targetSocket) {
          targetSocket.emit('kicked');
          targetSocket.leave(roomId);
        }

        // Remove kicked user from list
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== targetUserId);

        io.to(roomId).emit('roomUsers', {
          users: roomUsers[roomId],
          ownerId,
        });

        io.to(roomId).emit('userKicked', { userId: targetUserId });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      const { roomId, userId } = socket;
      if (!roomId || !roomUsers[roomId]) return;

      roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
      io.to(roomId).emit('roomUsers', {
        users: roomUsers[roomId],
        ownerId: roomOwners[roomId],
      });

      io.to(roomId).emit('userLeft', { userId, socketId: socket.id });

      // If owner leaves, you can optionally transfer ownership or delete the room
      if (roomOwners[roomId] === userId) {
        if (roomUsers[roomId].length > 0) {
          roomOwners[roomId] = roomUsers[roomId][0].userId; // new owner
        } else {
          delete roomOwners[roomId];
          delete roomUsers[roomId];
        }
      }
    });
  });
};
