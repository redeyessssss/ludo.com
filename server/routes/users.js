const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

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
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = {};
    const allowedFields = ['username', 'avatar', 'bio'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        allowedUpdates[field] = updates[field];
      }
    });

    const updatedUser = await userService.updateUser(userId, allowedUpdates);

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);

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
router.get('/:userId/matches', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    const user = await userService.getUserById(userId);

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
