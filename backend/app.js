// ✅ Load environment variables first
require('dotenv').config();

const express = require('express');
const passport = require('./services/passport'); // ✅ load AFTER dotenv
const app = express();
const port = process.env.PORT || 3000;

// Database connection
const connectToDatabase = require('./database/connection');
connectToDatabase();

// CORS configuration
const cors = require('cors');
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Body parser configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional (if using sessions and login)
app.use(passport.initialize());
// app.use(passport.session()); // only needed if you're using sessions

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});

// Routes
const userRoutes = require('./routes/user.routes');
app.use('/', userRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
