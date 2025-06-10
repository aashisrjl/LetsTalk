// ✅ Load environment variables first
require('dotenv').config();

const express = require('express');
const http = require('http');
const passport = require('./services/passport');
const socketIO = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Database connection
const connectToDatabase = require('./database/connection');
connectToDatabase().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Middleware
app.use(passport.initialize());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the backend server!');
});

// Routes
const userRoutes = require('./routes/user.routes');
const roomRoutes = require('./routes/room.routes');
app.use('/', roomRoutes);
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

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
});
require('./socket/roomSocket')(io);

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please free it up.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

module.exports = { app, server };