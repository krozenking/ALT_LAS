import axios from 'axios';
// Import types from types.ts
import type { Message, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Service for interacting with the backend
 */
class ApiService {
  /**
   * Get all messages for a conversation
   * @param conversationId - The ID of the conversation
   * @param limit - Maximum number of messages to retrieve
   * @param before - Timestamp to get messages before
   */
  async getMessages(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (before) params.append('before', before);

      const response = await axios.get(`${API_URL}/messages/conversation/${conversationId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a message
   * @param content - The message content
   * @param userId - The ID of the user sending the message
   * @param conversationId - The ID of the conversation
   */
  async sendMessage(content: string, userId: string, conversationId: string): Promise<{ userMessage: Message, aiMessage: Message }> {
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        content,
        userId,
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get a user by ID
   * @param userId - The ID of the user
   */
  async getUser(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param name - The name of the user
   * @param avatar - The avatar URL of the user (optional)
   */
  async createUser(name: string, avatar?: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        name,
        avatar
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Add a conversation to a user
   * @param userId - The ID of the user
   * @param conversationId - The ID of the conversation
   */
  async addConversation(userId: string, conversationId: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/conversations`, {
        conversationId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding conversation:', error);
      throw error;
    }
  }
}

export default new ApiService();
