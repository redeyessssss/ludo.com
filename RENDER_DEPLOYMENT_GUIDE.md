# 🚀 Deploy Backend to Render.com (5 Minutes)

## Why Not Vercel for Backend?

❌ **Vercel doesn't support Socket.io** because:
- Serverless functions (no persistent connections)
- WebSocket connections get terminated
- Not designed for real-time apps

✅ **Use Render.com instead**:
- FREE tier available
- Supports WebSocket/Socket.io
- Always-on server
- Easy deployment

---

## Step-by-Step: Deploy to Render.com

### Step 1: Sign Up (30 seconds)

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repositories

### Step 2: Create Web Service (2 minutes)

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select: **`redeyessssss/ludo.com`**
5. Click **"Connect"**

### Step 3: Configure Service (2 minutes)

Fill in these settings:

**Basic Settings:**
```
Name: ludo-backend
Region: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
Branch: main
Root Directory: (leave empty)
```

**Build & Deploy:**
```
Runtime: Node
Build Command: npm install
Start Command: node server/index.js
```

**Instance Type:**
```
Select: Free (0.1 CPU, 512 MB RAM)
```

### Step 4: Add Environment Variables (1 minute)

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
NODE_ENV=production
```

```
PORT=3001
```

```
CLIENT_URL=https://your-vercel-app.vercel.app
```
⚠️ Replace with YOUR actual Vercel URL!

```
JWT_SECRET=ludo-super-secret-key-12345-change-this
```
⚠️ Use a random string for security!

**Your environment variables should look like:**
```
NODE_ENV          production
PORT              3001
CLIENT_URL        https://ludo-com-xyz.vercel.app
JWT_SECRET        ludo-super-secret-key-12345-change-this
```

### Step 5: Deploy! (5-10 minutes)

1. Click **"Create Web Service"** (bottom)
2. Wait for deployment (Render will show logs)
3. Look for: ✅ "Deploy succeeded"
4. Your backend URL will be shown at top: 
   ```
   https://ludo-backend.onrender.com
   ```
5. **Copy this URL!** You'll need it for Vercel.

---

## Step 6: Update Vercel Frontend

### 6.1: Add Environment Variable

1. Go to **https://vercel.com/dashboard**
2. Click on your **ludo.com** project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Fill in:
   ```
   Name: VITE_API_URL
   Value: https://ludo-backend.onrender.com
   ```
   ⚠️ Use YOUR actual Render URL (no trailing slash!)
6. Select: **Production, Preview, Development** (all three)
7. Click **"Save"**

### 6.2: Redeploy Frontend

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait 1-2 minutes for redeployment

---

## Step 7: Test Everything!

### Test 1: Check Backend is Running

Open in browser:
```
https://ludo-backend.onrender.com/api/health
```

Should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

✅ If you see this = Backend is working!

### Test 2: Check Frontend Connection

1. Open your Vercel app: `https://your-app.vercel.app`
2. Open browser console (F12)
3. Look for:
   ```
   ✅ Connected to server
   Connected successfully using polling
   ```
4. Should NOT see "localhost"

### Test 3: Test Matchmaking Solo

1. Open app in 2 different browsers (Chrome + Firefox)
2. Login as guest in both
3. Both click "Quick Play"
4. Should match within 1 second!

### Test 4: Test with Friend

1. Send Vercel URL to friend
2. Both open at same time
3. Both click "Quick Play"
4. Should match immediately!

---

## Troubleshooting

### Issue: "Deploy failed"

**Check Render logs for errors:**
1. Go to Render dashboard
2. Click on your service
3. Check "Logs" tab
4. Look for error messages

**Common fixes:**
- Make sure `package.json` has all dependencies
- Verify start command: `node server/index.js`
- Check Node version compatibility

### Issue: "Service keeps sleeping"

**Render free tier sleeps after 15 min inactivity**

**Solutions:**
1. First player wakes it up (takes 30 seconds)
2. Use a ping service (https://uptimerobot.com - free)
3. Upgrade to paid tier ($7/month for always-on)

### Issue: "CORS error"

**Fix CLIENT_URL:**
1. Go to Render dashboard
2. Click your service
3. Go to "Environment" tab
4. Edit `CLIENT_URL` to match EXACT Vercel URL
5. Click "Save Changes"
6. Service will auto-redeploy

### Issue: "Still connecting to localhost"

**Frontend not updated:**
1. Clear browser cache (Ctrl+Shift+R)
2. Verify `VITE_API_URL` in Vercel settings
3. Make sure you redeployed frontend
4. Check console - should see Render URL, not localhost

### Issue: "Cannot find players"

**Check both players are:**
1. Using SAME Vercel URL (not localhost)
2. Connected to server (check console)
3. Clicking Quick Play at similar time
4. Seeing same "online players" count

---

## Verification Checklist

Before testing with friend:

- [ ] Backend deployed to Render (shows "Live")
- [ ] Backend health check works (`/api/health`)
- [ ] `VITE_API_URL` added to Vercel
- [ ] Frontend redeployed after adding env variable
- [ ] Open Vercel app, console shows "Connected to server"
- [ ] Console does NOT show "localhost"
- [ ] Can see online player count on Dashboard
- [ ] Solo test works (2 browser tabs match)
- [ ] Both you and friend using SAME Vercel URL

---

## Cost Breakdown

**Render.com Free Tier:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ✅ Automatic SSL
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 30 second cold start

**Render.com Paid ($7/month):**
- ✅ Always on (no sleeping)
- ✅ Instant response
- ✅ 512 MB RAM
- ✅ Better for production

**Vercel (Frontend):**
- ✅ FREE forever
- ✅ Unlimited bandwidth
- ✅ Automatic deployments

**Total: $0/month** (free tier) or **$7/month** (always-on)

---

## Alternative: Railway.app

If Render doesn't work, try Railway:

1. Go to **https://railway.app**
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `redeyessssss/ludo.com`
6. Railway auto-detects Node.js
7. Add same environment variables
8. Deploy!
9. Copy backend URL
10. Add to Vercel as `VITE_API_URL`

**Railway Free Tier:**
- $5 credit/month
- Usually enough for hobby projects
- No sleeping (always on)

---

## Summary

1. ✅ Deploy backend to **Render.com** (not Vercel)
2. ✅ Copy backend URL
3. ✅ Add `VITE_API_URL` to Vercel
4. ✅ Redeploy frontend
5. ✅ Test with friend!

**Why Render instead of Vercel?**
- Vercel = Serverless (no persistent connections)
- Render = Always-on server (perfect for Socket.io)

**Next step:** Follow this guide step-by-step. Takes 5-10 minutes total!
