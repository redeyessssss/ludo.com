# 🚀 Deploy to Fly.io (Complete Guide)

## Why Fly.io?

- ✅ **Free tier** - $5 credit/month (enough for hobby projects)
- ✅ **Always on** - No sleeping
- ✅ **Fast** - Edge network worldwide
- ✅ **WebSocket support** - Perfect for Socket.io
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **Simple CLI** - One command deployment

---

## Prerequisites

You need to install Fly CLI on your computer.

### Install Fly CLI

**On macOS:**
```bash
brew install flyctl
```

**On Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**On Windows:**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

---

## Step-by-Step Deployment

### Step 1: Sign Up (1 minute)

```bash
fly auth signup
```

This will:
1. Open your browser
2. Create a Fly.io account
3. Verify your email
4. Add credit card (required, but free tier available)

**Or if you already have an account:**
```bash
fly auth login
```

### Step 2: Navigate to Your Project

```bash
cd /path/to/your/ludo.com
```

### Step 3: Launch Your App (2 minutes)

```bash
fly launch
```

**You'll be asked several questions:**

```
? Choose an app name (leave blank to generate one): ludo-backend
? Choose a region for deployment: [Choose closest to you]
? Would you like to set up a Postgresql database? No
? Would you like to set up an Upstash Redis database? No
? Would you like to deploy now? No
```

**Important**: Say **"No"** to deploy now - we need to add environment variables first!

### Step 4: Set Environment Variables (1 minute)

```bash
fly secrets set NODE_ENV=production
fly secrets set CLIENT_URL=https://your-vercel-app.vercel.app
fly secrets set JWT_SECRET=ludo-secret-key-12345-change-this
```

⚠️ Replace `https://your-vercel-app.vercel.app` with YOUR actual Vercel URL!

### Step 5: Deploy! (2-3 minutes)

```bash
fly deploy
```

This will:
1. Build Docker image
2. Push to Fly.io
3. Deploy your app
4. Show you the URL

**You'll see:**
```
==> Building image
==> Pushing image to fly
==> Deploying
 ✓ [1/1] Machine created
 ✓ Machine started
 ✓ Health checks passing

Visit your app at: https://ludo-backend.fly.dev
```

### Step 6: Get Your URL

Your backend URL will be:
```
https://ludo-backend.fly.dev
```

Or whatever app name you chose.

**Copy this URL!**

### Step 7: Test Your Backend

Open in browser:
```
https://ludo-backend.fly.dev/api/health
```

Should see:
```json
{"status":"ok","timestamp":"..."}
```

✅ Working!

---

## Update Vercel Frontend

1. Go to **Vercel Dashboard** → Your project
2. **Settings** → **Environment Variables**
3. Add:
   ```
   Name: VITE_API_URL
   Value: https://ludo-backend.fly.dev
   ```
4. **Deployments** → **Redeploy**
5. Done! 🎉

---

## Useful Commands

### Check App Status
```bash
fly status
```

### View Logs
```bash
fly logs
```

### Open App in Browser
```bash
fly open
```

### SSH into Your App
```bash
fly ssh console
```

### Scale Your App
```bash
fly scale count 1
```

### Update Environment Variables
```bash
fly secrets set KEY=value
```

### List All Secrets
```bash
fly secrets list
```

---

## Updating Your Code

When you make changes to your code:

1. **Commit to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```

2. **Deploy to Fly.io:**
   ```bash
   fly deploy
   ```

That's it! Fly.io will rebuild and redeploy.

---

## Configuration Files

I've created these files for you:

### `fly.toml` (Main config)
- App name and region
- Port configuration
- VM settings

### `Dockerfile` (Build instructions)
- Uses Node.js 18
- Installs dependencies
- Runs server

### `.dockerignore` (Exclude files)
- Excludes frontend files
- Only deploys backend

---

## Troubleshooting

### "fly: command not found"

Install Fly CLI:
```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh
```

### "App not starting"

Check logs:
```bash
fly logs
```

Look for errors and fix them.

### "Port binding error"

Make sure your `server/index.js` uses:
```javascript
const PORT = process.env.PORT || 3001;
```

### "Health checks failing"

1. Check if server is running:
   ```bash
   fly logs
   ```
2. Verify port is 3001 in `fly.toml`
3. Make sure `/api/health` endpoint exists

### "Out of memory"

Increase memory:
```bash
fly scale memory 512
```

---

## Cost Breakdown

**Fly.io Free Tier:**
- ✅ $5 credit/month (free)
- ✅ 3 shared-cpu-1x VMs (256MB RAM each)
- ✅ 160GB outbound data transfer
- ✅ Enough for hobby projects!

**Your app uses:**
- 1 VM × 256MB RAM = ~$1.94/month
- Bandwidth: Usually < $1/month
- **Total: ~$3/month** (covered by free $5 credit!)

**If you exceed free tier:**
- Pay-as-you-go
- ~$5-10/month for small apps

---

## Advantages Over Other Platforms

| Feature | Fly.io | Render | Glitch |
|---------|--------|--------|--------|
| Setup | CLI | Web UI | Web UI |
| Always On | ✅ Yes | ❌ Sleeps | ✅ Yes |
| Free Tier | $5 credit | 750hrs | Unlimited |
| Speed | ⚡ Fast | 🐢 Slow | 🐢 Slow |
| WebSocket | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto-Scale | ✅ Yes | ❌ No | ❌ No |
| Global CDN | ✅ Yes | ❌ No | ❌ No |

---

## Quick Reference

### Deploy
```bash
fly deploy
```

### Logs
```bash
fly logs
```

### Status
```bash
fly status
```

### Open App
```bash
fly open
```

### Set Secret
```bash
fly secrets set KEY=value
```

---

## Summary

1. ✅ Install Fly CLI
2. ✅ Run `fly launch`
3. ✅ Set environment variables
4. ✅ Run `fly deploy`
5. ✅ Copy URL
6. ✅ Add to Vercel
7. ✅ Done!

**Total time: ~5 minutes**

---

## Next Steps

After deployment:

1. Test backend: `https://your-app.fly.dev/api/health`
2. Add URL to Vercel as `VITE_API_URL`
3. Redeploy frontend
4. Test with friend!
5. Enjoy your working multiplayer game! 🎲

---

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Community**: https://community.fly.io
- **Status**: https://status.fly.io

---

## Alternative: Deploy via GitHub Actions

Want automatic deployment on every push?

Create `.github/workflows/fly.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get your token:
```bash
fly auth token
```

Add to GitHub Secrets:
1. GitHub repo → Settings → Secrets
2. Add `FLY_API_TOKEN`
3. Done! Auto-deploy on every push!
