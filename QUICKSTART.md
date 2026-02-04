# Quick Start Guide

Get your Ludo multiplayer platform running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Start development servers (both frontend and backend)
npm run dev
```

That's it! The app will open at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## First Steps

### 1. Create an Account
- Click "Sign Up" on the homepage
- Enter username, email, and password
- Or click "Play as Guest" for quick access

### 2. Start Playing
- Click "Quick Play" for instant matchmaking
- Or create a "Private Room" to play with friends
- Share the room code with friends to invite them

### 3. Game Controls
- Wait for your turn (indicated by blue highlight)
- Click "Roll Dice" to roll
- Click on your token to move it
- Capture opponent tokens by landing on them
- Get all 4 tokens home to win!

## Development

### Project Structure
```
ludo-multiplayer/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── game/        # Game logic and rendering
│   │   └── store/       # State management
├── server/              # Node.js backend
│   ├── routes/          # API routes
│   ├── socket/          # WebSocket handlers
│   └── game/            # Game engine
└── shared/              # Shared utilities
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:client       # Start only frontend
npm run dev:server       # Start only backend

# Production
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

### Making Changes

#### Add a New Page
1. Create file in `client/src/pages/YourPage.jsx`
2. Add route in `client/src/App.jsx`
3. Add navigation link in `client/src/components/Navbar.jsx`

#### Add a New API Endpoint
1. Create route in `server/routes/yourRoute.js`
2. Register in `server/index.js`
3. Call from frontend using `fetch('/api/your-endpoint')`

#### Modify Game Logic
1. Edit `server/game/LudoGame.js` for server-side logic
2. Edit `client/src/game/LudoGame.js` for client-side logic
3. Update `client/src/game/LudoBoard.jsx` for rendering

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### WebSocket Connection Failed
- Make sure backend is running on port 3001
- Check CORS settings in `server/index.js`
- Verify CLIENT_URL in `.env`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Testing

### Test Multiplayer Locally
1. Open http://localhost:5173 in two browser windows
2. Login with different accounts (or use guest mode)
3. Create a private room in one window
4. Join with the room code in the other window
5. Start playing!

### Test on Mobile
1. Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Update `.env`: `CLIENT_URL=http://YOUR_IP:5173`
3. Restart servers
4. Open `http://YOUR_IP:5173` on your phone

## Next Steps

### Add Features
- Check `FEATURES.md` for feature ideas
- Implement sound effects
- Add animations
- Create AI opponents

### Deploy to Production
- Follow `DEPLOYMENT.md` for deployment guide
- Set up PostgreSQL database
- Configure Redis for caching
- Deploy to Vercel + Railway

### Customize
- Change colors in `tailwind.config.js`
- Modify game rules in `server/game/LudoGame.js`
- Add custom themes
- Create your own board design

## Resources

- [React Documentation](https://react.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express Documentation](https://expressjs.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## Support

- Create an issue on GitHub
- Check existing issues for solutions
- Read the full documentation

## License

MIT License - feel free to use this project for learning or commercial purposes!
