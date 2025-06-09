module.exports = function generateRoomId() {
  return 'AR' + Math.floor(100 + Math.random() * 900); // e.g., AR123
};
