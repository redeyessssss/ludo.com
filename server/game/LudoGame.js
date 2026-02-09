// Classic 4-Player Ludo Game Engine - Ludo King Style Rules
// 
// OFFICIAL LUDO KING RULES:
// ========================
// 1. DICE & TURNS:
//    - Roll 1-6 on dice
//    - Rolling 6 gives extra turn
//    - Three consecutive 6s = turn forfeited (no move on 3rd six)
//    - Capturing opponent token = bonus turn (extra roll)
//
// 2. TOKEN MOVEMENT:
//    - Need 6 to move token out of home base
//    - Tokens move clockwise around 52-cell main path
//    - After completing circuit, enter colored home path (6 cells)
//    - Must reach exact finish position (no overshoot)
//
// 3. SAFE SPOTS:
//    - Starting squares (positions 0, 13, 26, 39) are safe
//    - Star squares (8, 21, 34, 47) are safe
//    - Tokens on safe spots cannot be captured
//    - Home path is always safe
//
// 4. CAPTURE/KILL:
//    - Landing on opponent's token sends it back to base
//    - Cannot capture on safe spots
//    - Stacked tokens (same color, same cell) are protected
//    - Capturing gives bonus turn
//
// 5. WINNING:
//    - First player to get all 4 tokens to finish wins
//    - Tokens must complete full circuit + home path
//
const COLORS = ['red', 'green', 'yellow', 'blue'];
const TOKENS_PER_PLAYER = 4;
const MAIN_PATH_LENGTH = 52;
const HOME_PATH_LENGTH = 6;
const FINISH_OFFSET = 5;

// Safe cells where tokens cannot be killed
const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];

