const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const mongoose = require('mongoose');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const setupWebSocket = require('../websocket/socket');

// Mock AI service
jest.mock('../services/ai.service', () => ({
  getResponse: jest.fn().mockResolvedValue('Bu bir test AI yanıtıdır.')
}));

describe('WebSocket Tests', () => {
  let io, serverSocket, clientSocket, testUser;
  const testConversationId = 'test-conversation-id';
  const port = 3001;

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
    // Close database connection
    await mongoose.connection.close();
  });

  beforeEach((done) => {
    // Create server and socket
    const httpServer = createServer();
    io = new Server(httpServer);
    setupWebSocket(io);
    httpServer.listen(port);

    // Create client socket
    clientSocket = Client(`http://localhost:${port}`);
    
    io.on('connection', (socket) => {
      serverSocket = socket;
    });

    clientSocket.on('connect', done);
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
  });

  test('should join a conversation', (done) => {
    clientSocket.emit('join', {
      userId: testUser._id.toString(),
      conversationId: testConversationId
    });

    // Wait for a moment to ensure the join event is processed
    setTimeout(done, 100);
  });

  test('should send and receive messages', (done) => {
    // Listen for new message
    clientSocket.on('newMessage', (message) => {
      expect(message.content).toBe('Test message');
      expect(message.sender).toBe('user');
      expect(message.conversationId).toBe(testConversationId);
      done();
    });

    // Send message
    clientSocket.emit('sendMessage', {
      content: 'Test message',
      userId: testUser._id.toString(),
      conversationId: testConversationId
    });
  });

  test('should receive AI response after sending message', (done) => {
    let aiTypingReceived = false;
    let messageCount = 0;

    // Listen for AI typing
    clientSocket.on('aiTyping', (data) => {
      expect(data.conversationId).toBe(testConversationId);
      aiTypingReceived = true;
    });

    // Listen for new messages
    clientSocket.on('newMessage', (message) => {
      messageCount++;
      
      // First message should be the user message
      if (messageCount === 1) {
        expect(message.content).toBe('Hello AI');
        expect(message.sender).toBe('user');
      }
      
      // Second message should be the AI response
      if (messageCount === 2) {
        expect(message.content).toBe('Bu bir test AI yanıtıdır.');
        expect(message.sender).toBe('ai');
        expect(aiTypingReceived).toBe(true);
        done();
      }
    });

    // Send message
    clientSocket.emit('sendMessage', {
      content: 'Hello AI',
      userId: testUser._id.toString(),
      conversationId: testConversationId
    });
  });

  test('should broadcast typing status', (done) => {
    // Listen for typing status
    clientSocket.on('userTyping', (data) => {
      expect(data.userId).toBe(testUser._id.toString());
      expect(data.isTyping).toBe(true);
      done();
    });

    // Join conversation first
    clientSocket.emit('join', {
      userId: testUser._id.toString(),
      conversationId: testConversationId
    });

    // Wait a moment for join to complete
    setTimeout(() => {
      // Send typing status
      clientSocket.emit('typing', {
        userId: testUser._id.toString(),
        conversationId: testConversationId,
        isTyping: true
      });
    }, 100);
  });
});
