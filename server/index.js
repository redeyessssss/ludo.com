const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io setup
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎲 Ludo server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

module.exports = { app, server, io };
