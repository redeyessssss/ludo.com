const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// Get leaderboard with real user data
router.get('/', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;
    
    // Get users from database
    const users = await userService.getLeaderboard(parseInt(limit) * 2); // Get more for filtering
    
    // Filter by timeframe
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    let filteredUsers = users.filter(user => !user.isGuest && user.gamesPlayed > 0);
    
    if (timeframe === 'daily') {
      filteredUsers = filteredUsers.filter(user => {
        return user.lastGame && (now - user.lastGame < oneDayMs);
      });
    } else if (timeframe === 'weekly') {
      filteredUsers = filteredUsers.filter(user => {
        return user.lastGame && (now - user.lastGame < oneWeekMs);
      });
    }
    
    // Format leaderboard
    const leaderboard = filteredUsers
      .slice(0, parseInt(limit))
      .map((user, index) => ({
        id: user.id,
        username: user.username,
        rating: user.rating || 1000,
        wins: user.wins || 0,
        losses: user.losses || 0,
        gamesPlayed: user.gamesPlayed || 0,
        level: user.level || 1,
        avatar: user.avatar || null,
        rank: index + 1,
        winRate: user.gamesPlayed > 0 
          ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) 
          : 0,
      }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;

    const users = await userService.getLeaderboard(1000);
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    let filteredUsers = users.filter(user => !user.isGuest && user.gamesPlayed > 0);
    
    if (timeframe === 'daily') {
      filteredUsers = filteredUsers.filter(user => {
        return user.lastGame && (now - user.lastGame < oneDayMs);
      });
    } else if (timeframe === 'weekly') {
      filteredUsers = filteredUsers.filter(user => {
        return user.lastGame && (now - user.lastGame < oneWeekMs);
      });
    }
    
    const rank = filteredUsers.findIndex(u => u.id === userId) + 1;

    if (rank === 0) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.json({
      rank,
      total: filteredUsers.length,
      percentile: ((filteredUsers.length - rank) / filteredUsers.length) * 100,
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
