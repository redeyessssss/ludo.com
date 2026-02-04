# Troubleshooting Guide

## Connection Issues

### ERR_BLOCKED_BY_CLIENT Error

If you see `ERR_BLOCKED_BY_CLIENT` errors in the browser console, this means a browser extension is blocking the WebSocket connection.

**Common causes:**
- Ad blockers (uBlock Origin, AdBlock Plus, etc.)
- Privacy extensions (Privacy Badger, Ghostery, etc.)
- VPN extensions
- Firewall software

**Solutions:**

1. **Disable ad blockers temporarily**
   - Click the extension icon in your browser
   - Disable it for `localhost:5173` and `localhost:3001`
   - Refresh the page

2. **Whitelist localhost in your ad blocker**
   - Open your ad blocker settings
   - Add `localhost` or `127.0.0.1` to the whitelist
   - Save and refresh

3. **Try a different browser**
   - Chrome/Edge without extensions
   - Firefox in private mode
   - Safari

4. **Check browser console**
   - Open DevTools (F12)
   - Look for connection status messages:
     - ✅ "Connected to server" = Working!
     - ❌ "Connection error" = Check extensions

### Connection Status Indicator

The Dashboard now shows a connection status banner:
- 🟡 **Yellow**: Connecting to server...
- 🔴 **Red**: Connection blocked (disable ad blockers)
- 🟢 **No banner**: Connected successfully!

## Server Not Running

If you see "Cannot connect to server" errors:

```bash
# Start the server
npm run dev
```

The server should be running on:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Port Already in Use

If port 3001 is already in use:

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change the port in .env
PORT=3002
```

## WebSocket Transport

The app now uses both WebSocket and polling transports for better compatibility:
- **WebSocket**: Fast, real-time (preferred)
- **Polling**: Fallback if WebSocket is blocked

## Still Having Issues?

1. Check the browser console for detailed error messages
2. Ensure both frontend and backend are running
3. Try accessing http://localhost:3001/api/health to verify the server is up
4. Clear browser cache and cookies
5. Try incognito/private browsing mode

## Production Deployment

For production, make sure to:
1. Update CORS settings in `server/index.js`
2. Use environment variables for URLs
3. Enable HTTPS for WebSocket connections
4. Configure your hosting provider to support WebSockets
