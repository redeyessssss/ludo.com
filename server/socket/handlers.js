const { LudoGameEngine } = require('../game/LudoGame');

// In-memory storage (replace with database in production)
const games = new Map();
const rooms = new Map();
const matchmakingQueue = new Map(); // Separate queues for each mode
const onlineUsers = new Map();
const userSockets = new Map(); // Track user ID to socket ID mapping

function setupSocketHandlers(io) {
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
      
      if (!game) return;
      
      if (game.getCurrentPlayer().id !== userId) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      const rollResult = game.rollDice();
      
      // Check if third 6 was cancelled
      if (rollResult.cancelled) {
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
      const availableMoves = game.getAvailableMoves(userId);
      
      // Check if player has no tokens outside and didn't roll 6
      const hasTokensOutside = game.hasTokensOutside(userId);
      if (!hasTokensOutside && diceValue !== 6) {
        // No tokens outside and didn't roll 6 - turn passes
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
      
      if (!game) return;

      const result = game.moveToken(userId, tokenId);
      
      if (result.success) {
        const gameState = game.getGameState();
        const availableMoves = game.getAvailableMoves(gameState.currentPlayer.id);
        
        io.to(gameId).emit('game:update', {
          gameState,
          action: 'token_moved',
          captured: result.captured,
          extraTurn: result.extraTurn,
          reason: result.reason,
          bonus: result.bonus,
          availableMoves,
        });

        if (result.winner) {
          const winner = game.players.find(p => p.id === result.winner);
          io.to(gameId).emit('game:end', {
            winner,
            gameState: game.getGameState(),
            stats: game.playerStats,
          });
          
          // Clean up
          games.delete(gameId);
        }
      } else {
        socket.emit('error', { message: result.message });
      }
    });

    // Chat
    socket.on('chat:send', ({ roomId, gameId, userId, message }) => {
      const user = onlineUsers.get(socket.id);
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
