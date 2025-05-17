const express = require('express');
const router = express.Router();
// Geçici olarak model yerine mock veri kullanıyoruz
// const User = require('../models/user.model');

// Mock veri
const users = [];
let userId = 1;

// Get all users
router.get('/', async (req, res) => {
  try {
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = {
      id: `user_${userId++}`,
      name,
      avatar,
      lastActive: new Date().toISOString(),
      conversations: []
    };

    users.push(user);

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update a user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, avatar } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      avatar: avatar || users[userIndex].avatar,
      lastActive: new Date().toISOString()
    };

    res.status(200).json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Add conversation to user
router.post('/:userId/conversations', async (req, res) => {
  try {
    const { userId } = req.params;
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: 'ConversationId is required' });
    }

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!users[userIndex].conversations.includes(conversationId)) {
      users[userIndex].conversations.push(conversationId);
    }

    users[userIndex].lastActive = new Date().toISOString();

    res.status(200).json(users[userIndex]);
  } catch (error) {
    console.error('Error adding conversation:', error);
    res.status(500).json({ message: 'Error adding conversation', error: error.message });
  }
});

module.exports = router;
