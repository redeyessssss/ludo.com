// User Service - Handles user data operations
const { db, isInitialized } = require('../config/firebase-admin');

// In-memory fallback for development
const inMemoryUsers = new Map();

class UserService {
  constructor() {
    this.useFirebase = isInitialized;
    console.log(`UserService using: ${this.useFirebase ? 'Firebase' : 'In-Memory'} storage`);
  }

  // Create a new user
  async createUser(userData) {
    const user = {
      id: userData.id || `user_${Date.now()}`,
      username: userData.username,
      email: userData.email,
      password: userData.password, // Should be hashed
      rating: 1000,
      highestRating: 1000,
      level: 1,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      tokensCaptured: 0,
      tokensFinished: 0,
      matchHistory: [],
      avatar: userData.avatar || '/default-avatar.png',
      bio: userData.bio || '',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      ...userData
    };

    if (this.useFirebase) {
      await db.collection('users').doc(user.id).set(user);
    } else {
      inMemoryUsers.set(user.id, user);
    }

    return user;
  }

  // Get user by ID
  async getUserById(userId) {
    if (this.useFirebase) {
      const doc = await db.collection('users').doc(userId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
      return inMemoryUsers.get(userId) || null;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    if (this.useFirebase) {
      const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return Array.from(inMemoryUsers.values()).find(u => u.email === email) || null;
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    if (this.useFirebase) {
      const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return Array.from(inMemoryUsers.values()).find(u => u.username === username) || null;
    }
  }

  // Update user
  async updateUser(userId, updates) {
    if (this.useFirebase) {
      await db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: Date.now()
      });
      return await this.getUserById(userId);
    } else {
      const user = inMemoryUsers.get(userId);
      if (user) {
        Object.assign(user, updates, { updatedAt: Date.now() });
        inMemoryUsers.set(userId, user);
        return user;
      }
      return null;
    }
  }

  // Update user stats after game
  async updateUserStats(userId, gameResult) {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const updates = {
      gamesPlayed: (user.gamesPlayed || 0) + 1,
      wins: user.wins + (gameResult.won ? 1 : 0),
      losses: user.losses + (gameResult.won ? 0 : 1),
      tokensCaptured: (user.tokensCaptured || 0) + (gameResult.tokensCaptured || 0),
      tokensFinished: (user.tokensFinished || 0) + (gameResult.tokensFinished || 0),
      rating: gameResult.newRating || user.rating,
      highestRating: Math.max(user.highestRating || 1000, gameResult.newRating || user.rating),
      level: this.calculateLevel(gameResult.newRating || user.rating),
      lastGame: Date.now()
    };

    // Add to match history
    if (gameResult.matchData) {
      const matchHistory = user.matchHistory || [];
      matchHistory.unshift(gameResult.matchData);
      updates.matchHistory = matchHistory.slice(0, 50); // Keep last 50 games
    }

    return await this.updateUser(userId, updates);
  }

  // Get leaderboard
  async getLeaderboard(limit = 100) {
    if (this.useFirebase) {
      const snapshot = await db.collection('users')
        .orderBy('rating', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return Array.from(inMemoryUsers.values())
        .sort((a, b) => (b.rating || 1000) - (a.rating || 1000))
        .slice(0, limit);
    }
  }

  // Calculate level based on rating
  calculateLevel(rating) {
    if (rating < 1100) return 1;
    if (rating < 1200) return 2;
    if (rating < 1300) return 3;
    if (rating < 1400) return 4;
    if (rating < 1500) return 5;
    if (rating < 1600) return 6;
    if (rating < 1700) return 7;
    if (rating < 1800) return 8;
    if (rating < 1900) return 9;
    if (rating < 2000) return 10;
    return Math.floor((rating - 2000) / 100) + 10;
  }

  // Get all users (for in-memory compatibility)
  getAllUsers() {
    if (this.useFirebase) {
      throw new Error('Use specific queries instead of getAllUsers with Firebase');
    }
    return inMemoryUsers;
  }
}

module.exports = new UserService();
