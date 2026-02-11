const express = require('express');
const router = express.Router();

// Import shared users map
let users = new Map();
let matchHistory = new Map(); // Store match history

// Function to set users reference
router.setUsers = (usersMap) => {
  users = usersMap;
};

// Function to set match history reference
router.setMatchHistory = (historyMap) => {
  matchHistory = historyMap;
};

// Get leaderboard with real user data
router.get('/', (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;
    
    // Convert users map to array and filter by timeframe
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    let filteredUsers = Array.from(users.values())
      .filter(user => !user.isGuest && user.gamesPlayed > 0);
    
    // Apply timeframe filter based on recent games
    if (timeframe === 'daily') {
      filteredUsers = filteredUsers.filter(user => {
        const recentGames = (user.matchHistory || []).filter(
          match => now - match.timestamp < oneDayMs
        );
        return recentGames.length > 0;
      });
    } else if (timeframe === 'weekly') {
      filteredUsers = filteredUsers.filter(user => {
        const recentGames = (user.matchHistory || []).filter(
          match => now - match.timestamp < oneWeekMs
        );
        return recentGames.length > 0;
      });
    }
    
    // Sort by rating (descending)
    const leaderboard = filteredUsers
      .sort((a, b) => (b.rating || 1000) - (a.rating || 1000))
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
router.get('/rank/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'all' } = req.query;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    let filteredUsers = Array.from(users.values())
      .filter(user => !user.isGuest && user.gamesPlayed > 0);
    
    // Apply timeframe filter
    if (timeframe === 'daily') {
      filteredUsers = filteredUsers.filter(user => {
        const recentGames = (user.matchHistory || []).filter(
          match => now - match.timestamp < oneDayMs
        );
        return recentGames.length > 0;
      });
    } else if (timeframe === 'weekly') {
      filteredUsers = filteredUsers.filter(user => {
        const recentGames = (user.matchHistory || []).filter(
          match => now - match.timestamp < oneWeekMs
        );
        return recentGames.length > 0;
      });
    }
    
    // Sort by rating
    const sortedUsers = filteredUsers.sort((a, b) => (b.rating || 1000) - (a.rating || 1000));
    const rank = sortedUsers.findIndex(u => u.id === userId) + 1;

    if (rank === 0) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.json({
      rank,
      total: sortedUsers.length,
      percentile: ((sortedUsers.length - rank) / sortedUsers.length) * 100,
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
