# Vercel + Render Deployment Checklist

## ✅ Current Status Check

### Backend (Render)
- [x] Backend is deployed on Render
- [x] Backend URL: `https://ludo-backend-ujnr.onrender.com`
- [x] Backend is running (health check confirmed)
- [ ] Environment variables set in Render:
  - [ ] `CLIENT_URL` = `https://ludo-com-eta.vercel.app`
  - [ ] `JWT_SECRET` = Some secret key
  - [ ] `NODE_ENV` = production
  - [ ] `PORT` = 3001

### Frontend (Vercel)
- [x] Frontend is deployed on Vercel
- [x] Frontend URL: `https://ludo-com-eta.vercel.app`
- [ ] Environment variable set in Vercel:
  - [ ] `VITE_API_URL` = `https://ludo-backend-ujnr.onrender.com`

### Code Changes (v7.3.5)
- [x] Login page now uses `VITE_API_URL` environment variable
- [x] Register page now uses `VITE_API_URL` environment variable
- [x] All pages now properly configured for production
- [x] Changes committed and pushed to GitHub

---

## 🔧 NEXT STEPS - ACTION REQUIRED

### Step 1: Set Backend URL in Vercel (CRITICAL)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `ludo-com-eta`
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ludo-backend-ujnr.onrender.com`
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click **...** on latest deployment → **Redeploy**

### Step 2: Verify Frontend URL in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service: `ludo-backend`
3. Go to **Environment** tab
4. Verify `CLIENT_URL` variable is set to:
   - **Key**: `CLIENT_URL`
   - **Value**: `https://ludo-com-eta.vercel.app`
5. If not set or incorrect, update it and save (Render will auto-redeploy)

### Step 3: Wait for Deployments

- Vercel redeploy: ~2-3 minutes
- Render redeploy (if needed): ~5-10 minutes
- Total wait time: ~5-10 minutes

---

## 🔧 How to Fix "Features Not Working"

### Problem: Frontend can't connect to backend

**Symptoms:**
- "Connection blocked" error
- "Play with Bot" button doesn't work
- Matchmaking doesn't work
- Profile page shows errors

**Solution:**

### Step 1: Set Backend URL in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com` (your actual Render URL)
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click **...** on latest deployment → **Redeploy**

### Step 2: Set Frontend URL in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Environment** tab
4. Find or add `CLIENT_URL` variable:
   - **Key**: `CLIENT_URL`
   - **Value**: `https://your-vercel-frontend-url.vercel.app` (your actual Vercel URL)
5. Click **Save Changes**
6. Render will auto-redeploy

### Step 3: Verify URLs Match

**Important:** URLs must match EXACTLY (no trailing slashes!)

✅ Correct:
```
Vercel: VITE_API_URL=https://ludo-backend.onrender.com
Render: CLIENT_URL=https://ludo-com.vercel.app
```

❌ Wrong:
```
Vercel: VITE_API_URL=https://ludo-backend.onrender.com/  ← trailing slash
Render: CLIENT_URL=http://ludo-com.vercel.app  ← http instead of https
```

---

## 🧪 Testing After Deployment

### Test 1: Check Backend is Running
Open in browser: `https://your-render-backend.onrender.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-12T..."
}
```

### Test 2: Check Frontend Connects to Backend
1. Open your Vercel site: `https://your-vercel-site.vercel.app`
2. Open browser console (F12)
3. Look for: `✅ Connected to server`
4. Should NOT see: CORS errors or connection errors

### Test 3: Test Features
- [ ] Register/Login works
- [ ] Dashboard loads
- [ ] "Play with Bot" button works
- [ ] Can select 2, 3, or 4 players
- [ ] Game starts and bots play
- [ ] Leaderboard shows data
- [ ] Profile page loads

---

## 🐛 Troubleshooting

### Issue: "Connection blocked" or CORS error

**Check:**
1. Is `CLIENT_URL` in Render set to your Vercel URL?
2. Does it use `https://` not `http://`?
3. No trailing slash?

**Fix:**
```bash
# In Render Environment Variables:
CLIENT_URL=https://your-exact-vercel-url.vercel.app
```

### Issue: "Play with Bot" doesn't work

**Check:**
1. Is `VITE_API_URL` set in Vercel?
2. Did you redeploy Vercel after adding the variable?
3. Is Render backend running? (check logs)

**Fix:**
```bash
# In Vercel Environment Variables:
VITE_API_URL=https://your-render-backend.onrender.com
```

### Issue: Backend sleeps (Render free tier)

**Symptom:** First request takes 30+ seconds

**Explanation:** Render free tier sleeps after 15 minutes of inactivity

**Solutions:**
1. Wait 30 seconds for backend to wake up
2. Upgrade to Render paid plan ($7/month for always-on)
3. Use a service like UptimeRobot to ping backend every 10 minutes

### Issue: Environment variables not working

**Check:**
1. Did you redeploy after adding variables?
2. Are variables set for correct environment (Production)?
3. Variable names are case-sensitive!

**Fix:**
- Vercel: Redeploy from Deployments tab
- Render: Auto-redeploys when you save environment variables

---

## 📝 Quick Reference

### Your URLs (Fill these in!)

```
Frontend (Vercel): https://_____________________.vercel.app
Backend (Render):  https://_____________________.onrender.com
```

### Environment Variables

**Vercel (Frontend):**
```
VITE_API_URL=https://[YOUR-RENDER-BACKEND].onrender.com
```

**Render (Backend):**
```
CLIENT_URL=https://[YOUR-VERCEL-FRONTEND].vercel.app
JWT_SECRET=[RANDOM-SECRET-KEY]
NODE_ENV=production
PORT=3001
```

---

## 🎯 Final Checklist

Before asking for help, verify:

- [ ] Backend is deployed and running on Render
- [ ] Frontend is deployed on Vercel
- [ ] `VITE_API_URL` is set in Vercel environment variables
- [ ] `CLIENT_URL` is set in Render environment variables
- [ ] Both services have been redeployed after setting variables
- [ ] URLs use `https://` and have no trailing slashes
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Browser console shows "Connected to server"

---

## 🆘 Still Not Working?

If you've checked everything above and it still doesn't work:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your service
   - Click "Logs" tab
   - Look for errors

2. **Check Browser Console:**
   - Open your Vercel site
   - Press F12 to open console
   - Look for red errors
   - Share the error messages

3. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to use a feature
   - Look for failed requests
   - Check if requests go to correct backend URL

---

## 💡 Pro Tips

1. **Always use HTTPS in production** (not HTTP)
2. **No trailing slashes in URLs**
3. **Redeploy after changing environment variables**
4. **Check logs when something doesn't work**
5. **Test backend health endpoint first**
6. **Render free tier sleeps - be patient on first load**

---

## 📞 Need Help?

Share these details:
1. Your Vercel frontend URL
2. Your Render backend URL
3. Screenshot of Vercel environment variables
4. Screenshot of Render environment variables
5. Browser console errors
6. Render logs (if any errors)

Good luck! 🚀
