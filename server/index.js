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

// Clean CLIENT_URL (remove trailing slash, quotes, and whitespace)
const clientURL = (process.env.CLIENT_URL || 'http://localhost:5173')
  .trim()
  .replace(/^["']|["']$/g, '') // Remove quotes
  .replace(/\/$/, ''); // Remove trailing slash

const io = new Server(server, {
  cors: {
    origin: clientURL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

console.log(`🌐 CORS enabled for: ${clientURL}`);

// Middleware
app.use(cors({
  origin: clientURL,
  credentials: true,
}));
app.use(express.json());

// Share users map between routes
userRoutes.setUsers(authRoutes.users);
leaderboardRoutes.setUsers(authRoutes.users);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io setup - pass users map for rating updates
setupSocketHandlers(io, authRoutes.users);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎲 Ludo server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

module.exports = { app, server, io };
