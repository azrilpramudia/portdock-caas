# Base Node.js image with lightweight Alpine Linux
FROM node:20-alpine AS base

# Install build dependencies for native addons (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies safely
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Set default port and environment
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]
