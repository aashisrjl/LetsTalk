const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  language: { type: String, required: true }, // e.g., English, Spanish, Japanese

  maxParticipants: { type: Number, default: 10 },

  private: { type: Boolean, default: false },

  tags: [{ type: String }], // e.g., ['Grammar', 'Beginner', 'Culture']

  // This room is always live
  isLive: { type: Boolean, default: true },

  supports: {
    video: { type: Boolean, default: true },
    audio: { type: Boolean, default: true },
    text: { type: Boolean, default: true }
  },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
