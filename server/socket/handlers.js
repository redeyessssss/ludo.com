const { LudoGameEngine } = require('../game/LudoGame');

// In-memory storage (replace with database in production)
const games = new Map();
const rooms = new Map();
const matchmakingQueue = new Map(); // Separate queues for each mode
const onlineUsers = new Map();
const userSockets = new Map(); // Track user ID to socket ID mapping

// ELO Rating System
const calculateEloRating = (winnerRating, loserRating, kFactor = 32) => {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWinner));
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoser));
  
  return {
    winnerRating: newWinnerRating,
    loserRating: newLoserRating,
    winnerChange: newWinnerRating - winnerRating,
    loserChange: newLoserRating - loserRating,
  };
};

// Calculate level based on rating
const calculateLevel = (rating) => {
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
};

function setupSocketHandlers(io, usersMap) {
  const users = usersMap || new Map();
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User online
    socket.on('user:online', (user) => {
      onlineUsers.set(socket.id, user);
      if (user && user.id) {
        userSockets.set(user.id, socket.id);
      }
      
      // Broadcast updated online count to ALL connected clients
      io.emit('stats:update', { 
        onlinePlayers: onlineUsers.size,
        playersInQueue: {
          quick: (matchmakingQueue.get('quick') || []).length,
          ranked: (matchmakingQueue.get('ranked') || []).length,
        }
      });
      
      console.log(`Total online players: ${onlineUsers.size}`);
    });

    // Matchmaking - GLOBAL SYSTEM
    socket.on('matchmaking:join', ({ userId, mode, region }) => {
      const user = onlineUsers.get(socket.id);
      const queue = matchmakingQueue.get(mode) || [];
      
      // Check if user is already in queue
      const alreadyInQueue = queue.find(p => p.userId === userId);
      if (alreadyInQueue) {
        console.log(`Player ${user?.username || userId} already in queue`);
        return;
      }
      
      // Add player to global queue
      const playerData = {
        userId,
        socketId: socket.id,
        user: user || { id: userId, username: `Player${Math.floor(Math.random() * 10000)}` },
        region: region || 'global',
        joinedAt: Date.now(),
      };
      
      queue.push(playerData);
      matchmakingQueue.set(mode, queue);

      console.log(`🌍 GLOBAL MATCHMAKING: Player "${playerData.user.username}" joined ${mode} queue from ${region || 'unknown region'}`);
      console.log(`📊 Queue size: ${queue.length} players waiting globally`);

      // Broadcast queue stats to all players
      io.emit('stats:update', { 
        onlinePlayers: onlineUsers.size,
        playersInQueue: {
          quick: (matchmakingQueue.get('quick') || []).length,
          ranked: (matchmakingQueue.get('ranked') || []).length,
        }
      });

      // Try to match players (need at least 2, max 4)
      if (queue.length >= 2) {
        const playersToMatch = Math.min(4, queue.length);
        const players = queue.splice(0, playersToMatch);
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const room = {
          id: roomId,
          players: players.map(p => p.user),
          mode,
          isPrivate: false,
          hostId: players[0].userId,
          createdAt: Date.now(),
          regions: players.map(p => p.region),
        };

        rooms.set(roomId, room);
        
        console.log(`✅ MATCH FOUND! Room ${roomId} created with ${players.length} players from regions: ${room.regions.join(', ')}`);
        console.log(`Players: ${players.map(p => p.user.username).join(', ')}`);

        // Notify all matched players
        players.forEach(p => {
          io.to(p.socketId).emit('matchmaking:found', { 
            roomId,
            players: room.players,
            message: `Match found! ${players.length} players ready`
          });
        });
        
        // Update queue
        matchmakingQueue.set(mode, queue);
        
        // Broadcast updated queue stats
        io.emit('stats:update', { 
          onlinePlayers: onlineUsers.size,
          playersInQueue: {
            quick: (matchmakingQueue.get('quick') || []).length,
            ranked: (matchmakingQueue.get('ranked') || []).length,
          }
        });
      } else {
        // Notify player they're waiting
        socket.emit('matchmaking:waiting', { 
          position: queue.length,
          totalInQueue: queue.length,
          message: `Searching globally... ${queue.length} player(s) in queue`
        });
      }
    });

    // Cancel matchmaking
    socket.on('matchmaking:cancel', ({ userId, mode }) => {
      const queue = matchmakingQueue.get(mode) || [];
      const filteredQueue = queue.filter(p => p.userId !== userId);
      matchmakingQueue.set(mode, filteredQueue);
      
      console.log(`Player ${userId} cancelled matchmaking for ${mode}`);
      
      // Broadcast updated stats
      io.emit('stats:update', { 
        onlinePlayers: onlineUsers.size,
        playersInQueue: {
          quick: (matchmakingQueue.get('quick') || []).length,
          ranked: (matchmakingQueue.get('ranked') || []).length,
        }
      });
    });

    // Room creation
    socket.on('room:create', ({ userId, isPrivate }) => {
      const roomId = `room_${Date.now()}`;
      const user = onlineUsers.get(socket.id);
      
      const room = {
        id: roomId,
        players: [user],
        isPrivate,
        hostId: userId,
        createdAt: Date.now(),
      };

      rooms.set(roomId, room);
      socket.emit('room:created', { roomId });
    });

    // Join room
    socket.on('room:join', ({ roomId, user }) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.players.length >= 4) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Add player if not already in room
      if (user && !room.players.find(p => p && p.id === user.id)) {
        room.players.push(user);
      }

      socket.join(roomId);
      io.to(roomId).emit('room:update', { room, players: room.players });
    });

    // Player ready
    socket.on('player:ready', ({ roomId, userId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === userId);
      if (player) {
        player.isReady = true;
        io.to(roomId).emit('room:update', { room, players: room.players });
      }
    });

    // Start game
    socket.on('game:start', ({ roomId }) => {
      const room = rooms.get(roomId);
      
      if (!room || room.players.length < 2) {
        socket.emit('error', { message: 'Not enough players' });
        return;
      }

      const gameId = `game_${Date.now()}`;
      const game = new LudoGameEngine(room.players);
      game.gameState = 'playing';
      
      games.set(gameId, game);
      
      // Store room reference with game for rating tracking
      rooms.set(gameId, room);

      io.to(roomId).emit('game:start', { gameId });
    });

    // Join game
    socket.on('game:join', ({ gameId, userId }) => {
      socket.join(gameId);
      const game = games.get(gameId);
      
      if (game) {
        socket.emit('game:state', game.getGameState());
      }
    });

    // Roll dice
    socket.on('game:rollDice', ({ gameId, userId }) => {
      const game = games.get(gameId);
      
      if (!game) {
        console.error('❌ Game not found:', gameId);
        return;
      }
      
      if (game.getCurrentPlayer().id !== userId) {
        console.error('❌ Not player turn:', userId);
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      console.log(`🎲 Rolling dice for player ${userId}`);
      const rollResult = game.rollDice();
      
      // Check if third 6 was cancelled
      if (rollResult.cancelled) {
        console.log('⚠️ Three 6s cancelled, turn passes');
        io.to(gameId).emit('game:update', {
          gameState: game.getGameState(),
          diceValue: null,
          availableMoves: [],
          action: 'three_sixes_cancelled',
          reason: 'three_sixes_limit',
          message: '⚠️ Three 6s in a row! Turn passes to next player.',
        });
        return;
      }
      
      const diceValue = rollResult.value;
      console.log(`🎲 Dice rolled: ${diceValue}`);
      const availableMoves = game.getAvailableMoves(userId);
      
      // Check if player has no tokens outside and didn't roll 6
      const hasTokensOutside = game.hasTokensOutside(userId);
      if (!hasTokensOutside && diceValue !== 6) {
        // No tokens outside and didn't roll 6 - turn passes
        console.log('⚠️ No tokens outside, need 6 to start');
        game.nextTurn();
        io.to(gameId).emit('game:update', {
          gameState: game.getGameState(),
          diceValue,
          availableMoves: [],
          action: 'no_tokens_outside',
          reason: 'need_six_to_start',
          message: 'All tokens in home. Need 6 to start. Turn passes.',
        });
        return;
      }
      
      // Check if player has no valid moves
      if (availableMoves.length === 0 && diceValue !== 6) {
        console.log('⚠️ No valid moves available');
        game.nextTurn();
        io.to(gameId).emit('game:update', {
          gameState: game.getGameState(),
          diceValue,
          availableMoves: [],
          action: 'no_valid_moves',
          message: 'No valid moves available. Turn passes.',
        });
        return;
      }
      
      console.log(`✅ Available moves: ${availableMoves.length} tokens`);
      io.to(gameId).emit('game:update', {
        gameState: game.getGameState(),
        diceValue,
        availableMoves,
        action: 'dice_rolled',
        reason: diceValue === 6 ? 'rolled_six' : null,
      });
    });

    // Move token
    socket.on('game:moveToken', ({ gameId, userId, tokenId }) => {
      const game = games.get(gameId);
      
      if (!game) {
        console.error('❌ Game not found:', gameId);
        return;
      }

      console.log(`🎮 Move token request: Player ${userId}, Token ${tokenId}`);
      const result = game.moveToken(userId, tokenId);
      
      if (result.success) {
        const gameState = game.getGameState();
        const availableMoves = game.getAvailableMoves(gameState.currentPlayer.id);
        
        console.log(`✅ Token moved successfully. tokenFinished: ${result.tokenFinished}, extraTurn: ${result.extraTurn}`);
        
        if (!result.extraTurn) {
          console.log(`🔄 Turn passed to next player: ${gameState.currentPlayer.username}`);
        }
        
        io.to(gameId).emit('game:update', {
          gameState,
          action: 'token_moved',
          captured: result.captured,
          extraTurn: result.extraTurn,
          reason: result.reason,
          tokenFinished: result.tokenFinished, // CRITICAL: Send tokenFinished flag
          availableMoves,
        });

        if (result.winner) {
          const winner = game.players.find(p => p.id === result.winner);
          const room = rooms.get(gameId) || {};
          const isRanked = room.mode === 'ranked';
          
          // Update player stats and ratings
          const ratingChanges = {};
          
          game.players.forEach(player => {
            const user = users.get(player.id);
            if (!user || user.isGuest) return;
            
            const isWinner = player.id === result.winner;
            
            // Update basic stats
            user.gamesPlayed = (user.gamesPlayed || 0) + 1;
            if (isWinner) {
              user.wins = (user.wins || 0) + 1;
            } else {
              user.losses = (user.losses || 0) + 1;
            }
            
            // Update game-specific stats
            const playerStats = game.playerStats[player.id] || {};
            user.tokensCaptured = (user.tokensCaptured || 0) + (playerStats.capturesCount || 0);
            user.tokensFinished = (user.tokensFinished || 0) + (playerStats.tokensInFinish || 0);
            
            // Calculate ELO rating change for ranked matches
            if (isRanked) {
              const oldRating = user.rating || 1000;
              
              if (isWinner) {
                // Winner gains rating from all losers
                let totalRatingGain = 0;
                game.players.forEach(opponent => {
                  if (opponent.id !== player.id) {
                    const opponentUser = users.get(opponent.id);
                    if (opponentUser && !opponentUser.isGuest) {
                      const opponentRating = opponentUser.rating || 1000;
                      const eloResult = calculateEloRating(oldRating, opponentRating);
                      totalRatingGain += eloResult.winnerChange;
                    }
                  }
                });
                
                user.rating = oldRating + Math.round(totalRatingGain / (game.players.length - 1));
                ratingChanges[player.id] = {
                  old: oldRating,
                  new: user.rating,
                  change: user.rating - oldRating,
                };
              } else {
                // Loser loses rating to winner
                const winnerUser = users.get(result.winner);
                if (winnerUser && !winnerUser.isGuest) {
                  const winnerRating = winnerUser.rating || 1000;
                  const eloResult = calculateEloRating(winnerRating, oldRating);
                  user.rating = oldRating + eloResult.loserChange;
                  ratingChanges[player.id] = {
                    old: oldRating,
                    new: user.rating,
                    change: user.rating - oldRating,
                  };
                }
              }
              
              // Update highest rating
              if (user.rating > (user.highestRating || 1000)) {
                user.highestRating = user.rating;
              }
              
              // Update level based on rating
              user.level = calculateLevel(user.rating);
            }
            
            // Add match to history
            if (!user.matchHistory) user.matchHistory = [];
            user.matchHistory.push({
              gameId,
              result: isWinner ? 'win' : 'loss',
              mode: room.mode || 'quick',
              players: game.players.map(p => ({
                id: p.id,
                username: p.username,
                isWinner: p.id === result.winner,
              })),
              stats: playerStats,
              ratingChange: ratingChanges[player.id],
              timestamp: Date.now(),
            });
            
            // Keep only last 50 matches
            if (user.matchHistory.length > 50) {
              user.matchHistory = user.matchHistory.slice(-50);
            }
            
            users.set(player.id, user);
          });
          
          console.log('📊 Game stats updated:', {
            winner: winner.username,
            isRanked,
            ratingChanges,
          });
          
          io.to(gameId).emit('game:end', {
            winner,
            gameState: game.getGameState(),
            stats: game.playerStats,
            isRanked,
            ratingChanges,
          });
          
          // Clean up
          games.delete(gameId);
        }
      } else {
        console.error('❌ Invalid move:', result.message);
        socket.emit('error', { message: result.message });
      }
    });

    // Chat
    socket.on('chat:send', ({ roomId, gameId, userId, message }) => {
      const user = onlineUsers.get(socket.id);
      
      // Validate user is registered (not a guest)
      if (!user || user.isGuest || !user.id || user.id.startsWith('guest_')) {
        socket.emit('error', { message: 'Chat is only available for registered users. Please sign up or log in.' });
        console.log('❌ Chat blocked: Guest user attempted to send message');
        return;
      }
      
      const chatData = {
        userId,
        username: user?.username || 'Anonymous',
        message,
        timestamp: Date.now(),
      };

      if (roomId) {
        io.to(roomId).emit('chat:message', chatData);
      } else if (gameId) {
        io.to(gameId).emit('chat:message', chatData);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      const user = onlineUsers.get(socket.id);
      
      // Check if user was in an active game
      if (user && user.id) {
        // Find any active games with this user
        games.forEach((game, gameId) => {
          const playerInGame = game.players.find(p => p.id === user.id);
          
          if (playerInGame && game.gameState === 'playing') {
            console.log(`⚠️ Player ${user.username} left game ${gameId}`);
            
            // Mark player as disconnected
            game.disconnectedPlayers = game.disconnectedPlayers || [];
            game.disconnectedPlayers.push(user.id);
            
            // Count remaining active players
            const activePlayers = game.players.filter(p => 
              !game.disconnectedPlayers.includes(p.id)
            );
            
            console.log(`📊 Active players remaining: ${activePlayers.length}/${game.players.length}`);
            
            // If only 1 player remains, they win by default
            if (activePlayers.length === 1) {
              const winner = activePlayers[0];
              console.log(`🏆 ${winner.username} wins by default (all opponents left)`);
              
              game.winner = winner;
              game.gameState = 'finished';
              
              const room = rooms.get(gameId) || {};
              const isRanked = room.mode === 'ranked';
              const ratingChanges = {};
              
              // Update stats for all players (winner and disconnected)
              game.players.forEach(player => {
                const playerUser = users.get(player.id);
                if (!playerUser || playerUser.isGuest) return;
                
                const isWinner = player.id === winner.id;
                
                // Update basic stats
                playerUser.gamesPlayed = (playerUser.gamesPlayed || 0) + 1;
                if (isWinner) {
                  playerUser.wins = (playerUser.wins || 0) + 1;
                } else {
                  playerUser.losses = (playerUser.losses || 0) + 1;
                }
                
                // Update ratings for ranked matches
                if (isRanked) {
                  const oldRating = playerUser.rating || 1000;
                  
                  if (isWinner) {
                    // Winner gains rating (smaller gain for disconnect wins)
                    const ratingGain = Math.round(20 * (game.players.length - 1) / game.players.length);
                    playerUser.rating = oldRating + ratingGain;
                    ratingChanges[player.id] = {
                      old: oldRating,
                      new: playerUser.rating,
                      change: ratingGain,
                    };
                  } else {
                    // Disconnected players lose rating
                    const ratingLoss = -25;
                    playerUser.rating = Math.max(800, oldRating + ratingLoss);
                    ratingChanges[player.id] = {
                      old: oldRating,
                      new: playerUser.rating,
                      change: playerUser.rating - oldRating,
                    };
                  }
                  
                  // Update highest rating
                  if (playerUser.rating > (playerUser.highestRating || 1000)) {
                    playerUser.highestRating = playerUser.rating;
                  }
                  
                  // Update level
                  playerUser.level = calculateLevel(playerUser.rating);
                }
                
                // Add match to history
                if (!playerUser.matchHistory) playerUser.matchHistory = [];
                playerUser.matchHistory.push({
                  gameId,
                  result: isWinner ? 'win' : 'loss',
                  mode: room.mode || 'quick',
                  players: game.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    isWinner: p.id === winner.id,
                  })),
                  stats: game.playerStats[player.id] || {},
                  ratingChange: ratingChanges[player.id],
                  disconnected: !isWinner,
                  timestamp: Date.now(),
                });
                
                if (playerUser.matchHistory.length > 50) {
                  playerUser.matchHistory = playerUser.matchHistory.slice(-50);
                }
                
                users.set(player.id, playerUser);
              });
              
              io.to(gameId).emit('game:end', {
                winner,
                gameState: game.getGameState(),
                stats: game.playerStats,
                reason: 'opponents_left',
                message: `${winner.username} wins! All opponents have left the game.`,
                isRanked,
                ratingChanges,
              });
              
              // Clean up
              games.delete(gameId);
            } 
            // If multiple players remain, notify and skip disconnected player's turn
            else if (activePlayers.length > 1) {
              // Skip to next active player if it was disconnected player's turn
              if (game.getCurrentPlayer().id === user.id) {
                // Find next active player
                let nextPlayerFound = false;
                let attempts = 0;
                while (!nextPlayerFound && attempts < game.players.length) {
                  game.nextTurn();
                  if (!game.disconnectedPlayers.includes(game.getCurrentPlayer().id)) {
                    nextPlayerFound = true;
                  }
                  attempts++;
                }
              }
              
              io.to(gameId).emit('game:update', {
                gameState: game.getGameState(),
                action: 'player_left',
                leftPlayer: user.username,
                message: `${user.username} has left the game. ${activePlayers.length} player(s) remaining.`
              });
            }
            // If no players remain, clean up game
            else {
              console.log(`🗑️ Game ${gameId} ended - no players remaining`);
              games.delete(gameId);
            }
          }
        });
      }
      
      // Remove from online users
      onlineUsers.delete(socket.id);
      
      // Remove from user sockets mapping
      if (user && user.id) {
        userSockets.delete(user.id);
      }
      
      // Remove from all matchmaking queues
      ['quick', 'ranked'].forEach(mode => {
        const queue = matchmakingQueue.get(mode) || [];
        const filteredQueue = queue.filter(p => p.socketId !== socket.id);
        matchmakingQueue.set(mode, filteredQueue);
      });
      
      // Broadcast updated stats
      io.emit('stats:update', { 
        onlinePlayers: onlineUsers.size,
        playersInQueue: {
          quick: (matchmakingQueue.get('quick') || []).length,
          ranked: (matchmakingQueue.get('ranked') || []).length,
        }
      });
      
      console.log(`Total online players: ${onlineUsers.size}`);
    });
  });
}

module.exports = { setupSocketHandlers };
