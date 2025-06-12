const Room = require('../database/models/room.model');
const User = require('../database/models/user.model');

module.exports = (io) => {
  const roomUsers = {}; // { roomId: [{ socketId, userId, userName, joinTime }] }
  const roomOwners = {}; // { roomId: ownerUserId }
  const sessionStartTimes = {}; // { socketId: startTime }

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

   socket.on("joinRoom", async ({ roomId, userId, userName, roomTitle }) => {
  socket.join(roomId);
  socket.roomId = roomId;
  socket.userId = userId;
  socket.userName = userName;

  if (!roomUsers[roomId]) roomUsers[roomId] = [];
  if (!roomOwners[roomId]) {
    roomOwners[roomId] = userId;
    await Room.findOneAndUpdate({ roomId }, { createdBy: userId, title: roomTitle }, { upsert: true });
  }

  const user = await User.findById(userId).select("name photo stats");
  const userData = { socketId: socket.id, userId, userName: user.name, photo: user.photo, joinTime: new Date() };
  if (!roomUsers[roomId].some(u => u.userId === userId)) {
    roomUsers[roomId].push(userData);
    await Room.findOneAndUpdate(
      { roomId },
      { $addToSet: { participants: userId } },
      { upsert: true }
    );
  }

  // Increment session count at root level
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { sessions: 1 } }, // Updated to increment root-level sessions
    { new: true, select: "sessions" }
  );

  // Start tracking session time
  sessionStartTimes[socket.id] = new Date();

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

  socket.to(roomId).emit("userConnected", { userId, socketId: socket.id });

  // Add to recent activity with room title
  await User.findByIdAndUpdate(userId, {
    $push: { recentActivity: { type: 'session', timestamp: new Date(), details: roomTitle } }
  });
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

    socket.on("leaveRoom", async ({ roomId, userId }) => {
      if (!roomUsers[roomId]) return;

      const userIndex = roomUsers[roomId].findIndex(u => u.userId === userId);
      if (userIndex !== -1) {
        const joinTime = roomUsers[roomId][userIndex].joinTime;
        const leaveTime = new Date();
        const sessionDurationMs = leaveTime - joinTime;
        const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);

        // Update user stats (optional duration tracking can be re-enabled if needed)
        const user = await User.findById(userId);
        if (user) {
          user.stats.totalHours = (user.stats.totalHours || 0) + sessionDurationHours;
          await user.save();
        }

        // Remove user from memory
        roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== userId);

        // Notify remaining users about the updated room list
        io.to(roomId).emit("roomUsers", {
          users: roomUsers[roomId],
          ownerId: roomOwners[roomId],
        });

        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.participants.pull(userId);
            await room.save();

            const isEmpty = roomUsers[roomId].length === 0;
            if (isEmpty) {
              await Room.deleteOne({ roomId });
              delete roomUsers[roomId];
              delete roomOwners[roomId];
              console.log(`Room ${roomId} deleted because it's empty.`);
            }
          }
        } catch (err) {
          console.error("Error handling room cleanup:", err);
        }

        socket.to(roomId).emit("userDisconnected", { userId });
        delete sessionStartTimes[socket.id];
      }
      socket.leave(roomId);
    });

    socket.on("sendMessage", ({ message, userName, time }) => {
      socket.broadcast.to(socket.roomId).emit("receiveMessage", {
        message,
        userName,
        time,
      });
    });

    socket.on('signal', ({ to, data }) => {
      io.to(to).emit('signal', { from: socket.id, data });
    });

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

        roomUsers[roomId] = roomUsers[roomId].filter(u => u.userId !== targetUserId);

        io.to(roomId).emit('roomUsers', {
          users: roomUsers[roomId],
          ownerId,
        });

        io.to(roomId).emit('userKicked', { userId: targetUserId });
      }
    });

    socket.on("disconnect", async () => {
      const { roomId, userId } = socket;
      if (!roomId || !roomUsers[roomId]) return;

      const userIndex = roomUsers[roomId].findIndex(u => u.socketId === socket.id);
      if (userIndex !== -1) {
        const joinTime = roomUsers[roomId][userIndex].joinTime;
        const disconnectTime = new Date();
        const sessionDurationMs = disconnectTime - joinTime;
        const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);

        const user = await User.findById(userId);
        if (user) {
          user.stats.totalHours = (user.stats.totalHours || 0) + sessionDurationHours;
          await user.save();
        }

        roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);

        io.to(roomId).emit("roomUsers", {
          users: roomUsers[roomId],
          ownerId: roomOwners[roomId],
        });

        io.to(roomId).emit("userLeft", { userId, socketId: socket.id });

        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.participants.pull(userId);
            await room.save();

            if (room.participants.length === 0) {
              await Room.deleteOne({ roomId });
              delete roomOwners[roomId];
              delete roomUsers[roomId];
              console.log(`Room ${roomId} deleted because it's empty`);
            }
          }
        } catch (err) {
          console.error("Error during DB cleanup on disconnect:", err);
        }

        if (roomOwners[roomId] === userId) {
          if (roomUsers[roomId] && roomUsers[roomId].length > 0) {
            roomOwners[roomId] = roomUsers[roomId][0].userId;
          } else {
            delete roomOwners[roomId];
          }
        }
      }
      socket.leave(roomId);
      delete sessionStartTimes[socket.id];
    });
  });
};