
module.exports = (io) => {
  // Initialize room socket functionality
  const roomSocketHandler = require('./roomSocket')(io);
  
  return roomSocketHandler;
};
