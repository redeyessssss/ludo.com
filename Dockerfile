# Dockerfile for Fly.io deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy server code
COPY server ./server

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server/index.js"]
