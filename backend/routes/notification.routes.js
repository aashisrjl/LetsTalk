
const express = require('express');
const { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  createNotificationAPI
} = require('../controller/notification.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/notifications', isAuthenticated, getUserNotifications);
router.post('/notifications', isAuthenticated, createNotificationAPI);
router.patch('/notifications/:notificationId/read', isAuthenticated, markNotificationAsRead);
router.patch('/notifications/mark-all-read', isAuthenticated, markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', isAuthenticated, deleteNotification);

module.exports = router;
