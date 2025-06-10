const Room = require('../database/models/room.model');

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
  if (!roomOwners[roomId]) roomOwners[roomId] = userId;

  roomUsers[roomId].push({ socketId: socket.id, userId, userName });

  // Update database
  const room = await Room.findOne({ roomId });
  if (room && !room.participants.includes(userId)) {
    room.participants.push(userId);
    await room.save();
  }

  io.to(roomId).emit("roomUsers", {
    users: roomUsers[roomId],
    ownerId: roomOwners[roomId],
  });

  socket.to(roomId).emit("userJoined", { userId, userName, socketId: socket.id });
});

    // Handle chat messages
    socket.on('sendMessage', ({ message }) => {
      const { roomId, userName } = socket;
      if (!roomId || !userName) return;

      io.to(roomId).emit('receiveMessage', {
        message,
        userName,
        time: new Date().toLocaleTimeString(),
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
