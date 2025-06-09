
const express = require('express');
const session = require('express-session');
const passport = require('./services/passport');
const app = express();
const port = process.env.PORT || 3000;

//env configuration
const env = require('dotenv');
env.config();

//cors origin configuration
const cors = require('cors');
corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

//body parser configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});

// Import routes
const userRoutes = require('./routes/user.routes');

// Use routes
app.use('/', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 Not Found middleware
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Import mongoose for MongoDB connection
const mongoose = require('mongoose');
const dbURI = process.env.mongoURI ;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Export the app for testing purposes
module.exports = app;
