const Room = require('../database/models/room.model');
const generateRoomId = require('../utils/generateRoomId'); // you’ll create this function

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { title, description, language, maxParticipants, private: isPrivate, tags, supports, topic, level } = req.body;
    const createdBy = req.user.id;

    // Validate required fields
    if (!title || !language || !maxParticipants || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, language, maxParticipants, or createdBy',
      });
    }

    // Validate supports
    const validSupports = ['video', 'audio', 'text'];
    if (!supports || !Array.isArray(supports) || !supports.every(s => validSupports.includes(s))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid supports field: must be an array of "video", "audio", or "text"',
      });
    }

    const roomId = generateRoomId(); // e.g., "CR947"

    const newRoom = new Room({
      roomId,
      title,
      description: description || '',
      language,
      maxParticipants: parseInt(maxParticipants),
      private: !!isPrivate,
      tags: tags || [],
      supports,
      topic: topic || 'General',
      createdBy,
      level: level || 'beginner', // Include if schema supports it
    });

    await newRoom.save();

    console.log('Room created:', newRoom);

    res.status(201).json({ success: true, room: newRoom });
  } catch (err) {
    console.error('Room creation error:', err.message, err.stack);
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
};

// Get all public rooms
exports.getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ private: false, isActive: true }).populate('participants', 'photo rating name');
    res.json({ success: true, rooms });
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get room by roomId
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('createdBy', 'name');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    res.json({ success: true, room });
  } catch (err) {
    console.error('Fetch room error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
exports.getLiveRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isLive: true }).populate('createdBy', 'name');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

exports.getFeaturedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true, private: false })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name photo');

    res.json({ success: true, rooms });
  } catch (err) {
    console.error('Recent featured rooms error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};




// Delete room (owner only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.createdBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    await room.deleteOne();

    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    console.error('Delete room error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

//count all rooms
exports.countAllRooms = async (req, res) => {
  try {
    const count = await Room.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    console.error('Count rooms error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
exports.updateRoomParticipants = async (roomId, userId, action) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    if (action === 'join') {
      if (!room.participants.some(p => p.userId === userId)) {
        room.participants.push({ userId, userName: 'Unknown' });
      }
    } else if (action === 'leave') {
      room.participants = room.participants.filter(p => p.userId !== userId);
    }

    room.isLive = room.participants.length > 0;
    await room.save();
    console.log(`Updated participants for room ${roomId}:`, room.participants);
    return room;
  } catch (err) {
    console.error('Error updating room participants:', err.message, err.stack);
    throw err;
  }
};