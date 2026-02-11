# Ludo.com Deployment Guide

## Architecture Overview

This application requires **TWO separate deployments**:

1. **Frontend (Vercel)** - React/Vite static site
2. **Backend (Render)** - Express/Socket.io server

## Why Two Deployments?

- **Vercel** is optimized for static sites and serverless functions (NOT for WebSocket servers)
- **Render** supports long-running Node.js servers with WebSocket support
- Socket.io requires a persistent connection, which Vercel doesn't support well

---

## Step 1: Deploy Backend on Render

### 1.1 Create Render Account
- Go to [render.com](https://render.com)
- Sign up or log in with GitHub

### 1.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `redeyessssss/ludo.com`
3. Render will auto-detect `render.yaml` configuration

### 1.3 Configure Service
- **Name**: `ludo-backend` (or your choice)
- **Environment**: `Node`
- **Build Command**: `npm install --production`
- **Start Command**: `node server/index.js`
- **Plan**: Free (or paid for better performance)

### 1.4 Set Environment Variables
In Render dashboard, add these environment variables:

```
CLIENT_URL=https://your-vercel-url.vercel.app
JWT_SECRET=your-super-secret-key-here
NODE_ENV=production
PORT=3001
```

**Important**: Replace `your-vercel-url.vercel.app` with your actual Vercel URL!

### 1.5 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL (e.g., `https://ludo-backend.onrender.com`)

---

## Step 2: Update Frontend Environment Variables

### 2.1 Update Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add this variable:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**Important**: Replace with your actual Render backend URL!

### 2.2 Redeploy Frontend
- Vercel will auto-redeploy when you push to GitHub
- Or manually trigger redeploy in Vercel dashboard

---

## Step 3: Update CORS Settings

The backend needs to allow requests from your Vercel frontend.

Your `render.yaml` already has `CLIENT_URL` configured, which sets CORS automatically.

Just make sure `CLIENT_URL` in Render matches your Vercel URL exactly:
- ✅ `https://ludo-com.vercel.app`
- ❌ `https://ludo-com.vercel.app/` (no trailing slash)

---

## Step 4: Test Deployment

### 4.1 Test Frontend
Visit your Vercel URL and check:
- ✅ Homepage loads
- ✅ Can register/login
- ✅ Dashboard shows

### 4.2 Test Backend Connection
Open browser console and check for:
- ✅ "Connected to server" message
- ✅ No CORS errors
- ✅ Socket.io connection established

### 4.3 Test Features
- ✅ Quick Play matchmaking
- ✅ Play with Bot (2, 3, 4 players)
- ✅ Private rooms
- ✅ Leaderboard
- ✅ Profile page

---

## Troubleshooting

### Issue: "Connection blocked" or CORS errors
**Solution**: 
1. Check `CLIENT_URL` in Render matches your Vercel URL exactly
2. No trailing slash in URL
3. Use `https://` not `http://`

### Issue: "Play with Bot" not working
**Solution**: 
1. Backend must be deployed on Render
2. Check backend logs in Render dashboard
3. Verify `VITE_API_URL` is set in Vercel

### Issue: Socket.io connection fails
**Solution**:
1. Render free tier may sleep after inactivity (takes 30s to wake up)
2. Upgrade to paid plan for always-on service
3. Check Render logs for errors

### Issue: Features work locally but not in production
**Solution**:
1. Verify both frontend and backend are deployed
2. Check environment variables in both Vercel and Render
3. Check browser console for errors
4. Check Render logs for backend errors

---

## Current Deployment Status

### ✅ What's Deployed
- Frontend on Vercel (static React app)

### ❌ What's NOT Deployed
- Backend on Render (Express/Socket.io server)

### 🎯 What You Need to Do
1. Deploy backend on Render (follow Step 1 above)
2. Update `VITE_API_URL` in Vercel (follow Step 2 above)
3. Test all features (follow Step 4 above)

---

## Quick Deploy Commands

### Deploy Backend to Render
```bash
# Render will auto-deploy from GitHub
# Just push your code and Render will detect render.yaml
git push origin main
```

### Redeploy Frontend on Vercel
```bash
# Vercel auto-deploys from GitHub
# Or use Vercel CLI:
vercel --prod
```

---

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://your-render-backend.onrender.com
```

### Render (Backend)
```
CLIENT_URL=https://your-vercel-frontend.vercel.app
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3001
```

---

## Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│  Vercel         │  │  Render          │
│  (Frontend)     │  │  (Backend)       │
│                 │  │                  │
│  - React App    │  │  - Express API   │
│  - Static Files │  │  - Socket.io     │
│  - Routing      │  │  - Bot System    │
│                 │  │  - Game Logic    │
└─────────────────┘  └──────────────────┘
```

---

## Cost Estimate

### Free Tier (Recommended for Testing)
- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **Total**: $0/month

### Paid Tier (Recommended for Production)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Render Starter**: $7/month (always-on, no sleep)
- **Total**: $27/month

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

---

## Next Steps

1. ✅ Push this guide to GitHub
2. 🚀 Deploy backend on Render
3. 🔧 Update Vercel environment variables
4. ✅ Test all features
5. 🎉 Share your live game!

Good luck! 🎲
