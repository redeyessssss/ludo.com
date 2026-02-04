# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (for production)
- Redis instance (for production)
- Domain name (optional)

## Environment Setup

### Frontend (.env)
```bash
VITE_API_URL=https://your-api-domain.com
VITE_SOCKET_URL=https://your-api-domain.com
```

### Backend (.env)
```bash
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/ludo_db

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Client
CLIENT_URL=https://your-frontend-domain.com
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ludo-multiplayer
vercel --prod
```

#### Backend (Railway)
1. Go to railway.app
2. Create new project
3. Connect GitHub repo
4. Add PostgreSQL and Redis services
5. Set environment variables
6. Deploy

### Option 2: DigitalOcean App Platform

1. Create new app
2. Connect GitHub repo
3. Configure build settings:
   - Frontend: `npm run build` → `dist`
   - Backend: `npm start` → Port 3001
4. Add PostgreSQL and Redis databases
5. Set environment variables
6. Deploy

### Option 3: AWS (EC2 + RDS + ElastiCache)

```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ip

# Install dependencies
sudo apt update
sudo apt install nodejs npm nginx

# Clone repo
git clone your-repo
cd ludo-multiplayer

# Install dependencies
npm install

# Build frontend
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/ludo

# Start backend with PM2
npm install -g pm2
pm2 start server/index.js --name ludo-server
pm2 startup
pm2 save
```

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "server/index.js"]
```

```bash
# Build and run
docker build -t ludo-multiplayer .
docker run -p 3001:3001 ludo-multiplayer
```

## Database Setup

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rating INTEGER DEFAULT 1000,
  level INTEGER DEFAULT 1,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  tokens_captured INTEGER DEFAULT 0,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
  id VARCHAR(255) PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  winner_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Game players table
CREATE TABLE game_players (
  game_id VARCHAR(255) REFERENCES games(id),
  user_id VARCHAR(255) REFERENCES users(id),
  color VARCHAR(20) NOT NULL,
  position INTEGER NOT NULL,
  rating_change INTEGER,
  PRIMARY KEY (game_id, user_id)
);

-- Achievements table
CREATE TABLE achievements (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  achievement_type VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_games_created ON games(created_at DESC);
CREATE INDEX idx_game_players_user ON game_players(user_id);
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Lazy load routes
- Optimize images

### Backend
- Use Redis for caching
- Implement connection pooling
- Add rate limiting
- Use WebSocket compression
- Enable clustering

### Database
- Add proper indexes
- Use connection pooling
- Implement query optimization
- Regular backups

## Monitoring

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Logs**: Logtail, Papertrail
- **Performance**: New Relic, DataDog

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use secure JWT secrets
- [ ] Enable CORS properly
- [ ] Implement CSP headers
- [ ] Regular security updates
- [ ] Database backups
- [ ] DDoS protection
- [ ] Input validation

## Scaling Strategy

### Horizontal Scaling
- Load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Redis cluster for sessions
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching layers
- Use CDN for static content

## Cost Estimation

### Small Scale (< 1000 users)
- Frontend: Vercel Free tier
- Backend: Railway Hobby ($5/mo)
- Database: Supabase Free tier
- Redis: Upstash Free tier
- **Total: ~$5/month**

### Medium Scale (1000-10000 users)
- Frontend: Vercel Pro ($20/mo)
- Backend: Railway Pro ($20/mo)
- Database: Supabase Pro ($25/mo)
- Redis: Upstash Pay-as-you-go ($10/mo)
- **Total: ~$75/month**

### Large Scale (10000+ users)
- Frontend: Cloudflare + S3 ($50/mo)
- Backend: AWS EC2 ($100/mo)
- Database: AWS RDS ($150/mo)
- Redis: AWS ElastiCache ($50/mo)
- Load Balancer: AWS ALB ($20/mo)
- **Total: ~$370/month**

## Maintenance

### Daily
- Monitor error logs
- Check server health
- Review user reports

### Weekly
- Database backups
- Security updates
- Performance review

### Monthly
- Cost analysis
- Feature planning
- User feedback review
