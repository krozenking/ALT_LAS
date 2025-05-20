// File metadata interface
export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
}

// Message interface
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: {
    file?: FileMetadata;
  };
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
