// Mesaj tipi
export interface IMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: IMessageMetadata;
}

// Mesaj metadata tipi
export interface IMessageMetadata {
  file?: IFileMetadata;
  replyTo?: string; // Yanıt verilen mesaj ID'si
  isEdited?: boolean;
  editHistory?: string[];
  reactions?: IMessageReaction[];
  tags?: string[];
  [key: string]: any;
}

// Dosya metadata tipi
export interface IFileMetadata {
  name: string;
  size: number;
  type: string;
  url?: string;
  thumbnailUrl?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

// Mesaj reaksiyon tipi
export interface IMessageReaction {
  emoji: string;
  count: number;
  users: string[]; // Kullanıcı ID'leri
}

// Eski tip adlarını geriye dönük uyumluluk için tut
export type Message = IMessage;
export type MessageMetadata = IMessageMetadata;
export type FileMetadata = IFileMetadata;
export type MessageReaction = IMessageReaction;

// AI Model tipi
export interface IAIModel {
  id: string;
  type: string;
  modelName: string;
  displayName?: string;
  apiKey?: string;
  systemMessage?: string;
}

// AI Entegrasyon Konfigürasyonu
export interface IAIConfig {
  models: IAIModel[];
  defaultModel: string;
  parallelQueryEnabled: boolean;
}

// AI Yanıt tipi
export interface IAIResponse {
  text: string;
  model: string;
  metadata?: Record<string, any>;
}

// Eski tip adlarını geriye dönük uyumluluk için tut
export type AIModel = IAIModel;
export type AIConfig = IAIConfig;
export type AIResponse = IAIResponse;

// Kullanıcı tipi
export interface IUser {
  id: string;
  name: string;
  avatar?: string;
  preferences?: IUserPreferences;
}

// Kullanıcı Tercihleri
export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  messageDisplayDensity: 'compact' | 'comfortable';
  aiModel: string;
  notifications: boolean;
}

// Chat Geçmişi
export interface IChatHistory {
  id: string;
  title: string;
  lastMessageTimestamp: string;
  messages: IMessage[];
  participants: string[];
}

// Eski tip adlarını geriye dönük uyumluluk için tut
export type User = IUser;
export type UserPreferences = IUserPreferences;
export type ChatHistory = IChatHistory;
