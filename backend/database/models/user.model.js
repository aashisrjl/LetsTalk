const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
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

  bio: String,
  location: String,

  nativeLanguages: [languageSchema],
  learningLanguages: [languageSchema],

  joinDate: {
    type: Date,
    default: Date.now,
  },

  // Stats
  rating: { type: Number, default: 0 },
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
});

module.exports = mongoose.model('User', userSchema);    
