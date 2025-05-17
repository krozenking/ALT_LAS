const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../index');
const Message = require('../models/message.model');
const User = require('../models/user.model');

// Mock AI service
jest.mock('../services/ai.service', () => ({
  getResponse: jest.fn().mockResolvedValue('Bu bir test AI yanıtıdır.')
}));

describe('API Tests', () => {
  let testUser;
  const testConversationId = 'test-conversation-id';

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alt_las_chat_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear test data
    await Message.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      avatar: 'https://example.com/avatar.png'
    });
  });

  afterAll(async () => {
    // Close database connection and server
    await mongoose.connection.close();
    server.close();
  });

  describe('Message API', () => {
    it('should get messages for a conversation', async () => {
      // Create test messages
      await Message.create([
        {
          content: 'Test message 1',
          sender: 'user',
          userId: testUser._id,
          conversationId: testConversationId,
          timestamp: new Date()
        },
        {
          content: 'Test message 2',
          sender: 'ai',
          conversationId: testConversationId,
          timestamp: new Date()
        }
      ]);

      const response = await request(app)
        .get(`/api/messages/conversation/${testConversationId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].content).toBe('Test message 1');
      expect(response.body[1].content).toBe('Test message 2');
    });

    it('should send a message and get AI response', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          content: 'Hello, AI!',
          userId: testUser._id,
          conversationId: testConversationId
        })
        .expect(201);

      expect(response.body).toHaveProperty('userMessage');
      expect(response.body).toHaveProperty('aiMessage');
      expect(response.body.userMessage.content).toBe('Hello, AI!');
      expect(response.body.aiMessage.content).toBe('Bu bir test AI yanıtıdır.');
    });
  });

  describe('User API', () => {
    it('should get a user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser._id}`)
        .expect(200);

      expect(response.body.name).toBe('Test User');
      expect(response.body.avatar).toBe('https://example.com/avatar.png');
    });

    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'New Test User',
          avatar: 'https://example.com/new-avatar.png'
        })
        .expect(201);

      expect(response.body.name).toBe('New Test User');
      expect(response.body.avatar).toBe('https://example.com/new-avatar.png');
    });

    it('should add a conversation to a user', async () => {
      const response = await request(app)
        .post(`/api/users/${testUser._id}/conversations`)
        .send({
          conversationId: 'new-test-conversation-id'
        })
        .expect(200);

      expect(response.body.conversations).toContain('new-test-conversation-id');
    });
  });
});
