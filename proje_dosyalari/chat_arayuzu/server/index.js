const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Routes
const messageRoutes = require('./api/message.routes');
const userRoutes = require('./api/user.routes');

// WebSocket handlers
const setupWebSocket = require('./websocket/socket');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Database connection
// Geçici olarak MongoDB bağlantısını devre dışı bırakıyoruz
console.log('MongoDB connection disabled for development');

// API routes
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Client error logging endpoint
app.post('/log-client-error', (req, res) => {
  const errorData = req.body;
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...errorData
  };

  // Write to log file
  fs.appendFile(
    path.join(logsDir, 'client-errors.log'),
    JSON.stringify(logEntry) + '\n',
    (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    }
  );

  // Also log to console for immediate visibility
  console.error('CLIENT ERROR:', logEntry);

  res.status(200).send({ success: true });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Setup WebSocket
setupWebSocket(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
