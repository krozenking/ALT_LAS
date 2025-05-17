const express = require('express');
const router = express.Router();
// Geçici olarak model yerine mock veri kullanıyoruz
// const Message = require('../models/message.model');
const aiService = require('../services/ai.service');

// Mock veri
const messages = [];
let messageId = 1;

// Get all messages for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Mock veri için filtreleme
    const filteredMessages = messages.filter(msg => msg.conversationId === conversationId);

    if (before) {
      const beforeDate = new Date(before);
      filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) < beforeDate);
    }

    // Sıralama ve limit
    const sortedMessages = filteredMessages.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, parseInt(limit));

    res.status(200).json(sortedMessages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { content, userId, conversationId } = req.body;

    if (!content || !conversationId) {
      return res.status(400).json({ message: 'Content and conversationId are required' });
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

    // Get AI response
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

    res.status(201).json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const messageIndex = messages.findIndex(msg => msg.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    messages.splice(messageIndex, 1);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;
