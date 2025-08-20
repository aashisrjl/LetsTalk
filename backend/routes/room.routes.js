const express = require('express');
const router = express.Router();
const { createRoom, getPublicRooms, getRoomById, deleteRoom, getLiveRooms, getFeaturedRooms, countAllRooms } = require('../controller/room.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.post('/rooms', isAuthenticated, createRoom);
router.get("/rooms/count", countAllRooms);
router.get('/rooms/featured', getFeaturedRooms);   
router.get('/rooms/live', getLiveRooms);           
router.get('/rooms', getPublicRooms);
router.get('/rooms/:roomId', isAuthenticated, getRoomById); 
router.delete('/rooms/:roomId', isAuthenticated, deleteRoom);


module.exports = router;
