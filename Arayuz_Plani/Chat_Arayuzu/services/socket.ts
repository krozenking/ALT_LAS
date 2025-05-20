import { io, Socket } from 'socket.io-client';
import { Message, User } from '../types';

// Socket.io server URL
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// Socket.io events
export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  NEW_MESSAGE = 'new_message',
  USER_TYPING = 'user_typing',
  USER_STOP_TYPING = 'user_stop_typing',
  USER_STATUS_CHANGE = 'user_status_change',
  MESSAGE_READ = 'message_read',
  USER_JOINED_GROUP = 'user_joined_group',
  USER_LEFT_GROUP = 'user_left_group',
  USER_ADDED_TO_GROUP = 'user_added_to_group',
  USER_REMOVED_FROM_GROUP = 'user_removed_from_group',
  USER_MADE_ADMIN = 'user_made_admin',
  USER_REMOVED_ADMIN = 'user_removed_admin',
  GROUP_UPDATED = 'group_updated',
}

// Socket.io service
class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  // Initialize socket connection
  public init(userId: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on(SocketEvents.CONNECT, () => {
      console.log('Socket connected');
    });

    this.socket.on(SocketEvents.DISCONNECT, () => {
      console.log('Socket disconnected');
    });

    this.socket.on(SocketEvents.ERROR, (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  // Join a conversation
  public joinConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.JOIN_CONVERSATION, { conversationId });
    }
  }

  // Leave a conversation
  public leaveConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.LEAVE_CONVERSATION, { conversationId });
    }
  }

  // Send a new message
  public sendMessage(message: Omit<Message, 'id' | 'timestamp'>): void {
    if (this.socket) {
      this.socket.emit(SocketEvents.NEW_MESSAGE, message);
    }
  }

  // Send typing status
  public sendTyping(conversationId: string): void {
    if (this.socket && this.userId) {
      this.socket.emit(SocketEvents.USER_TYPING, { conversationId, userId: this.userId });
    }
  }

  // Send stop typing status
  public sendStopTyping(conversationId: string): void {
    if (this.socket && this.userId) {
      this.socket.emit(SocketEvents.USER_STOP_TYPING, { conversationId, userId: this.userId });
    }
  }

  // Send message read status
  public sendMessageRead(conversationId: string, messageId: string): void {
    if (this.socket && this.userId) {
      this.socket.emit(SocketEvents.MESSAGE_READ, { conversationId, messageId, userId: this.userId });
    }
  }

  // Listen for new messages
  public onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.NEW_MESSAGE, callback);
    }
  }

  // Listen for user typing
  public onUserTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_TYPING, callback);
    }
  }

  // Listen for user stop typing
  public onUserStopTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_STOP_TYPING, callback);
    }
  }

  // Listen for user status change
  public onUserStatusChange(callback: (data: { userId: string; status: User['status'] }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_STATUS_CHANGE, callback);
    }
  }

  // Listen for message read
  public onMessageRead(callback: (data: { conversationId: string; messageId: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.MESSAGE_READ, callback);
    }
  }

  // Listen for user joined group
  public onUserJoinedGroup(callback: (data: { conversationId: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_JOINED_GROUP, callback);
    }
  }

  // Listen for user left group
  public onUserLeftGroup(callback: (data: { conversationId: string; userId: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_LEFT_GROUP, callback);
    }
  }

  // Listen for user added to group
  public onUserAddedToGroup(callback: (data: { conversationId: string; userId: string; addedBy: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_ADDED_TO_GROUP, callback);
    }
  }

  // Listen for user removed from group
  public onUserRemovedFromGroup(callback: (data: { conversationId: string; userId: string; removedBy: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_REMOVED_FROM_GROUP, callback);
    }
  }

  // Listen for user made admin
  public onUserMadeAdmin(callback: (data: { conversationId: string; userId: string; madeBy: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_MADE_ADMIN, callback);
    }
  }

  // Listen for user removed admin
  public onUserRemovedAdmin(callback: (data: { conversationId: string; userId: string; removedBy: string }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.USER_REMOVED_ADMIN, callback);
    }
  }

  // Listen for group updated
  public onGroupUpdated(callback: (data: { conversationId: string; updates: { name?: string; avatar?: string } }) => void): void {
    if (this.socket) {
      this.socket.on(SocketEvents.GROUP_UPDATED, callback);
    }
  }

  // Remove event listener
  public off(event: SocketEvents): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Check if socket is connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
