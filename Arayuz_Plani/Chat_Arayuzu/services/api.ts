import { User, Message, Conversation } from '../types';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch users from the API
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch a user by ID from the API
 */
export const fetchUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetch conversations for a user from the API
 */
export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/conversations`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching conversations for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetch messages for a conversation from the API
 */
export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Send a message to a conversation
 */
export const sendMessage = async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Create a new direct conversation
 */
export const createDirectConversation = async (participants: string[]): Promise<Conversation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'direct',
        participants
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating direct conversation:', error);
    throw error;
  }
};

/**
 * Create a new group conversation
 */
export const createGroupConversation = async (
  name: string,
  participants: string[],
  createdBy: string,
  avatar?: string
): Promise<GroupConversation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'group',
        name,
        participants,
        createdBy,
        admins: [createdBy],
        avatar
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating group conversation:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error marking messages as read for conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Upload a file
 */
export const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number; mimeType: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Add user to group conversation
 */
export const addUserToGroup = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error adding user to group ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Remove user from group conversation
 */
export const removeUserFromGroup = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error removing user from group ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Make user admin in group conversation
 */
export const makeUserAdmin = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error making user admin in group ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Remove admin status from user in group conversation
 */
export const removeUserAdmin = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/admins/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error removing admin status from user in group ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Update group conversation
 */
export const updateGroupConversation = async (
  conversationId: string,
  updates: { name?: string; avatar?: string }
): Promise<Conversation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating group conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Search users, conversations, and messages
 */
export const search = async (query: string, userId: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&userId=${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};
