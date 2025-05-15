# ---- Builder Stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev for build)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (compile TypeScript)
RUN npm run build

# Prune dev dependencies for a smaller node_modules to copy
RUN npm prune --production

# ---- Runner Stage ----
FROM node:18-alpine
WORKDIR /app

# Copy package.json (needed if npm start refers to it, or for metadata)
COPY --from=builder /app/package.json ./
# If package-lock.json is needed for 'npm start' or for consistency, copy it too.
# COPY --from=builder /app/package-lock.json ./

# Copy only production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled code
COPY --from=builder /app/dist ./dist

EXPOSE 3000
# Ensure the start script in package.json points to the compiled JS in dist/
# e.g., "start": "node dist/index.js"
CMD [ "npm", "start" ]
