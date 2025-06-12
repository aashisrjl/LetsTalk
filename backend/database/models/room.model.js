const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // e.g., CR947

  title: { type: String, required: true },
  description: { type: String },

  language: { type: String, required: true },

  maxParticipants: { type: Number, default: 10 },

  private: { type: Boolean, default: false },

  tags: [{ type: String }],
  
  level: { type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner' }, // beginner, intermediate, advanced

  isLive: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },

  supports: {
    video: { type: Boolean, default: true },
    audio: { type: Boolean, default: true },
    text: { type: Boolean, default: true }
  },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  createdAt: { type: Date, default: Date.now }
});

// Indexes (optional for filtering)
roomSchema.index({ language: 1 });
roomSchema.index({ tags: 1 });

module.exports = mongoose.model('Room', roomSchema);
