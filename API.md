# API Documentation

## REST API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "rating": 1000,
    "level": 1,
    ...
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "string",
  "username": "string",
  ...
}
```

### Users

#### Get User Profile
```http
GET /api/users/:userId

Response: 200 OK
{
  "id": "string",
  "username": "string",
  "rating": 1000,
  "level": 1,
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  ...
}
```

#### Update User Profile
```http
PUT /api/users/:userId
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "string",
  "avatar": "string",
  "bio": "string"
}

Response: 200 OK
{
  "id": "string",
  "username": "string",
  ...
}
```

#### Get User Stats
```http
GET /api/users/:userId/stats

Response: 200 OK
{
  "gamesPlayed": 0,
  "wins": 0,
  "losses": 0,
  "winRate": 0,
  "rating": 1000,
  "level": 1,
  "tokensCaptured": 0
}
```

### Leaderboard

#### Get Leaderboard
```http
GET /api/leaderboard?timeframe=all&limit=100

Query Parameters:
- timeframe: "all" | "weekly" | "daily"
- limit: number (default: 100)

Response: 200 OK
[
  {
    "id": "string",
    "username": "string",
    "rating": 1850,
    "wins": 145,
    "losses": 32,
    "level": 25
  },
  ...
]
```

#### Get User Rank
```http
GET /api/leaderboard/rank/:userId?timeframe=all

Response: 200 OK
{
  "rank": 1,
  "total": 1000,
  "percentile": 99.9
}
```

## WebSocket Events

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');
```

### User Events

#### User Online
```javascript
// Emit
socket.emit('user:online', {
  id: 'user_id',
  username: 'username',
  ...
});

// Listen
socket.on('stats:update', (data) => {
  console.log('Online players:', data.onlinePlayers);
});
```

### Matchmaking Events

#### Join Matchmaking Queue
```javascript
socket.emit('matchmaking:join', {
  userId: 'user_id',
  mode: 'quick' | 'ranked'
});

socket.on('matchmaking:found', (data) => {
  console.log('Match found! Room ID:', data.roomId);
  // Navigate to lobby
});
```

### Room Events

#### Create Room
```javascript
socket.emit('room:create', {
  userId: 'user_id',
  isPrivate: true
});

socket.on('room:created', (data) => {
  console.log('Room created:', data.roomId);
});
```

#### Join Room
```javascript
socket.emit('room:join', {
  roomId: 'room_id',
  user: { id, username, ... }
});

socket.on('room:update', (data) => {
  console.log('Room:', data.room);
  console.log('Players:', data.players);
});
```

#### Player Ready
```javascript
socket.emit('player:ready', {
  roomId: 'room_id',
  userId: 'user_id'
});
```

#### Start Game
```javascript
socket.emit('game:start', {
  roomId: 'room_id'
});

socket.on('game:start', (data) => {
  console.log('Game started:', data.gameId);
  // Navigate to game
});
```

### Game Events

#### Join Game
```javascript
socket.emit('game:join', {
  gameId: 'game_id',
  userId: 'user_id'
});

socket.on('game:state', (gameState) => {
  console.log('Initial game state:', gameState);
});
```

#### Roll Dice
```javascript
socket.emit('game:rollDice', {
  gameId: 'game_id',
  userId: 'user_id'
});

socket.on('game:update', (data) => {
  console.log('Dice value:', data.diceValue);
  console.log('Game state:', data.gameState);
});
```

#### Move Token
```javascript
socket.emit('game:moveToken', {
  gameId: 'game_id',
  userId: 'user_id',
  tokenId: 0 // 0-3
});

socket.on('game:update', (data) => {
  console.log('Action:', data.action); // 'token_moved'
  console.log('Captured:', data.captured);
  console.log('Extra turn:', data.extraTurn);
  console.log('Game state:', data.gameState);
});
```

#### Game End
```javascript
socket.on('game:end', (data) => {
  console.log('Winner:', data.winner);
  console.log('Final state:', data.gameState);
});
```

### Chat Events

#### Send Message
```javascript
socket.emit('chat:send', {
  roomId: 'room_id', // or gameId
  userId: 'user_id',
  message: 'Hello!'
});

socket.on('chat:message', (data) => {
  console.log(`${data.username}: ${data.message}`);
});
```

### Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Game State Structure

```typescript
interface GameState {
  players: Player[];
  tokens: {
    [playerId: string]: {
      color: 'red' | 'blue' | 'green' | 'yellow';
      tokens: Token[];
    };
  };
  currentPlayerIndex: number;
  currentPlayer: Player;
  diceValue: number | null;
  gameState: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  moveHistory: Move[];
}

interface Player {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
}

interface Token {
  id: number; // 0-3
  position: number; // -1 (home), 0-57 (path)
  isHome: boolean;
  isSafe: boolean;
}

interface Move {
  playerId: string;
  tokenId: number;
  from: number;
  to: number;
  diceValue: number;
  captured: Capture[];
  timestamp: number;
}

interface Capture {
  playerId: string;
  tokenId: number;
}
```

## Rate Limits

- API requests: 100 per minute per IP
- WebSocket connections: 10 per minute per IP
- Chat messages: 20 per minute per user

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Examples

### Complete Game Flow

```javascript
// 1. Connect
const socket = io('http://localhost:3001');

// 2. Go online
socket.emit('user:online', user);

// 3. Join matchmaking
socket.emit('matchmaking:join', { userId: user.id, mode: 'quick' });

// 4. Wait for match
socket.on('matchmaking:found', ({ roomId }) => {
  // 5. Join room
  socket.emit('room:join', { roomId, user });
  
  // 6. Mark ready
  socket.emit('player:ready', { roomId, userId: user.id });
});

// 7. Game starts
socket.on('game:start', ({ gameId }) => {
  // 8. Join game
  socket.emit('game:join', { gameId, userId: user.id });
});

// 9. Play game
socket.on('game:state', (gameState) => {
  if (gameState.currentPlayer.id === user.id) {
    // Your turn - roll dice
    socket.emit('game:rollDice', { gameId, userId: user.id });
  }
});

socket.on('game:update', (data) => {
  if (data.diceValue && data.gameState.currentPlayer.id === user.id) {
    // Move token
    socket.emit('game:moveToken', { gameId, userId: user.id, tokenId: 0 });
  }
});

// 10. Game ends
socket.on('game:end', (data) => {
  console.log('Winner:', data.winner.username);
});
```
