
const User = require("../database/models/user.model"); // Adjust the path as necessary
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  res.status(200).json({
    success: true, // Added success flag for consistency
    message: "User profile fetched",
    user: {
      id: user._id,
      name: user.name, // Ensure name is a field in your User model
      photo: user.photo, // Ensure photo is a field (e.g., URL or path)
    },
  });
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name photo'); // Only return name and photo
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, photo: user.photo } });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};