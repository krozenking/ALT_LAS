import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { User, Message, Conversation, ChatState } from '../types';
import { socketService, SocketEvents } from '../services/socket';
import * as api from '../services/api';

// Action types
enum ActionType {
  SET_USERS = 'SET_USERS',
  SET_MESSAGES = 'SET_MESSAGES',
  ADD_MESSAGE = 'ADD_MESSAGE',
  SET_CONVERSATIONS = 'SET_CONVERSATIONS',
  ADD_CONVERSATION = 'ADD_CONVERSATION',
  UPDATE_CONVERSATION = 'UPDATE_CONVERSATION',
  SET_SELECTED_CONVERSATION = 'SET_SELECTED_CONVERSATION',
  UPDATE_USER_STATUS = 'UPDATE_USER_STATUS',
  MARK_MESSAGES_AS_READ = 'MARK_MESSAGES_AS_READ',
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
  SET_IS_SEARCHING = 'SET_IS_SEARCHING',
  ADD_USER_TO_GROUP = 'ADD_USER_TO_GROUP',
  REMOVE_USER_FROM_GROUP = 'REMOVE_USER_FROM_GROUP',
  UPDATE_GROUP = 'UPDATE_GROUP',
}

// Actions
type Action =
  | { type: ActionType.SET_USERS; payload: User[] }
  | { type: ActionType.SET_MESSAGES; payload: Message[] }
  | { type: ActionType.ADD_MESSAGE; payload: Message }
  | { type: ActionType.SET_CONVERSATIONS; payload: Conversation[] }
  | { type: ActionType.ADD_CONVERSATION; payload: Conversation }
  | { type: ActionType.UPDATE_CONVERSATION; payload: { id: string; updates: Partial<Conversation> } }
  | { type: ActionType.SET_SELECTED_CONVERSATION; payload: string | null }
  | { type: ActionType.UPDATE_USER_STATUS; payload: { userId: string; status: User['status'] } }
  | { type: ActionType.MARK_MESSAGES_AS_READ; payload: { conversationId: string; userId: string } }
  | { type: ActionType.SET_SEARCH_RESULTS; payload: SearchResult[] }
  | { type: ActionType.SET_IS_SEARCHING; payload: boolean }
  | { type: ActionType.ADD_USER_TO_GROUP; payload: { conversationId: string; userId: string } }
  | { type: ActionType.REMOVE_USER_FROM_GROUP; payload: { conversationId: string; userId: string } }
  | { type: ActionType.UPDATE_GROUP; payload: { conversationId: string; updates: Partial<GroupConversation> } };

// Initial state
const initialState: ChatState = {
  users: [],
  messages: [],
  conversations: [],
  selectedConversationId: null,
  currentUserId: '',
  searchResults: [],
  isSearching: false,
};

// Reducer
const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case ActionType.SET_USERS:
      return { ...state, users: action.payload };

    case ActionType.SET_MESSAGES:
      return { ...state, messages: action.payload };

    case ActionType.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };

    case ActionType.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };

    case ActionType.ADD_CONVERSATION:
      return { ...state, conversations: [...state.conversations, action.payload] };

    case ActionType.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.id
            ? { ...conversation, ...action.payload.updates }
            : conversation
        ),
      };

    case ActionType.SET_SELECTED_CONVERSATION:
      return { ...state, selectedConversationId: action.payload };

    case ActionType.UPDATE_USER_STATUS:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status }
            : user
        ),
      };

    case ActionType.MARK_MESSAGES_AS_READ:
      return {
        ...state,
        messages: state.messages.map(message =>
          message.senderId !== action.payload.userId &&
          message.conversationId === action.payload.conversationId &&
          !message.read
            ? { ...message, read: true }
            : message
        ),
      };

    case ActionType.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };

    case ActionType.SET_IS_SEARCHING:
      return { ...state, isSearching: action.payload };

    case ActionType.ADD_USER_TO_GROUP:
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.conversationId
            ? {
                ...conversation,
                participants: [...conversation.participants, action.payload.userId]
              }
            : conversation
        ),
      };

    case ActionType.REMOVE_USER_FROM_GROUP:
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.conversationId
            ? {
                ...conversation,
                participants: conversation.participants.filter(id => id !== action.payload.userId),
                admins: conversation.admins
                  ? conversation.admins.filter(id => id !== action.payload.userId)
                  : undefined
              }
            : conversation
        ),
      };

    case ActionType.UPDATE_GROUP:
      return {
        ...state,
        conversations: state.conversations.map(conversation =>
          conversation.id === action.payload.conversationId
            ? { ...conversation, ...action.payload.updates }
            : conversation
        ),
      };

    default:
      return state;
  }
};

