const express = require('express');
const router = express.Router();
const { createRoom, getPublicRooms, getRoomById, deleteRoom, getLiveRooms } = require('../controller/room.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.post('/rooms', isAuthenticated,createRoom);
router.get('/rooms', getPublicRooms);
router.get('/rooms/:roomId',isAuthenticated,getRoomById);
router.get('/rooms/live', getLiveRooms);
router.delete('/rooms/:roomId', isAuthenticated, deleteRoom);

module.exports = router;
