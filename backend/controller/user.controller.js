
const { User2 } = require("lucide-react");
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

exports.getUserProfileData = async (req,res)=>{
  const userId = req.user.id; // Assuming you have user ID in req.user
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
    
  }
}

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Only return name and photo
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, photo: user.photo, 
      joinDate: user.joinDate, // Include join date if needed
      likes: user.likes, // Include likes count if needed
      sessions: user.sessions, // Include sessions count if needed
      stats: user.stats, // Include stats if needed
      bio: user.bio, // Include bio if needed
      location: user.location, // Include location if needed
      nativeLanguages: user.nativeLanguages, // Include native languages if needed
      learningLanguages: user.learningLanguages // Include learning languages if needed
      
    } });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT endpoint to edit user profile
exports.updateUserProfile =  async (req, res) => {
  try {
    const userId = req.userId;
    const { displayName, bio, location, nativeLanguages, learningLanguages } = req.body;

    // Validate input (basic validation)
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (displayName) user.name = displayName;
    if (bio) user.bio = bio;
    if (location) user.location = location;

    // Update nativeLanguages if provided
    if (nativeLanguages && Array.isArray(nativeLanguages)) {
      user.nativeLanguages = nativeLanguages.map(lang => ({
        name: lang.name,
        level: lang.level || 'english' // Default to 'english' if level not provided
      }));
    }

    // Update learningLanguages if provided
    if (learningLanguages && Array.isArray(learningLanguages)) {
      user.learningLanguages = learningLanguages.map(lang => ({
        name: lang.name,
        level: lang.level || 'english' // Default to 'english' if level not provided
      }));
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user: {
      name: user.name,
      bio: user.bio,
      location: user.location,
      nativeLanguages: user.nativeLanguages,
      learningLanguages: user.learningLanguages
    }});
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//count all users
exports.countAllUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.status(200).json({ success: true, count: userCount });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller for liking a user
exports.likeUser = async (req, res) => {
  try {
    console.log('Rate user request received');
    const userId = req.params.userId; // Get user ID from request parameters

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the current user has already liked (optional, requires user session)
    if (req.user && user.likedBy && user.likedBy.includes(req.userId)) {
      return res.status(400).json({ success: false, message: 'You have already liked this user' });
    }

    // Increment the rating (like count)
    user.likes += 1;

    // Optionally track who liked (requires likedBy array in schema)
    if (req.user) {
      user.likedBy = user.likedBy || [];
      user.likedBy.push(req.userId);
    }

    // Save the updated user
    await user.save();

    // Return limited user data
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Rate user error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};