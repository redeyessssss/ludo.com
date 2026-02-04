// Ludo Game Engine (Server-side) - Enhanced Version
const COLORS = ['red', 'blue', 'green', 'yellow'];
const TOKENS_PER_PLAYER = 4;
const BOARD_SIZE = 52; // Main path positions
const FINISH_AREA = 6; // Finish area positions

class LudoGameEngine {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.diceValue = null;
    this.gameState = 'waiting';
    this.tokens = this.initializeTokens();
    this.winner = null;
    this.moveHistory = [];
    this.consecutiveSixes = 0; // Track consecutive 6s
    this.playerStats = this.initializeStats();
  }

  initializeTokens() {
    const tokens = {};
    this.players.forEach((player, index) => {
      const color = COLORS[index];
      tokens[player.id] = {
        color,
        tokens: [
          { id: 0, position: -1, isHome: true, isSafe: false, captureCount: 0 },
          { id: 1, position: -1, isHome: true, isSafe: false, captureCount: 0 },
          { id: 2, position: -1, isHome: true, isSafe: false, captureCount: 0 },
          { id: 3, position: -1, isHome: true, isSafe: false, captureCount: 0 },
        ],
      };
    });
    return tokens;
  }

  initializeStats() {
    const stats = {};
    this.players.forEach(player => {
      stats[player.id] = {
        capturesCount: 0,
        tokensCaptured: 0,
        tokensInFinish: 0,
        turnsPlayed: 0,
      };
    });
    return stats;
  }

  rollDice() {
    // Better dice distribution for thrilling gameplay
    // 6 appears more frequently (30% chance instead of 16.7%)
    const rand = Math.random();
    if (rand < 0.30) {
      this.diceValue = 6; // 30% chance for 6
    } else if (rand < 0.55) {
      this.diceValue = Math.floor(Math.random() * 5) + 1; // 1-5
    } else {
      this.diceValue = Math.floor(Math.random() * 6) + 1; // 1-6
    }
    
    return this.diceValue;
  }

  canMoveToken(playerId, tokenId) {
    const token = this.tokens[playerId].tokens[tokenId];
    
    if (this.players[this.currentPlayerIndex].id !== playerId) {
      return false;
    }

    if (!this.diceValue) {
      return false;
    }

    // Token in home - can move with any number (not just 6)
    if (token.position === -1) {
      return true; // Allow any dice value to move out
    }

    // Token already finished
    if (token.position >= BOARD_SIZE + FINISH_AREA) {
      return false;
    }

    // Can move if it doesn't overshoot
    if (token.position + this.diceValue > BOARD_SIZE + FINISH_AREA) {
      return false;
    }

    return true;
  }

  moveToken(playerId, tokenId) {
    if (!this.canMoveToken(playerId, tokenId)) {
      return { success: false, message: 'Invalid move' };
    }

    const token = this.tokens[playerId].tokens[tokenId];
    const oldPosition = token.position;
    const captured = [];
    let bonus = 0;

    // Move token
    if (token.position === -1) {
      // Moving out of home
      token.position = 0;
      token.isHome = false;
      token.isSafe = this.isSafePosition(0);
    } else {
      token.position += this.diceValue;
      token.isSafe = this.isSafePosition(token.position);
    }

    // Check for captures (only on main path, not in finish area)
    if (token.position < BOARD_SIZE && !token.isSafe) {
      const capturedTokens = this.checkCaptures(playerId, token.position);
      captured.push(...capturedTokens);
      
      // Bonus points for captures
      if (captured.length > 0) {
        bonus = captured.length * 10;
        this.playerStats[playerId].capturesCount += captured.length;
      }
    }

    // Update finish area stats
    if (token.position >= BOARD_SIZE) {
      this.playerStats[playerId].tokensInFinish = this.tokens[playerId].tokens.filter(
        t => t.position >= BOARD_SIZE
      ).length;
    }

    // Record move
    this.moveHistory.push({
      playerId,
      tokenId,
      from: oldPosition,
      to: token.position,
      diceValue: this.diceValue,
      captured,
      bonus,
      timestamp: Date.now(),
    });

    // Check win
    const hasWon = this.checkWin(playerId);
    if (hasWon) {
      this.winner = playerId;
      this.gameState = 'finished';
    }

    // Determine if player gets extra turn
    let extraTurn = false;
    let reason = '';

    if (this.diceValue === 6) {
      extraTurn = true;
      reason = 'rolled_six';
      this.consecutiveSixes++;
      
      // Limit consecutive 6s to 3 (after 3 sixes, turn passes)
      if (this.consecutiveSixes >= 3) {
        extraTurn = false;
        this.consecutiveSixes = 0;
        reason = 'three_sixes_limit';
      }
    } else {
      this.consecutiveSixes = 0;
      
      if (captured.length > 0) {
        extraTurn = true;
        reason = 'captured_token';
      }
    }

    // Move to next turn if no extra turn
    if (!extraTurn) {
      this.nextTurn();
    }

    this.playerStats[playerId].turnsPlayed++;
    this.diceValue = null;

    return {
      success: true,
      captured,
      extraTurn,
      reason,
      bonus,
      winner: this.winner,
    };
  }

  isSafePosition(position) {
    // More safe positions for balanced gameplay
    // Safe positions: 0, 8, 13, 21, 26, 34, 39, 47, 52+ (finish area)
    const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];
    
    // Finish area is always safe
    if (position >= BOARD_SIZE) {
      return true;
    }
    
    return safePositions.includes(position);
  }

  checkCaptures(playerId, position) {
    const captured = [];
    
    Object.keys(this.tokens).forEach((opponentId) => {
      if (opponentId === playerId) return;
      
      this.tokens[opponentId].tokens.forEach((token, index) => {
        if (token.position === position && !token.isSafe) {
          token.position = -1;
          token.isHome = true;
          token.isSafe = false;
          this.playerStats[opponentId].tokensCaptured++;
          captured.push({ playerId: opponentId, tokenId: index });
        }
      });
    });

    return captured;
  }

  checkWin(playerId) {
    // All tokens must reach finish area (position 52-57)
    return this.tokens[playerId].tokens.every(
      token => token.position >= BOARD_SIZE + FINISH_AREA
    );
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.consecutiveSixes = 0; // Reset consecutive sixes counter
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getGameState() {
    return {
      players: this.players,
      tokens: this.tokens,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayer: this.getCurrentPlayer(),
      diceValue: this.diceValue,
      gameState: this.gameState,
      winner: this.winner,
      moveHistory: this.moveHistory,
      playerStats: this.playerStats,
      consecutiveSixes: this.consecutiveSixes,
    };
  }

  // Get available moves for current player
  getAvailableMoves(playerId) {
    if (this.players[this.currentPlayerIndex].id !== playerId || !this.diceValue) {
      return [];
    }

    const availableMoves = [];
    const playerTokens = this.tokens[playerId].tokens;

    playerTokens.forEach((token, index) => {
      if (this.canMoveToken(playerId, index)) {
        availableMoves.push(index);
      }
    });

    return availableMoves;
  }
}

module.exports = { LudoGameEngine };
