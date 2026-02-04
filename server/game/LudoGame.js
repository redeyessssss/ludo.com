// Professional Ludo Game Engine
const COLORS = ['red', 'blue', 'green', 'yellow'];
const TOKENS_PER_PLAYER = 4;
const BOARD_PATH_LENGTH = 52;
const FINISH_AREA_LENGTH = 6;
const TOTAL_POSITIONS = BOARD_PATH_LENGTH + FINISH_AREA_LENGTH;

// Safe positions on the board
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

class LudoGameEngine {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.diceValue = null;
    this.gameState = 'playing';
    this.tokens = this.initializeTokens();
    this.winner = null;
    this.moveHistory = [];
    this.consecutiveSixes = 0;
    this.playerStats = this.initializeStats();
  }

  initializeTokens() {
    const tokens = {};
    this.players.forEach((player, index) => {
      const color = COLORS[index];
      tokens[player.id] = {
        color,
        tokens: [
          { id: 0, position: -1, isHome: true },
          { id: 1, position: -1, isHome: true },
          { id: 2, position: -1, isHome: true },
          { id: 3, position: -1, isHome: true },
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
    // Standard dice: 1-6 with equal probability
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    return this.diceValue;
  }

  canMoveToken(playerId, tokenId) {
    const token = this.tokens[playerId].tokens[tokenId];
    
    // Check if it's this player's turn
    if (this.players[this.currentPlayerIndex].id !== playerId) {
      return false;
    }

    // Must have rolled dice
    if (!this.diceValue) {
      return false;
    }

    // Token in home - needs 6 to move out
    if (token.isHome) {
      return this.diceValue === 6;
    }

    // Token already finished
    if (token.position >= TOTAL_POSITIONS) {
      return false;
    }

    // Can't overshoot the finish
    if (token.position + this.diceValue > TOTAL_POSITIONS) {
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

    // Move token
    if (token.isHome) {
      token.position = 0;
      token.isHome = false;
    } else {
      token.position += this.diceValue;
    }

    // Check for captures (only on main path, not in finish area)
    if (token.position < BOARD_PATH_LENGTH && !this.isSafePosition(token.position)) {
      const capturedTokens = this.checkCaptures(playerId, token.position);
      captured.push(...capturedTokens);
      
      if (captured.length > 0) {
        this.playerStats[playerId].capturesCount += captured.length;
      }
    }

    // Update finish area stats
    if (token.position >= BOARD_PATH_LENGTH) {
      this.playerStats[playerId].tokensInFinish = this.tokens[playerId].tokens.filter(
        t => t.position >= BOARD_PATH_LENGTH
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
      timestamp: Date.now(),
    });

    // Check win
    const hasWon = this.checkWin(playerId);
    if (hasWon) {
      this.winner = playerId;
      this.gameState = 'finished';
    }

    // Determine extra turn
    let extraTurn = false;
    let reason = '';

    if (this.diceValue === 6) {
      extraTurn = true;
      reason = 'rolled_six';
      this.consecutiveSixes++;
      
      // Limit consecutive 6s to 3
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
      winner: this.winner,
    };
  }

  isSafePosition(position) {
    // Finish area is always safe
    if (position >= BOARD_PATH_LENGTH) {
      return true;
    }
    
    return SAFE_POSITIONS.includes(position);
  }

  checkCaptures(playerId, position) {
    const captured = [];
    
    Object.keys(this.tokens).forEach((opponentId) => {
      if (opponentId === playerId) return;
      
      this.tokens[opponentId].tokens.forEach((token, index) => {
        if (token.position === position && !token.isHome && !this.isSafePosition(position)) {
          token.position = -1;
          token.isHome = true;
          this.playerStats[opponentId].tokensCaptured++;
          captured.push({ playerId: opponentId, tokenId: index });
        }
      });
    });

    return captured;
  }

  checkWin(playerId) {
    return this.tokens[playerId].tokens.every(
      token => token.position >= TOTAL_POSITIONS
    );
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.consecutiveSixes = 0;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

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
}

module.exports = { LudoGameEngine };
