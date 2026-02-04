// Ludo Game Engine (Server-side)
const COLORS = ['red', 'blue', 'green', 'yellow'];
const TOKENS_PER_PLAYER = 4;

class LudoGameEngine {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.diceValue = null;
    this.gameState = 'waiting';
    this.tokens = this.initializeTokens();
    this.winner = null;
    this.moveHistory = [];
  }

  initializeTokens() {
    const tokens = {};
    this.players.forEach((player, index) => {
      const color = COLORS[index];
      tokens[player.id] = {
        color,
        tokens: [
          { id: 0, position: -1, isHome: true, isSafe: false },
          { id: 1, position: -1, isHome: true, isSafe: false },
          { id: 2, position: -1, isHome: true, isSafe: false },
          { id: 3, position: -1, isHome: true, isSafe: false },
        ],
      };
    });
    return tokens;
  }

  rollDice() {
    this.diceValue = Math.floor(Math.random() * 6) + 1;
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

    if (token.position === -1) {
      return this.diceValue === 6;
    }

    if (token.position >= 57) {
      return false;
    }

    if (token.position + this.diceValue > 57) {
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

    if (token.position === -1) {
      token.position = 0;
      token.isHome = false;
    } else {
      token.position += this.diceValue;
    }

    // Check for captures
    if (token.position < 52 && !this.isSafePosition(token.position)) {
      captured.push(...this.checkCaptures(playerId, token.position));
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

    // Next turn
    const extraTurn = this.diceValue === 6 || captured.length > 0;
    if (!extraTurn) {
      this.nextTurn();
    }

    this.diceValue = null;

    return {
      success: true,
      captured,
      extraTurn,
      winner: this.winner,
    };
  }

  isSafePosition(position) {
    // Safe positions: 0, 8, 13, 21, 26, 34, 39, 47
    const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];
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
          captured.push({ playerId: opponentId, tokenId: index });
        }
      });
    });

    return captured;
  }

  checkWin(playerId) {
    return this.tokens[playerId].tokens.every(token => token.position === 57);
  }

  nextTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
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
    };
  }
}

module.exports = { LudoGameEngine };