// Player configuration
const PLAYER_CONFIG = {
  red:    { start: 0,  entry: 51, homeStart: 100 },  // Red enters home from position 51 (0,7)
  green:  { start: 13, entry: 12, homeStart: 200 },  // Green enters home from position 12 (8,0)
  yellow: { start: 40, entry: 38, homeStart: 300 },  // Yellow enters home from position 38 (7,14)
  blue:   { start: 27, entry: 25, homeStart: 400 }   // Blue enters home from position 25 (14,7)
};

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
          { id: 0, position: 'home', finished: false },
          { id: 1, position: 'home', finished: false },
          { id: 2, position: 'home', finished: false },
          { id: 3, position: 'home', finished: false },
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

  // DICE LOGIC
  rollDice() {
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    return this.diceValue;
  }

  // TOKEN MOVE VALIDATION
  canMoveToken(playerId, tokenId) {
    const token = this.tokens[playerId].tokens[tokenId];
    const color = this.tokens[playerId].color;
    const config = PLAYER_CONFIG[color];
    
    // Check if it's this player's turn
    if (this.players[this.currentPlayerIndex].id !== playerId) {
      return false;
    }

    // Must have rolled dice
    if (!this.diceValue) {
      return false;
    }

    // Token already finished
    if (token.finished) {
      return false;
    }

    // Token in home - needs 6 to move out
    if (token.position === 'home' && this.diceValue !== 6) {
      return false;
    }

    // Check if move would overshoot finish in home path
    if (typeof token.position === 'number' && token.position >= config.homeStart) {
      const homePosition = token.position - config.homeStart;
      if (homePosition + this.diceValue > FINISH_OFFSET) {
        return false; // Would overshoot finish
      }
    }

    // Check if entering home path would overshoot
    if (typeof token.position === 'number' && token.position < config.homeStart) {
      const current = token.position;
      const entry = config.entry;
      
      // Check if this move will enter home path
      if (current <= entry && current + this.diceValue > entry) {
        const stepsIntoHome = (current + this.diceValue) - entry - 1;
        if (stepsIntoHome > FINISH_OFFSET) {
          return false; // Would overshoot finish
        }
      }
    }

    return true;
  }

  // TOKEN MOVEMENT LOGIC
  moveToken(playerId, tokenId) {
    if (!this.canMoveToken(playerId, tokenId)) {
      return { success: false, message: 'Invalid move' };
    }

    const token = this.tokens[playerId].tokens[tokenId];
    const color = this.tokens[playerId].color;
    const config = PLAYER_CONFIG[color];
    const oldPosition = token.position;
    const captured = [];

    // Move from home
    if (token.position === 'home') {
      token.position = config.start;
    }
    // Already in home path
    else if (token.position >= config.homeStart) {
      token.position += this.diceValue;
      
      // Check if finished
      if (token.position >= config.homeStart + FINISH_OFFSET) {
        token.finished = true;
        this.playerStats[playerId].tokensInFinish++;
      }
    }
    // On main path
    else {
      const current = token.position;
      const entry = config.entry;
      
      // Check if entering home path
      if (current <= entry && current + this.diceValue > entry) {
        const stepsIntoHome = (current + this.diceValue) - entry - 1;
        token.position = config.homeStart + stepsIntoHome;
        
        // Check if finished
        if (token.position >= config.homeStart + FINISH_OFFSET) {
          token.finished = true;
          this.playerStats[playerId].tokensInFinish++;
        }
      }
      // Normal circular movement
      else {
        token.position = (current + this.diceValue) % MAIN_PATH_LENGTH;
      }
    }

    // KILL (CUT) LOGIC - only on main path, not in safe cells or home path
    if (typeof token.position === 'number' && 
        token.position < 100 && 
        !SAFE_CELLS.includes(token.position) &&
        !token.finished) {
      
      // Check for stacking (same color tokens on same cell are safe)
      const sameColorOnCell = this.tokens[playerId].tokens.filter(
        t => t.position === token.position && !t.finished
      ).length;
      
      if (sameColorOnCell === 1) { // Only this token, can kill
        const killedTokens = this.checkKill(playerId, token.position);
        captured.push(...killedTokens);
        
        if (captured.length > 0) {
          this.playerStats[playerId].capturesCount += captured.length;
        }
      }
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

    // Check win condition
    const hasWon = this.checkWin(playerId);
    if (hasWon) {
      this.winner = this.players[this.currentPlayerIndex];
      this.gameState = 'finished';
    }

    // TURN RULES (Ludo King style)
    let extraTurn = false;
    let reason = '';

    if (this.diceValue === 6) {
      this.consecutiveSixes++;
      
      // Max 3 consecutive sixes - on 3rd six, turn cancelled
      if (this.consecutiveSixes >= 3) {
        extraTurn = false;
        this.consecutiveSixes = 0;
        reason = 'three_sixes_limit';
      } else {
        extraTurn = true;
        reason = 'rolled_six';
      }
    } else {
      this.consecutiveSixes = 0;
      
      // BONUS TURN: Capturing opponent token gives extra turn (Ludo King rule)
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

  // KILL (CUT) LOGIC
  checkKill(playerId, position) {
    const killed = [];
    
    // Check if position is safe
    if (SAFE_CELLS.includes(position)) {
      return killed;
    }

    Object.keys(this.tokens).forEach((opponentId) => {
      if (opponentId === playerId) return;
      
      const opponentColor = this.tokens[opponentId].color;
      
      this.tokens[opponentId].tokens.forEach((token, index) => {
        // Can only kill tokens on main path (not in home or home path)
        if (token.position === position && 
            typeof token.position === 'number' && 
            token.position < 100 &&
            !token.finished) {
          
          // Check if opponent has stacked tokens (protection)
          const stackedCount = this.tokens[opponentId].tokens.filter(
            t => t.position === position && !t.finished
          ).length;
          
          if (stackedCount === 1) { // Not stacked, can be killed
            token.position = 'home';
            token.finished = false;
            this.playerStats[opponentId].tokensCaptured++;
            killed.push({ playerId: opponentId, tokenId: index });
          }
        }
      });
    });

    return killed;
  }

  // PLAYER WIN CONDITION
  checkWin(playerId) {
    return this.tokens[playerId].tokens.every(token => token.finished);
  }

  // TURN SWITCHING
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
