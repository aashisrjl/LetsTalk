
const { createNotification } = require('../controller/notification.controller');

// Create notification when user joins a room
const notifyRoomJoin = async (roomId, userId, userName) => {
  try {
    // This could be enhanced to notify room participants
    // For now, we'll create a system notification for the user
    await createNotification(
      userId,
      null, // system notification
      'session',
      'Room Joined Successfully',
      `You have successfully joined the language practice room: ${roomId}`,
      { roomId, action: 'join' }
    );
    console.log(`Notification created for user ${userName} joining room ${roomId}`);
  } catch (error) {
    console.error('Error creating room join notification:', error);
  }
};

// Create notification for friend requests
const notifyFriendRequest = async (recipientId, senderId, senderName) => {
  try {
    await createNotification(
      recipientId,
      senderId,
      'friend',
      'New Friend Request',
      `${senderName} sent you a friend request`,
      { senderId, action: 'friend_request' }
    );
    console.log(`Friend request notification sent to ${recipientId} from ${senderName}`);
  } catch (error) {
    console.error('Error creating friend request notification:', error);
  }
};

// Create notification for messages
const notifyNewMessage = async (recipientId, senderId, senderName, roomId) => {
  try {
    await createNotification(
      recipientId,
      senderId,
      'message',
      'New Message',
      `${senderName} sent you a message in the room`,
      { roomId, senderId, action: 'new_message' }
    );
    console.log(`Message notification sent to ${recipientId} from ${senderName}`);
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
};

// Create notification for session reminders
const notifySessionReminder = async (userId, roomId, roomTitle) => {
  try {
    await createNotification(
      userId,
      null, // system notification
      'session',
      'Session Reminder',
      `Your language practice session "${roomTitle}" is starting soon`,
      { roomId, action: 'session_reminder' }
    );
    console.log(`Session reminder sent to user ${userId} for room ${roomId}`);
  } catch (error) {
    console.error('Error creating session reminder notification:', error);
  }
};

module.exports = {
  notifyRoomJoin,
  notifyFriendRequest,
  notifyNewMessage,
  notifySessionReminder
};
