
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