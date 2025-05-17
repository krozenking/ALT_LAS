// Geçici olarak model yerine mock veri kullanıyoruz
// const Message = require('../models/message.model');
// const User = require('../models/user.model');
const aiService = require('../services/ai.service');

// Mock veri
const messages = [];
const users = [];
let messageId = 1;

const setupWebSocket = (io) => {
  // Track active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('join', async ({ userId, conversationId }) => {
      try {
        // Update user's active status
        if (userId) {
          // Mock kullanıcı güncelleme
          const userIndex = users.findIndex(u => u.id === userId);

          if (userIndex !== -1) {
            users[userIndex].lastActive = new Date().toISOString();
            activeUsers.set(socket.id, { userId, conversationId });

            // Join conversation room
            if (conversationId) {
              socket.join(conversationId);
              console.log(`User ${userId} joined conversation ${conversationId}`);

              // Add conversation to user's list if not already there
              if (!users[userIndex].conversations.includes(conversationId)) {
                users[userIndex].conversations.push(conversationId);
              }
            }
          } else {
            // Kullanıcı bulunamadıysa yeni oluştur
            const newUser = {
              id: userId,
              name: 'User ' + userId,
              lastActive: new Date().toISOString(),
              conversations: [conversationId]
            };

            users.push(newUser);
            activeUsers.set(socket.id, { userId, conversationId });

            if (conversationId) {
              socket.join(conversationId);
              console.log(`New user ${userId} joined conversation ${conversationId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error in join event:', error);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ content, userId, conversationId }) => {
      try {
        if (!content || !conversationId) {
          socket.emit('error', { message: 'Content and conversationId are required' });
          return;
        }

        // Create user message
        const userMessage = {
          id: `msg_${messageId++}`,
          content,
          sender: 'user',
          userId,
          conversationId,
          timestamp: new Date().toISOString()
        };

        messages.push(userMessage);

        // Broadcast to all clients in the conversation
        io.to(conversationId).emit('newMessage', userMessage);

        // Get AI response
        socket.emit('aiTyping', { conversationId });

        // Gerçekçi bir gecikme ekleyelim
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const aiResponse = await aiService.getResponse(content, conversationId);

        // Create AI message
        const aiMessage = {
          id: `msg_${messageId++}`,
          content: aiResponse,
          sender: 'ai',
          conversationId,
          timestamp: new Date().toISOString()
        };

        messages.push(aiMessage);

        // Broadcast AI response to all clients in the conversation
        io.to(conversationId).emit('newMessage', aiMessage);
        socket.emit('aiTypingDone', { conversationId });
      } catch (error) {
        console.error('Error in sendMessage event:', error);
        socket.emit('error', { message: 'Error sending message', error: error.message });
      }
    });

    // Handle user typing
    socket.on('typing', ({ userId, conversationId, isTyping }) => {
      socket.to(conversationId).emit('userTyping', { userId, isTyping });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        activeUsers.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = setupWebSocket;
