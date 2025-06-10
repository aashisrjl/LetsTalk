
const express = require('express');
const passport = require('../services/passport');
const generateToken = require('../utils/jwt');
const { getUserProfile } = require('../controller/user.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/auth/user',isAuthenticated,getUserProfile );
// Google callback
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['openid','profile', 'email'],
    session: false}
  )
);
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth',session: false }),
  (req, res) => {
    const token = generateToken(req.user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  }
);


router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'],session: false })
);

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth',session: false }),
  (req, res) => {
    const token = generateToken(req.user.id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  }
);


// logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  return res.status(200).json({ message: "Logout successful" });
});


module.exports = router;
