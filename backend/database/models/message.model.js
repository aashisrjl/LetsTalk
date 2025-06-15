
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  chatRoomId: {
    type: String,
    required: true,
  },
});

// Index for efficient queries
messageSchema.index({ chatRoomId: 1, timestamp: -1 });
messageSchema.index({ fromUserId: 1, toUserId: 1 });

module.exports = mongoose.model('Message', messageSchema);
