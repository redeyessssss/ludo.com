# Deploying Ludo.com to Vercel (Full Stack)

## The Problem You're Facing

You deployed the **frontend** to Vercel, but the **backend is still on localhost**. Your friend can't connect to your localhost server!

## Solution: Deploy Backend Separately

You need to deploy both frontend AND backend. Here are your options:

---

## Option 1: Deploy Backend to Render.com (Recommended - FREE)

### Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `redeyessssss/ludo.com`
4. Configure the service:
   - **Name**: `ludo-backend`
   - **Root Directory**: Leave empty (or `.`)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free

5. **Add Environment Variables**:
   ```
   PORT=3001
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-app.vercel.app
   JWT_SECRET=your-super-secret-key-change-this
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://ludo-backend.onrender.com`)

### Step 2: Update Vercel Frontend

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add this variable:
   ```
   VITE_API_URL=https://ludo-backend.onrender.com
   ```
4. Go to **Deployments** → Click **"..."** → **"Redeploy"**

### Step 3: Update Server CORS

The server needs to allow your Vercel frontend. This is already configured in `server/index.js` using the `CLIENT_URL` environment variable.

---

## Option 2: Deploy Backend to Railway.app (Also FREE)

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `redeyessssss/ludo.com`
5. Add environment variables (same as Render)
6. Railway will auto-detect Node.js and deploy
7. Get your backend URL from Railway dashboard
8. Update Vercel environment variable `VITE_API_URL`

---

## Option 3: Deploy Backend to Vercel (Serverless)

**Note**: Socket.io doesn't work well with Vercel's serverless functions. Use Render or Railway instead.

---

## Quick Setup Summary

### For Local Development:
```bash
# .env file
VITE_API_URL=http://localhost:3001
```

### For Production (Vercel):
```bash
# Vercel Environment Variable
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Testing After Deployment

1. **Open your Vercel app**: `https://your-app.vercel.app`
2. **Check browser console** (F12):
   - Should see: ✅ "Connected to server"
   - Should NOT see: ❌ "localhost:3001"
3. **Test with friend**:
   - Both open the Vercel URL
   - Both click "Quick Play"
   - Should match within seconds!

---

## Current Status

✅ Frontend: Deployed to Vercel
❌ Backend: Still on localhost (needs deployment)

**Next Step**: Deploy backend to Render.com (takes 10 minutes)

---

## Troubleshooting

### "Cannot connect to server"
- Check if backend is deployed and running
- Verify `VITE_API_URL` environment variable in Vercel
- Check backend logs on Render/Railway

### "Players not matching"
- Both players must use the SAME URL (Vercel URL)
- Don't mix localhost and production URLs
- Check if backend is receiving connections (check logs)

### "CORS Error"
- Make sure `CLIENT_URL` in backend matches your Vercel URL
- Update backend environment variable
- Redeploy backend after changing CORS settings

---

## Files Modified

- `.env` - Added `VITE_API_URL` variable
- `.env.example` - Added `VITE_API_URL` variable
- `client/src/pages/Dashboard.jsx` - Uses environment variable
- `client/src/pages/Lobby.jsx` - Uses environment variable
- `client/src/pages/Game.jsx` - Uses environment variable

---

## Cost

- **Render.com Free Tier**: 750 hours/month (enough for 24/7)
- **Railway.app Free Tier**: $5 credit/month
- **Vercel Free Tier**: Unlimited for frontend

Total cost: **$0/month** for hobby projects!

---

## Need Help?

1. Deploy backend to Render.com first
2. Get the backend URL
3. Add `VITE_API_URL` to Vercel environment variables
4. Redeploy frontend on Vercel
5. Test with your friend!
