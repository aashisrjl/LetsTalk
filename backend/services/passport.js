const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../database/models/user.model'); // Adjust the path as necessary

// Serialize and deserialize user
passport.serializeUser((user, cb) => {
    cb(null, user.id); // save only user ID in session
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (err) {
        cb(err);
    }
});

// Google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.O_CLIENT_ID,
            clientSecret: process.env.O_CLIENT_SECRET,
            callbackURL: process.env.O_CALLBACK_URL,
        },
    async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ providerId: profile.id });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
            providerId: profile.id,
            name: profile.displayName,
            provider: profile.provider,
            email: profile.emails?.[0]?.value || null,
            photo: profile.photos?.[0]?.value || null
        });

        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}
    )
);

// Facebook strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.F_CLIENT_ID,
            clientSecret: process.env.F_CLIENT_SECRET,
            callbackURL: process.env.F_CALLBACK_URL,
            profileFields: ['id', 'displayName', 'email', 'photos'],
        },
       async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ providerId: profile.id });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
            providerId: profile.id,
            name: profile.displayName,
            provider: profile.provider,
            email: profile.emails?.[0]?.value || null,
            photo: profile.photos?.[0]?.value || null
        });

        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}
    )
);

module.exports = passport;