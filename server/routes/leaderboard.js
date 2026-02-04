const express = require('express');
const router = express.Router();

// Mock leaderboard data (replace with database queries)
const generateMockLeaderboard = (timeframe) => {
  const mockPlayers = [
    { id: '1', username: 'ProPlayer123', rating: 1850, wins: 145, losses: 32, level: 25, avatar: null },
    { id: '2', username: 'LudoMaster', rating: 1720, wins: 128, losses: 45, level: 22, avatar: null },
    { id: '3', username: 'DiceKing', rating: 1680, wins: 112, losses: 38, level: 20, avatar: null },
    { id: '4', username: 'TokenHunter', rating: 1590, wins: 98, losses: 42, level: 18, avatar: null },
    { id: '5', username: 'BoardBoss', rating: 1520, wins: 87, losses: 51, level: 16, avatar: null },
    { id: '6', username: 'QuickWinner', rating: 1480, wins: 76, losses: 44, level: 15, avatar: null },
    { id: '7', username: 'StrategyPro', rating: 1420, wins: 69, losses: 48, level: 14, avatar: null },
    { id: '8', username: 'LuckyRoller', rating: 1380, wins: 62, losses: 52, level: 13, avatar: null },
    { id: '9', username: 'GameChamp', rating: 1340, wins: 58, losses: 49, level: 12, avatar: null },
    { id: '10', username: 'TopPlayer', rating: 1300, wins: 54, losses: 46, level: 11, avatar: null },
  ];

  return mockPlayers;
};

// Get leaderboard
router.get('/', (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;

    // In production, query database with timeframe filter
    const leaderboard = generateMockLeaderboard(timeframe);

    res.json(leaderboard.slice(0, parseInt(limit)));
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

    const leaderboard = generateMockLeaderboard(timeframe);
    const rank = leaderboard.findIndex(p => p.id === userId) + 1;

    if (rank === 0) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.json({
      rank,
      total: leaderboard.length,
      percentile: ((leaderboard.length - rank) / leaderboard.length) * 100,
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
