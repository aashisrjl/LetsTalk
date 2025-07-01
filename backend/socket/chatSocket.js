
const ChatMessage = require('../database/models/chat.model');

module.exports = (io) => {
  const userSockets = new Map(); // Store user socket mappings

  io.on('connection', (socket) => {
    console.log('User connected to chat:', socket.id);

    // User joins chat with their ID
    socket.on('joinChat', (userId) => {
      console.log('User joined chat:', userId);
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      socket.join(`user_${userId}`);
    });

    // Handle private messages
    socket.on('sendPrivateMessage', async (data) => {
      try {
        const { receiverId, message, senderId } = data;
        
        // Save message to database
        const chatMessage = new ChatMessage({
          sender: senderId,
          receiver: receiverId,
          message: message.trim()
        });

        await chatMessage.save();
        await chatMessage.populate('sender', 'name photo');
        await chatMessage.populate('receiver', 'name photo');

        // Send to receiver if they're online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(`user_${receiverId}`).emit('receivePrivateMessage', {
            message: chatMessage,
            from: senderId
          });
        }

        // Confirm to sender
        socket.emit('messageConfirmed', {
          message: chatMessage,
          tempId: data.tempId
        });

      } catch (error) {
        console.error('Send private message error:', error);
        socket.emit('messageError', {
          error: 'Failed to send message',
          tempId: data.tempId
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(`user_${receiverId}`).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.id);
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });

  return {
    getUserSockets: () => userSockets
  };
};
