
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
    res.status(200).json({ success: true, user: { 
      _id: user._id,
      name: user.name, 
      photo: user.photo, 
      joinDate: user.joinDate,
      likes: user.likes,
      sessions: user.sessions,
      stats: user.stats,
      bio: user.bio,
      location: user.location,
      nativeLanguages: user.nativeLanguages,
      learningLanguages: user.learningLanguages,
      followers: user.followers,
      following: user.following,
      friends: user.friends,
      likedBy: user.likedBy
    } });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT endpoint to edit user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { displayName, bio, location, nativeLanguages, learningLanguages } = req.body;

    // Validate input (basic validation)
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
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

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully', 
      user: {
        name: user.name,
        bio: user.bio,
        location: user.location,
        nativeLanguages: user.nativeLanguages,
        learningLanguages: user.learningLanguages
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update notification preferences
exports.updateNotificationPrefs = async (req, res) => {
  try {
    const userId = req.userId;
    const notificationSettings = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update notification preferences
    user.notificationPrefs = {
      emailNotifications: notificationSettings.emailNotifications || false,
      appNotifications: notificationSettings.messages || true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      notificationPrefs: user.notificationPrefs
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update privacy preferences
exports.updatePrivacyPrefs = async (req, res) => {
  try {
    const userId = req.userId;
    const privacySettings = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update privacy preferences
    user.privacyPrefs = {
      showProfilePicture: privacySettings.profileVisibility === 'public',
      showActivityStatus: privacySettings.showOnlineStatus || true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Privacy preferences updated successfully',
      privacyPrefs: user.privacyPrefs
    });
  } catch (error) {
    console.error('Error updating privacy preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update audio/video preferences
exports.updateAudioVideoPrefs = async (req, res) => {
  try {
    const userId = req.userId;
    const audioSettings = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update audio/video preferences
    user.audioVideoPrefs = {
      preferredMic: audioSettings.preferredMic || '',
      preferredSpeaker: audioSettings.preferredSpeaker || '',
      autoAdjustVolume: audioSettings.echoCancellation || true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Audio/Video preferences updated successfully',
      audioVideoPrefs: user.audioVideoPrefs
    });
  } catch (error) {
    console.error('Error updating audio/video preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update appearance preferences
exports.updateAppearancePrefs = async (req, res) => {
  try {
    const userId = req.userId;
    const appearanceSettings = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update appearance preferences
    user.appearancePrefs = {
      darkMode: appearanceSettings.darkMode || false,
      language: appearanceSettings.language || 'en',
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Appearance preferences updated successfully',
      appearancePrefs: user.appearancePrefs
    });
  } catch (error) {
    console.error('Error updating appearance preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

// Follow user
exports.followUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    // Add to following/followers
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.json({ success: true, message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add friend
exports.addFriend = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot add yourself as friend' });
    }

    const userToAdd = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToAdd || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already friends with this user' });
    }

    // Add to friends (mutual)
    currentUser.friends.push(userId);
    userToAdd.friends.push(currentUserId);

    await currentUser.save();
    await userToAdd.save();

    res.json({ success: true, message: 'Friend added successfully' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;

    const userToRemove = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToRemove || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from friends (mutual)
    currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
    userToRemove.friends = userToRemove.friends.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToRemove.save();

    res.json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
