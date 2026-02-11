# How to Add Environment Variable in Vercel

## Step-by-Step Guide with Screenshots

### Step 1: Go to Vercel Dashboard
1. Open your browser and go to: https://vercel.com/dashboard
2. Log in if needed

### Step 2: Find Your Project
1. Look for your project named: `ludo-com-eta` or similar
2. Click on the project name

### Step 3: Go to Settings
1. At the top of the page, you'll see tabs: Overview, Deployments, Analytics, Settings, etc.
2. Click on **Settings** tab

### Step 4: Find Environment Variables
1. On the left sidebar, look for **Environment Variables**
2. Click on it

### Step 5: Add New Variable
1. You'll see a form with fields:
   - **Key** (or Name)
   - **Value**
   - **Environment** (checkboxes for Production, Preview, Development)

2. Fill in:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ludo-backend-ujnr.onrender.com`
   - **Environment**: Check ALL three boxes (Production, Preview, Development)

3. Click **Save** or **Add** button

### Step 6: Redeploy
1. Go back to the **Deployments** tab (at the top)
2. Find the most recent deployment (should be at the top)
3. Click the **three dots (...)** on the right side of that deployment
4. Click **Redeploy**
5. Confirm the redeploy

### Step 7: Wait
- Wait 2-3 minutes for the deployment to complete
- You'll see a green checkmark when it's done

---

## What if I can't find it?

### Alternative Method: Use Vercel CLI

If you have trouble finding it in the dashboard, you can use the command line:

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variable
vercel env add VITE_API_URL production
# When prompted, enter: https://ludo-backend-ujnr.onrender.com

# Also add for preview and development
vercel env add VITE_API_URL preview
vercel env add VITE_API_URL development

# Redeploy
vercel --prod
```

---

## How to Verify It's Added

After adding the variable:

1. Go to Settings → Environment Variables
2. You should see `VITE_API_URL` listed
3. The value should show `https://ludo-backend-ujnr.onrender.com`
4. All three environments should be checked

---

## What Happens Next?

Once you add the variable and redeploy:

1. Vercel will rebuild your app with the new environment variable
2. Your frontend will now connect to the backend at `https://ludo-backend-ujnr.onrender.com`
3. Login, Register, and "Play with Bot" will all work
4. The deployment takes 2-3 minutes

---

## Still Not Working?

If you've added the variable and redeployed but it's still not working:

1. Check browser console (F12) for errors
2. Make sure the variable name is exactly: `VITE_API_URL` (case-sensitive)
3. Make sure the value has no trailing slash: `https://ludo-backend-ujnr.onrender.com`
4. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## Need Help?

Share a screenshot of:
1. Your Vercel Environment Variables page
2. Your browser console (F12) when you try to login
3. The Vercel deployment logs

This will help diagnose the issue!
