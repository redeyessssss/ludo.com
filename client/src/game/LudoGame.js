// Ludo Game Logic
export const COLORS = ['red', 'blue', 'green', 'yellow'];
export const BOARD_SIZE = 15;
export const TOKENS_PER_PLAYER = 4;

// Board positions for each color
export const START_POSITIONS = {
  red: { x: 1, y: 6 },
  blue: { x: 8, y: 1 },
  green: { x: 13, y: 8 },
  yellow: { x: 6, y: 13 },
};

export const HOME_POSITIONS = {
  red: [{ x: 1, y: 1 }, { x: 1, y: 4 }, { x: 4, y: 1 }, { x: 4, y: 4 }],
  blue: [{ x: 10, y: 1 }, { x: 10, y: 4 }, { x: 13, y: 1 }, { x: 13, y: 4 }],
  green: [{ x: 10, y: 10 }, { x: 10, y: 13 }, { x: 13, y: 10 }, { x: 13, y: 13 }],
  yellow: [{ x: 1, y: 10 }, { x: 1, y: 13 }, { x: 4, y: 10 }, { x: 4, y: 13 }],
};

// Path for each color (52 positions + 6 home stretch)
export const PATHS = {
  red: generatePath('red'),
  blue: generatePath('blue'),
  green: generatePath('green'),
  yellow: generatePath('yellow'),
};

function generatePath(color) {
  const path = [];
  // This would contain the actual path coordinates
  // Simplified for now
  for (let i = 0; i < 58; i++) {
    path.push({ x: 0, y: 0, position: i });
  }
  return path;
}

export class LudoGameEngine {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.diceValue = null;
    this.gameState = 'waiting'; // waiting, playing, finished
    this.tokens = this.initializeTokens();
    this.winner = null;
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
    
    // Can't move if not current player's turn
    if (this.players[this.currentPlayerIndex].id !== playerId) {
      return false;
    }

    // Can't move without dice roll
    if (!this.diceValue) {
      return false;
    }

    // Token in home - need 6 to start
    if (token.position === -1) {
      return this.diceValue === 6;
    }

    // Token finished
    if (token.position >= 57) {
      return false;
    }

    // Check if move would exceed finish
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
    const captured = [];

    // Move from home
    if (token.position === -1) {
      token.position = 0;
      token.isHome = false;
    } else {
      token.position += this.diceValue;
    }

    // Check for captures
    if (token.position < 52) {
      captured.push(...this.checkCaptures(playerId, token.position));
    }

    // Check if player won
    const hasWon = this.checkWin(playerId);
    if (hasWon) {
      this.winner = playerId;
      this.gameState = 'finished';
    }

    // Next turn (unless rolled 6 or captured)
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

  checkCaptures(playerId, position) {
    const captured = [];
    
    // Check if any opponent tokens are on this position
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
    };
  }
}
