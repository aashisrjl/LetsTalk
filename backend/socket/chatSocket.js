
module.exports = (io) => {
  const onlineUsers = new Map(); // Map userId to socketId
  const userChats = new Map(); // Map conversation ID to message history

  io.on('connection', (socket) => {
    console.log('🔌 Chat client connected:', socket.id);

    // User comes online
    socket.on('userOnline', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} is now online`);
    });

    // Join a private chat room
    socket.on('joinPrivateChat', ({ userId, friendId }) => {
      const chatRoomId = [userId, friendId].sort().join('-');
      socket.join(chatRoomId);
      socket.chatRoomId = chatRoomId;
      console.log(`💬 User ${userId} joined chat with ${friendId}`);
      
      // Send chat history if exists
      const chatHistory = userChats.get(chatRoomId) || [];
      socket.emit('chatHistory', { messages: chatHistory });
    });

    // Send private message
    socket.on('sendPrivateMessage', ({ fromUserId, toUserId, message }) => {
      const chatRoomId = [fromUserId, toUserId].sort().join('-');
      const messageData = {
        id: Date.now().toString(),
        fromUserId,
        toUserId,
        message,
        timestamp: new Date().toISOString(),
      };

      // Store message in memory (in production, save to database)
      if (!userChats.has(chatRoomId)) {
        userChats.set(chatRoomId, []);
      }
      userChats.get(chatRoomId).push(messageData);

      // Send to both users in the chat room
      io.to(chatRoomId).emit('receivePrivateMessage', messageData);
      console.log(`📨 Message sent from ${fromUserId} to ${toUserId}`);
    });

    // Leave private chat
    socket.on('leavePrivateChat', ({ chatRoomId }) => {
      socket.leave(chatRoomId);
      console.log(`👋 User left chat room ${chatRoomId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`🔌 Chat client disconnected: ${socket.userId}`);
      }
    });
  });

  return { onlineUsers, userChats };
};
