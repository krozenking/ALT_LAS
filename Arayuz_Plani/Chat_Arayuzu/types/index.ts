export interface User {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
  attachments?: Attachment[];
  replyTo?: string; // ID of the message being replied to
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string; // For group conversations
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  avatar?: string; // For group conversations
  createdBy?: string; // User ID of the creator for group conversations
  admins?: string[]; // User IDs of admins for group conversations
}

export interface GroupConversation extends Conversation {
  type: 'group';
  name: string;
  avatar: string;
  createdBy: string;
  admins: string[];
}

export interface SearchResult {
  type: 'user' | 'conversation' | 'message';
  id: string;
  name?: string;
  avatar?: string;
  text?: string;
  timestamp?: string;
  conversationId?: string;
}

export interface ChatState {
  users: User[];
  messages: Message[];
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
  searchResults: SearchResult[];
  isSearching: boolean;
}
