const express = require('express');
const router = express.Router();

// Import shared users map from auth
let users = new Map();

// Function to set users reference
router.setUsers = (usersMap) => {
  users = usersMap;
};

// Get user profile
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = ['username', 'avatar', 'bio'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });

    users.set(userId, user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      gamesPlayed: user.gamesPlayed || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      winRate: user.gamesPlayed ? (user.wins / user.gamesPlayed) * 100 : 0,
      rating: user.rating || 1000,
      level: user.level || 1,
      tokensCaptured: user.tokensCaptured || 0,
      tokensFinished: user.tokensFinished || 0,
      highestRating: user.highestRating || user.rating || 1000,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user match history
router.get('/:userId/matches', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const matches = (user.matchHistory || [])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, parseInt(limit));

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
