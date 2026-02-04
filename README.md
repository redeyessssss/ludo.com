# 🎲 Ludo Multiplayer Platform

A complete multiplayer Ludo game platform with real-time gameplay, matchmaking, rankings, and social features.

## 🚀 Features

### Core Gameplay
- ✅ Real-time multiplayer (2-4 players)
- ✅ Classic Ludo rules with all variations
- ✅ Smooth animations and sound effects
- ✅ Mobile responsive design
- ✅ Spectator mode

### Multiplayer Features
- ✅ Global matchmaking with ELO rating
- ✅ Private rooms with invite codes
- ✅ Friend challenges
- ✅ Quick play and ranked modes
- ✅ Tournament system

### Social Features
- ✅ User profiles and avatars
- ✅ Friend system
- ✅ Chat (global and in-game)
- ✅ Leaderboards (daily, weekly, all-time)
- ✅ Achievement system
- ✅ Player statistics

### Progression System
- ✅ Daily missions and rewards
- ✅ Level progression
- ✅ Unlockable themes and dice
- ✅ Battle pass system
- ✅ Coins and gems economy

### Additional Features
- ✅ Game history and replays
- ✅ Reconnection handling
- ✅ Anti-cheat system
- ✅ Report system
- ✅ Multiple languages

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- Zustand for state management
- Socket.io-client for real-time
- TailwindCSS for styling
- Canvas API for game rendering

**Backend:**
- Node.js + Express
- Socket.io for WebSocket
- PostgreSQL for data persistence
- Redis for matchmaking and caching
- JWT authentication

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## 🎮 How to Play

1. **Sign up** or play as guest
2. **Choose mode**: Quick Play, Ranked, or Private Room
3. **Roll dice** and move your tokens
4. **Capture** opponent tokens
5. **Get all 4 tokens home** to win!

## 🏗️ Project Structure

```
ludo-multiplayer/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── game/        # Game logic and rendering
│   │   ├── pages/       # Page components
│   │   ├── store/       # State management
│   │   └── utils/       # Helper functions
├── server/              # Node.js backend
│   ├── controllers/     # Route handlers
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── socket/          # Socket.io handlers
│   └── utils/           # Helper functions
└── shared/              # Shared code
```

## 🚀 Deployment

**Frontend:** Vercel, Netlify, or Cloudflare Pages
**Backend:** Railway, Render, or DigitalOcean
**Database:** Supabase, Neon, or managed PostgreSQL
**Redis:** Upstash or Redis Cloud

## 📝 License

MIT License
