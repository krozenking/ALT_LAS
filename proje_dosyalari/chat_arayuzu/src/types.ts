// Message interface
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  conversationId?: string;
  userId?: string;
}

// User interface
export interface User {
  id: string;
  name: string;
  avatar?: string;
  lastActive?: string;
  conversations?: string[];
}

// Conversation interface
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
