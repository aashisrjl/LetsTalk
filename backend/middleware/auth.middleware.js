
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

const optionalAuth = (req, res, next) => {
  // This middleware allows both authenticated and non-authenticated requests
  next();
};

module.exports = {
  isAuthenticated,
  optionalAuth
};