// Context
interface ChatContextType extends ChatState {
  sendMessage: (text: string, conversationId: string, replyToMessageId?: string) => Promise<void>;
  createDirectConversation: (participantId: string) => Promise<void>;
  createGroupConversation: (name: string, participantIds: string[], avatar?: string) => Promise<void>;
  selectConversation: (conversationId: string | null) => void;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  uploadFile: (file: File) => Promise<{ url: string; name: string; size: number; mimeType: string }>;
  setCurrentUserId: (userId: string) => void;
  searchUsers: (query: string) => Promise<void>;
  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;
  addUserToGroup: (conversationId: string, userId: string) => Promise<void>;
  removeUserFromGroup: (conversationId: string, userId: string) => Promise<void>;
  makeUserAdmin: (conversationId: string, userId: string) => Promise<void>;
  removeUserAdmin: (conversationId: string, userId: string) => Promise<void>;
  updateGroupConversation: (conversationId: string, updates: { name?: string; avatar?: string }) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Set current user ID
  const setCurrentUserId = (userId: string) => {
    // Initialize socket connection
    socketService.init(userId);

    // Update state
    initialState.currentUserId = userId;

    // Fetch initial data
    fetchUsers();
    fetchConversations(userId);
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const users = await api.fetchUsers();
      dispatch({ type: ActionType.SET_USERS, payload: users });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch conversations
  const fetchConversations = async (userId: string) => {
    try {
      const conversations = await api.fetchConversations(userId);
      dispatch({ type: ActionType.SET_CONVERSATIONS, payload: conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const messages = await api.fetchMessages(conversationId);
      dispatch({ type: ActionType.SET_MESSAGES, payload: messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (text: string, conversationId: string, replyToMessageId?: string) => {
    try {
      const message = {
        senderId: state.currentUserId,
        text,
        read: false,
        conversationId,
        replyTo: replyToMessageId,
      };

      // Send message to API
      const newMessage = await api.sendMessage(conversationId, message);

      // Add message to state
      dispatch({ type: ActionType.ADD_MESSAGE, payload: newMessage });

      // Update conversation's last message
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        dispatch({
          type: ActionType.UPDATE_CONVERSATION,
          payload: {
            id: conversationId,
            updates: { lastMessage: newMessage, updatedAt: new Date().toISOString() }
          }
        });
      }

      // Send message via socket
      socketService.sendMessage({
        senderId: state.currentUserId,
        text,
        read: false,
        conversationId,
        replyTo: replyToMessageId,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Create a new direct conversation
  const createDirectConversation = async (participantId: string) => {
    try {
      // Check if conversation already exists
      const existingConversation = state.conversations.find(
        conv => conv.type === 'direct' &&
        conv.participants.includes(state.currentUserId) &&
        conv.participants.includes(participantId)
      );

      if (existingConversation) {
        // Select existing conversation
        dispatch({
          type: ActionType.SET_SELECTED_CONVERSATION,
          payload: existingConversation.id,
        });
        return;
      }

      // Create conversation in API
      const newConversation = await api.createDirectConversation([
        state.currentUserId,
        participantId,
      ]);

      // Add conversation to state
      dispatch({
        type: ActionType.ADD_CONVERSATION,
        payload: newConversation,
      });

      // Select the new conversation
      dispatch({
        type: ActionType.SET_SELECTED_CONVERSATION,
        payload: newConversation.id,
      });
    } catch (error) {
      console.error('Error creating direct conversation:', error);
    }
  };

  // Create a new group conversation
  const createGroupConversation = async (name: string, participantIds: string[], avatar?: string) => {
    try {
      // Create group conversation in API
      const newConversation = await api.createGroupConversation(
        name,
        [state.currentUserId, ...participantIds],
        state.currentUserId,
        avatar
      );

      // Add conversation to state
      dispatch({
        type: ActionType.ADD_CONVERSATION,
        payload: newConversation,
      });

      // Select the new conversation
      dispatch({
        type: ActionType.SET_SELECTED_CONVERSATION,
        payload: newConversation.id,
      });
    } catch (error) {
      console.error('Error creating group conversation:', error);
    }
  };

  // Select a conversation
  const selectConversation = (conversationId: string | null) => {
    dispatch({ type: ActionType.SET_SELECTED_CONVERSATION, payload: conversationId });

    if (conversationId) {
      // Fetch messages for the selected conversation
      fetchMessages(conversationId);

      // Join the conversation via socket
      socketService.joinConversation(conversationId);

      // Mark messages as read
      markMessagesAsRead(conversationId);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await api.markMessagesAsRead(conversationId, state.currentUserId);

      dispatch({
        type: ActionType.MARK_MESSAGES_AS_READ,
        payload: { conversationId, userId: state.currentUserId },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Upload a file
  const uploadFile = async (file: File) => {
    try {
      return await api.uploadFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    try {
      dispatch({ type: ActionType.SET_IS_SEARCHING, payload: true });

      const results = await api.search(query, state.currentUserId);
      const userResults = results.filter(result => result.type === 'user');

      dispatch({ type: ActionType.SET_SEARCH_RESULTS, payload: userResults });
    } catch (error) {
      console.error('Error searching users:', error);
      dispatch({ type: ActionType.SET_SEARCH_RESULTS, payload: [] });
    } finally {
      dispatch({ type: ActionType.SET_IS_SEARCHING, payload: false });
    }
  };

  // Search messages
  const searchMessages = async (query: string) => {
    try {
      dispatch({ type: ActionType.SET_IS_SEARCHING, payload: true });

      const results = await api.search(query, state.currentUserId);

      dispatch({ type: ActionType.SET_SEARCH_RESULTS, payload: results });
    } catch (error) {
      console.error('Error searching messages:', error);
      dispatch({ type: ActionType.SET_SEARCH_RESULTS, payload: [] });
    } finally {
      dispatch({ type: ActionType.SET_IS_SEARCHING, payload: false });
    }
  };

  // Clear search
  const clearSearch = () => {
    dispatch({ type: ActionType.SET_SEARCH_RESULTS, payload: [] });
    dispatch({ type: ActionType.SET_IS_SEARCHING, payload: false });
  };

  // Add user to group
  const addUserToGroup = async (conversationId: string, userId: string) => {
    try {
      await api.addUserToGroup(conversationId, userId);

      dispatch({
        type: ActionType.ADD_USER_TO_GROUP,
        payload: { conversationId, userId }
      });
    } catch (error) {
      console.error('Error adding user to group:', error);
    }
  };

  // Remove user from group
  const removeUserFromGroup = async (conversationId: string, userId: string) => {
    try {
      await api.removeUserFromGroup(conversationId, userId);

      dispatch({
        type: ActionType.REMOVE_USER_FROM_GROUP,
        payload: { conversationId, userId }
      });
    } catch (error) {
      console.error('Error removing user from group:', error);
    }
  };

  // Make user admin
  const makeUserAdmin = async (conversationId: string, userId: string) => {
    try {
      await api.makeUserAdmin(conversationId, userId);

      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation && conversation.admins) {
        dispatch({
          type: ActionType.UPDATE_GROUP,
          payload: {
            conversationId,
            updates: { admins: [...conversation.admins, userId] }
          }
        });
      }
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  // Remove user admin
  const removeUserAdmin = async (conversationId: string, userId: string) => {
    try {
      await api.removeUserAdmin(conversationId, userId);

      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation && conversation.admins) {
        dispatch({
          type: ActionType.UPDATE_GROUP,
          payload: {
            conversationId,
            updates: { admins: conversation.admins.filter(id => id !== userId) }
          }
        });
      }
    } catch (error) {
      console.error('Error removing user admin:', error);
    }
  };

  // Update group conversation
  const updateGroupConversation = async (conversationId: string, updates: { name?: string; avatar?: string }) => {
    try {
      await api.updateGroupConversation(conversationId, updates);

      dispatch({
        type: ActionType.UPDATE_GROUP,
        payload: { conversationId, updates }
      });
    } catch (error) {
      console.error('Error updating group conversation:', error);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!state.currentUserId) return;

    // Listen for new messages
    socketService.onNewMessage((message) => {
      dispatch({ type: ActionType.ADD_MESSAGE, payload: message });
    });

    // Listen for user status changes
    socketService.onUserStatusChange((data) => {
      dispatch({
        type: ActionType.UPDATE_USER_STATUS,
        payload: { userId: data.userId, status: data.status },
      });
    });

    // Listen for message read status
    socketService.onMessageRead((data) => {
      if (data.userId !== state.currentUserId) {
        dispatch({
          type: ActionType.MARK_MESSAGES_AS_READ,
          payload: { conversationId: data.conversationId, userId: data.userId },
        });
      }
    });

    // Cleanup
    return () => {
      socketService.off(SocketEvents.NEW_MESSAGE);
      socketService.off(SocketEvents.USER_STATUS_CHANGE);
      socketService.off(SocketEvents.MESSAGE_READ);
      socketService.disconnect();
    };
  }, [state.currentUserId]);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        createDirectConversation,
        createGroupConversation,
        selectConversation,
        markMessagesAsRead,
        uploadFile,
        setCurrentUserId,
        searchUsers,
        searchMessages,
        clearSearch,
        addUserToGroup,
        removeUserFromGroup,
        makeUserAdmin,
        removeUserAdmin,
        updateGroupConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Hook
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
