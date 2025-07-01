
module.exports = (io) => {
  // Initialize room socket functionality
  const roomSocketHandler = require('./roomSocket')(io);
  
  // Initialize chat socket functionality
  const chatSocketHandler = require('./chatSocket')(io);
  
  return {
    room: roomSocketHandler,
    chat: chatSocketHandler
  };
};
