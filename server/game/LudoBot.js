// AI Bot for Ludo Game
// Implements intelligent decision-making for bot players

class LudoBot {
  constructor(botId, difficulty = 'medium') {
    this.botId = botId;
    this.difficulty = difficulty; // easy, medium, hard
    this.thinkingTime = this.getThinkingTime();
  }

  getThinkingTime() {
    // Simulate human-like thinking time
    switch (this.difficulty) {
      case 'easy':
        return 1000 + Math.random() * 1000; // 1-2 seconds
      case 'medium':
        return 800 + Math.random() * 700; // 0.8-1.5 seconds
      case 'hard':
        return 500 + Math.random() * 500; // 0.5-1 second
      default:
        return 1000;
    }
  }

  // Main decision-making function
  async makeMove(game, availableMoves) {
    // Simulate thinking time
    await this.sleep(this.thinkingTime);

    if (availableMoves.length === 0) {
      return null;
    }

    if (availableMoves.length === 1) {
      return availableMoves[0];
    }

    // Evaluate each possible move
    const evaluatedMoves = availableMoves.map(tokenId => ({
      tokenId,
      score: this.evaluateMove(game, tokenId)
    }));

    // Sort by score (highest first)
    evaluatedMoves.sort((a, b) => b.score - a.score);

    // Add some randomness based on difficulty
    const randomFactor = this.getRandomFactor();
    if (Math.random() < randomFactor) {
      // Sometimes make a random move (more likely on easy difficulty)
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Return the best move
    return evaluatedMoves[0].tokenId;
  }

  getRandomFactor() {
    switch (this.difficulty) {
      case 'easy':
        return 0.3; // 30% chance of random move
      case 'medium':
        return 0.1; // 10% chance of random move
      case 'hard':
        return 0.02; // 2% chance of random move
      default:
        return 0.1;
    }
  }

  // Evaluate the quality of a move
  evaluateMove(game, tokenId) {
    const playerTokens = game.tokens[this.botId];
    const token = playerTokens.tokens[tokenId];
    const color = playerTokens.color;
    const config = game.getPlayerConfig(color);
    
    let score = 0;

    // 1. Prioritize getting tokens out of home
    if (token.position === 'home' && game.diceValue === 6) {
      score += 100; // High priority to get tokens out
    }

    // 2. Prioritize finishing tokens
    if (typeof token.position === 'number' && token.position >= config.homeStart) {
      const homePosition = token.position - config.homeStart;
      const stepsToFinish = 5 - homePosition;
      if (stepsToFinish === game.diceValue) {
        score += 200; // Very high priority to finish
      } else if (stepsToFinish > game.diceValue) {
        score += 150 - (stepsToFinish * 10); // Closer to finish = higher score
      }
    }

    // 3. Check for capture opportunities
    const newPosition = this.calculateNewPosition(game, token, config);
    if (newPosition !== null) {
      const captureCount = this.checkCaptureOpportunity(game, newPosition, this.botId);
      if (captureCount > 0) {
        score += 80 * captureCount; // High priority to capture
      }
    }

    // 4. Avoid being captured
    const dangerLevel = this.checkDangerLevel(game, token, config);
    if (dangerLevel > 0) {
      score += 60; // Move tokens that are in danger
    }

    // 5. Advance tokens on the board
    if (typeof token.position === 'number' && token.position < 100) {
      score += 30; // Moderate priority to advance
      
      // Bonus for moving tokens that are behind
      const progress = this.calculateProgress(token, config);
      if (progress < 0.3) {
        score += 20; // Move tokens that haven't progressed much
      }
    }

    // 6. Spread tokens evenly
    const tokenDistribution = this.analyzeTokenDistribution(game, this.botId);
    if (tokenDistribution.inHome > 2) {
      // If too many tokens in home, prioritize getting them out
      if (token.position === 'home') {
        score += 40;
      }
    }

    // 7. Strategic positioning
    if (newPosition !== null && this.isStrategicPosition(newPosition)) {
      score += 25;
    }

    return score;
  }

  calculateNewPosition(game, token, config) {
    if (token.position === 'home') {
      if (game.diceValue === 6) {
        return config.start;
      }
      return null;
    }

    if (token.finished) {
      return null;
    }

    if (typeof token.position === 'number' && token.position >= config.homeStart) {
      const homePosition = token.position - config.homeStart;
      if (homePosition + game.diceValue <= 5) {
        return config.homeStart + homePosition + game.diceValue;
      }
      return null;
    }

    if (typeof token.position === 'number' && token.position < 100) {
      const current = token.position;
      const entry = config.entry;
      
      if (current <= entry && current + game.diceValue > entry) {
        const stepsIntoHome = (current + game.diceValue) - entry - 1;
        if (stepsIntoHome <= 5) {
          return config.homeStart + stepsIntoHome;
        }
        return null;
      }
      
      return (current + game.diceValue) % 52;
    }

    return null;
  }

  checkCaptureOpportunity(game, position, botId) {
    let captureCount = 0;
    
    Object.keys(game.tokens).forEach(playerId => {
      if (playerId === botId) return;
      
      game.tokens[playerId].tokens.forEach(token => {
        if (token.position === position && 
            typeof token.position === 'number' && 
            token.position < 100 &&
            !token.finished &&
            !this.isSafePosition(position)) {
          captureCount++;
        }
      });
    });
    
    return captureCount;
  }

  checkDangerLevel(game, token, config) {
    if (token.position === 'home' || token.finished) {
      return 0;
    }

    if (typeof token.position === 'number' && token.position >= config.homeStart) {
      return 0; // Safe in home path
    }

    if (this.isSafePosition(token.position)) {
      return 0; // Safe spot
    }

    let dangerLevel = 0;

    // Check if opponents can reach this position
    Object.keys(game.tokens).forEach(playerId => {
      if (playerId === this.botId) return;
      
      game.tokens[playerId].tokens.forEach(opponentToken => {
        if (typeof opponentToken.position === 'number' && 
            opponentToken.position < 100 &&
            !opponentToken.finished) {
          
          // Check if opponent can reach our token with a 6
          for (let dice = 1; dice <= 6; dice++) {
            const opponentNewPos = (opponentToken.position + dice) % 52;
            if (opponentNewPos === token.position) {
              dangerLevel += (7 - dice); // Closer = more dangerous
            }
          }
        }
      });
    });

    return dangerLevel;
  }

  isSafePosition(position) {
    const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47];
    return SAFE_CELLS.includes(position);
  }

