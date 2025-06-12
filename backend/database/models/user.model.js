const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { 
    type: String, 
    default: 'english'
  }
});

const userSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['google', 'facebook'],
    required: true,
  },
  providerId: {
    type: String,
    required: true,
    unique: true,
  },

  name: String,             // Display name
  email: String,
  photo: String,            // Profile photo URL

  joinDate: {
    type: Date,
    default: Date.now,
  },

  // Stats
  likes: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  stats: {
    weeklySessions: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    languagesPracticed: { type: Number, default: 0 },
  },

  // Notifications, Privacy, Audio/Video, Appearance
  notificationPrefs: {
    emailNotifications: { type: Boolean, default: true },
    appNotifications: { type: Boolean, default: true },
  },
  privacyPrefs: {
    showProfilePicture: { type: Boolean, default: true },
    showActivityStatus: { type: Boolean, default: true },
  },
  audioVideoPrefs: {
    preferredMic: String,
    preferredSpeaker: String,
    autoAdjustVolume: { type: Boolean, default: true },
  },
  appearancePrefs: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
  },
  recentActivity:[
    {
      type: {
        type: String, // e.g., 'session', 'message', 'profileUpdate'
        required: true
      },
      timestamp: { type: Date, default: Date.now },
      details: String // Additional details about the activity
    }
  ],
  bio:{
    type: String,
    maxlength: 500, // Limit bio length
    default: 'Language enthusiast passionate about connecting cultures through conversation.'
  },
  location: {
    type: String,
    maxlength: 100, // Limit location length
    default: 'Global Citizen'
  },
  nativeLanguages: [{
    type: languageSchema,
    required: true
  }],
  learningLanguages: [{
    type: languageSchema,
    required: true
  }],
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('User', userSchema);    
