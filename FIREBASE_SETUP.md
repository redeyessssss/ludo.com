# 🔥 Firebase Setup Guide

## Overview

Your Ludo game now supports Firebase for persistent data storage! The app will automatically fall back to in-memory storage if Firebase is not configured, so you can develop locally without Firebase.

## Why Firebase?

- ✅ **Persistent Data**: Users and games are saved permanently
- ✅ **Real-time Updates**: Instant synchronization across devices
- ✅ **Scalable**: Handles thousands of users
- ✅ **Free Tier**: Generous free quota for development
- ✅ **Easy Deployment**: Works on Vercel, Render, etc.

---

## Step-by-Step Setup

### 1. Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `ludo-game` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firestore Database (2 minutes)

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (closest to your users)
5. Click **"Enable"**

### 3. Set Firestore Security Rules (1 minute)

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;  // Anyone can read user profiles
      allow write: if request.auth != null;  // Only authenticated users can write
    }
    
    // Games collection
    match /games/{gameId} {
      allow read: if true;  // Anyone can read game results
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

3. Click **"Publish"**

### 4. Get Frontend Credentials (3 minutes)

1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `ludo-web`
5. Click **"Register app"**
6. Copy the `firebaseConfig` object
7. Add to your `.env` file:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Get Backend Credentials (3 minutes)

1. Go to **Project Settings** → **Service Accounts** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** (downloads a JSON file)
4. Open the JSON file and copy values to `.env`:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**⚠️ IMPORTANT**: Keep the private key secure! Never commit it to Git.

### 6. Update .env File

1. Copy the example file:
```bash
cp .env.firebase.example .env
```

2. Fill in all the Firebase credentials from steps 4 and 5

3. Your `.env` should look like:
```bash
# Frontend
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ludo-game.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ludo-game
VITE_FIREBASE_STORAGE_BUCKET=ludo-game.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend
FIREBASE_PROJECT_ID=ludo-game
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ludo-game.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Other
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### 7. Restart Server

```bash
npm run dev
```

You should see:
```
✅ Firebase Admin initialized successfully
UserService using: Firebase storage
GameService using: Firebase storage
```

---

## Testing Firebase Integration

### Test 1: Register a User

1. Go to http://localhost:5173/register
2. Create a new account
3. Check Firebase Console → Firestore Database
4. You should see a new document in the `users` collection

### Test 2: Play a Game

1. Login and play a game (vs bot or multiplayer)
2. Check Firestore → `games` collection
3. You should see the game result saved

### Test 3: Leaderboard

1. Go to http://localhost:5173/leaderboard
2. You should see users from Firebase
3. Ratings should persist across server restarts

---

## Production Deployment

### Vercel (Frontend)

Add environment variables in Vercel Dashboard:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=https://your-backend.onrender.com
```

### Render (Backend)

Add environment variables in Render Dashboard:

```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_CERT_URL=...
JWT_SECRET=...
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3001
```

**Note**: For `FIREBASE_PRIVATE_KEY`, make sure to include the quotes and `\n` characters.

---

## Troubleshooting

### Issue: "Firebase Admin not initialized"

**Solution**: Check that all Firebase environment variables are set correctly in `.env`

### Issue: "Permission denied" in Firestore

**Solution**: Update Firestore security rules (see Step 3)

### Issue: "Invalid private key"

**Solution**: Make sure `FIREBASE_PRIVATE_KEY` includes:
- Opening quotes
- `-----BEGIN PRIVATE KEY-----\n`
- The key content
- `\n-----END PRIVATE KEY-----\n`
- Closing quotes

### Issue: App still uses in-memory storage

**Solution**: 
1. Check server logs for Firebase initialization errors
2. Verify all environment variables are set
3. Restart the server

---

## Fallback Behavior

If Firebase is not configured, the app automatically falls back to in-memory storage:

- ✅ All features still work
- ⚠️ Data is lost when server restarts
- 💡 Perfect for local development

You'll see this message:
```
⚠️ Firebase Admin not initialized - missing credentials
💡 App will use in-memory storage for development
```

---

## Cost

Firebase offers a generous free tier:

- **Firestore**: 50,000 reads/day, 20,000 writes/day
- **Authentication**: Unlimited
- **Storage**: 1 GB

This is more than enough for development and small-scale production!

---

## Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Keep private key secure
3. ✅ Use environment variables in production
4. ✅ Update Firestore security rules for production
5. ✅ Enable Firebase Authentication for better security

---

## Next Steps

1. ✅ Set up Firebase (follow steps above)
2. ✅ Test locally
3. ✅ Deploy to production with Firebase credentials
4. 🎉 Enjoy persistent data storage!

Need help? Check the Firebase documentation or ask for assistance!