  isStrategicPosition(position) {
    // Positions just before safe spots are strategic
    const STRATEGIC_POSITIONS = [7, 12, 20, 25, 33, 38, 46, 51];
    return STRATEGIC_POSITIONS.includes(position);
  }

  calculateProgress(token, config) {
    if (token.position === 'home') return 0;
    if (token.finished) return 1;
    
    if (typeof token.position === 'number' && token.position >= config.homeStart) {
      const homeProgress = (token.position - config.homeStart) / 6;
      return 0.9 + (homeProgress * 0.1);
    }
    
    if (typeof token.position === 'number' && token.position < 100) {
      const start = config.start;
      let steps = 0;
      
      if (token.position >= start) {
        steps = token.position - start;
      } else {
        steps = (52 - start) + token.position;
      }
      
      return steps / 52;
    }
    
    return 0;
  }

  analyzeTokenDistribution(game, botId) {
    const playerTokens = game.tokens[botId];
    const distribution = {
      inHome: 0,
      onBoard: 0,
      inHomePath: 0,
      finished: 0
    };

    playerTokens.tokens.forEach(token => {
      if (token.position === 'home') {
        distribution.inHome++;
      } else if (token.finished) {
        distribution.finished++;
      } else if (typeof token.position === 'number' && token.position >= 100) {
        distribution.inHomePath++;
      } else {
        distribution.onBoard++;
      }
    });

    return distribution;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { LudoBot };
