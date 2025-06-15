
const chatSocket = require('./chatSocket');

module.exports = (io) => {
  // Initialize room socket functionality
  const roomSocketHandler = require('./roomSocket')(io);
  
  // Initialize chat socket functionality
  chatSocket(io);
  
  return roomSocketHandler;
};
