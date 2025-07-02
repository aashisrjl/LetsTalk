
const Notification = require('../database/models/notification.model');
const User = require('../database/models/user.model');
const catchAsyncError = require('../services/catchAsyncError');

// Get all notifications for a user
const getUserNotifications = catchAsyncError(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'name photo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ 
    recipient: userId, 
    read: false 
  });

  const totalCount = await Notification.countDocuments({ recipient: userId });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  });
});

// Mark notification as read
const markNotificationAsRead = catchAsyncError(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    notification
  });
});

// Mark all notifications as read
const markAllNotificationsAsRead = catchAsyncError(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Delete notification
const deleteNotification = catchAsyncError(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// Create notification helper function
const createNotification = async (recipientId, senderId, type, title, description, data = {}) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      description,
      data
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// API endpoint to create notification from frontend
const createNotificationAPI = catchAsyncError(async (req, res) => {
  const { recipientId, type, title, description, data } = req.body;
  const senderId = req.user.id;

  if (!recipientId || !type || !title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: recipientId, type, title, description'
    });
  }

  const notification = await createNotification(recipientId, senderId, type, title, description, data);

  if (!notification) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }

  res.status(201).json({
    success: true,
    notification,
    currentUserName: req.user.name
  });
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  createNotificationAPI
};
