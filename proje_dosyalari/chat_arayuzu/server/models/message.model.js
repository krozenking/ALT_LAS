const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.sender === 'user';
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  conversationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ conversationId: 1, timestamp: 1 });
messageSchema.index({ userId: 1, timestamp: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
