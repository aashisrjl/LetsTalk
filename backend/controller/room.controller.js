const Room = require('../database/models/room.model');
const generateRoomId = require('../utils/generateRoomId'); // you’ll create this function

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { title, description, language, maxParticipants, private, tags, supports, topic } = req.body;
    const createdBy = req.user.id; // assuming you're using JWT middleware to extract user

    const roomId = generateRoomId(); // e.g., "CR947"

    const newRoom = new Room({
      roomId,
      title,
      topic,
      description,
      language,
      maxParticipants,
      private,
      tags,
      supports,
      createdBy
    });

    await newRoom.save();

    res.status(201).json({ success: true, room: newRoom });
  } catch (err) {
    console.error('Room creation error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all public rooms
exports.getPublicRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ private: false, isActive: true }).populate('createdBy', 'name');
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
