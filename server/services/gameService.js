// Game Service - Handles game data operations
const { db, isInitialized } = require('../config/firebase-admin');

// In-memory fallback
const inMemoryGames = new Map();

class GameService {
  constructor() {
    this.useFirebase = isInitialized;
    console.log(`GameService using: ${this.useFirebase ? 'Firebase' : 'In-Memory'} storage`);
  }

  // Save game result
  async saveGameResult(gameData) {
    const gameResult = {
      id: gameData.id || `game_${Date.now()}`,
      players: gameData.players,
      winner: gameData.winner,
      mode: gameData.mode, // quick, ranked, private, bot
      duration: gameData.duration,
      moves: gameData.moves || 0,
      captures: gameData.captures || {},
      finishedTokens: gameData.finishedTokens || {},
      ratingChanges: gameData.ratingChanges || {},
      endReason: gameData.endReason, // completed, opponents_left
      createdAt: Date.now(),
      ...gameData
    };

    if (this.useFirebase) {
      await db.collection('games').doc(gameResult.id).set(gameResult);
    } else {
      inMemoryGames.set(gameResult.id, gameResult);
    }

    return gameResult;
  }

  // Get game by ID
  async getGameById(gameId) {
    if (this.useFirebase) {
      const doc = await db.collection('games').doc(gameId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
      return inMemoryGames.get(gameId) || null;
    }
  }

  // Get user's match history
  async getUserMatchHistory(userId, limit = 20) {
    if (this.useFirebase) {
      const snapshot = await db.collection('games')
        .where('playerIds', 'array-contains', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return Array.from(inMemoryGames.values())
        .filter(game => game.players?.some(p => p.id === userId))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    }
  }

  // Get recent games (for activity feed)
  async getRecentGames(limit = 50) {
    if (this.useFirebase) {
      const snapshot = await db.collection('games')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return Array.from(inMemoryGames.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    }
  }

  // Get game statistics
  async getGameStats() {
    if (this.useFirebase) {
      const snapshot = await db.collection('games').get();
      const games = snapshot.docs.map(doc => doc.data());
      
      return {
        totalGames: games.length,
        quickPlayGames: games.filter(g => g.mode === 'quick').length,
        rankedGames: games.filter(g => g.mode === 'ranked').length,
        botGames: games.filter(g => g.mode === 'bot').length,
        privateGames: games.filter(g => g.mode === 'private').length,
      };
    } else {
      const games = Array.from(inMemoryGames.values());
      return {
        totalGames: games.length,
        quickPlayGames: games.filter(g => g.mode === 'quick').length,
        rankedGames: games.filter(g => g.mode === 'ranked').length,
        botGames: games.filter(g => g.mode === 'bot').length,
        privateGames: games.filter(g => g.mode === 'private').length,
      };
    }
  }
}

module.exports = new GameService();
