
const ChatMessage = require('../database/models/chat.model');
const User = require('../database/models/user.model');

// Get chat messages between two users
exports.getChatMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name photo')
    .populate('receiver', 'name photo')
    .sort({ timestamp: 1 })
    .limit(100);

    // Mark messages as read
    await ChatMessage.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages'
    });
  }
};

// Send a chat message
exports.sendChatMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const chatMessage = new ChatMessage({
      sender: senderId,
      receiver: userId,
      message: message.trim()
    });

    await chatMessage.save();
    await chatMessage.populate('sender', 'name photo');
    await chatMessage.populate('receiver', 'name photo');

    res.json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get user's recent conversations
exports.getRecentConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.timestamp': -1 } }
    ]);

    // Populate user details
    await ChatMessage.populate(conversations, {
      path: '_id',
      select: 'name photo',
      model: 'User'
    });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};
