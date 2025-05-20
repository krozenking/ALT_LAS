# Build stage
FROM node:16-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
ARG REACT_APP_VERSION
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
