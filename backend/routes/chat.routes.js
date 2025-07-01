
const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

// Get recent conversations
router.get('/chat/conversations', isAuthenticated, chatController.getRecentConversations);

// Get chat messages with specific user
router.get('/chat/:userId', isAuthenticated, chatController.getChatMessages);

// Send message to specific user
router.post('/chat/:userId', isAuthenticated, chatController.sendChatMessage);

module.exports = router;
