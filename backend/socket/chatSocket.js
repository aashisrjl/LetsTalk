
const Message = require('../database/models/message.model');

module.exports = (io) => {
  const onlineUsers = new Map(); // Map userId to socketId

  io.on('connection', (socket) => {
    console.log('🔌 Chat client connected:', socket.id);

    // User comes online
    socket.on('userOnline', ({ userId }) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} is now online`);
    });

    // Join a private chat room
    socket.on('joinPrivateChat', async ({ userId, friendId }) => {
      const chatRoomId = [userId, friendId].sort().join('-');
      socket.join(chatRoomId);
      socket.chatRoomId = chatRoomId;
      console.log(`💬 User ${userId} joined chat with ${friendId}`);
      
      try {
        // Fetch chat history from database
        const chatHistory = await Message.find({ chatRoomId })
          .sort({ timestamp: 1 })
          .limit(50) // Limit to last 50 messages
          .populate('fromUserId', 'name photo')
          .populate('toUserId', 'name photo');

        const formattedMessages = chatHistory.map(msg => ({
          id: msg._id.toString(),
          fromUserId: msg.fromUserId._id.toString(),
          toUserId: msg.toUserId._id.toString(),
          message: msg.message,
          timestamp: msg.timestamp.toISOString(),
          isRead: msg.isRead,
        }));

        socket.emit('chatHistory', { messages: formattedMessages });
      } catch (error) {
        console.error('Error fetching chat history:', error);
        socket.emit('chatHistory', { messages: [] });
      }
    });

    // Send private message
    socket.on('sendPrivateMessage', async ({ fromUserId, toUserId, message }) => {
      const chatRoomId = [fromUserId, toUserId].sort().join('-');
      
      try {
        // Save message to database
        const newMessage = new Message({
          fromUserId,
          toUserId,
          message: message.trim(),
          chatRoomId,
          timestamp: new Date(),
        });

        const savedMessage = await newMessage.save();
        await savedMessage.populate('fromUserId', 'name photo');
        await savedMessage.populate('toUserId', 'name photo');

        const messageData = {
          id: savedMessage._id.toString(),
          fromUserId: savedMessage.fromUserId._id.toString(),
          toUserId: savedMessage.toUserId._id.toString(),
          message: savedMessage.message,
          timestamp: savedMessage.timestamp.toISOString(),
          isRead: savedMessage.isRead,
        };

        // Send to both users in the chat room
        io.to(chatRoomId).emit('receivePrivateMessage', messageData);
        console.log(`📨 Message sent from ${fromUserId} to ${toUserId} and saved to DB`);

      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('markMessagesRead', async ({ chatRoomId, userId }) => {
      try {
        await Message.updateMany(
          { 
            chatRoomId, 
            toUserId: userId, 
            isRead: false 
          },
          { isRead: true }
        );
        console.log(`✓ Messages marked as read for user ${userId} in chat ${chatRoomId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
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

  return { onlineUsers };
};
