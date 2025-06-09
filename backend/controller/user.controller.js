
const { errorHandler } = require('../services/catchAsyncError');

const getUserProfile = errorHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      avatar: req.user.photos?.[0]?.value,
      provider: req.user.provider
    }
  });
});

const updateUserProfile = errorHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  const { displayName, bio, location } = req.body;

  // Here you would typically update the user in your database
  // For now, we'll just return success
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: req.user.id,
      displayName: displayName || req.user.displayName,
      bio,
      location
    }
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile
};
