import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { User, Conversation } from '../../types';
import LazyLoad from '../LazyLoad/LazyLoad';
import useDebounce from '../../hooks/useDebounce';
import SearchBar from '../SearchBar/SearchBar';

interface ChatSidebarProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  currentUserId: string;
  conversations: Conversation[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  currentUserId,
  conversations
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');

  // Use debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter users based on search query and exclude current user
  const filteredUsers = users
    .filter(user => user.id !== currentUserId)
    .filter(user =>
      user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

  // Render user item with lazy loading
  const renderUserItem = useCallback((user: User) => {
    return (
      <LazyLoad key={user.id} height="60px">
        <UserItem
          isSelected={user.id === selectedUserId}
          onClick={() => onSelectUser(user.id)}
        >
          <UserAvatar src={user.avatar} alt={user.name} />
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserStatus status={user.status}>
              {user.status === 'online' ? 'Çevrimiçi' :
               user.status === 'offline' ? 'Çevrimdışı' : 'Uzakta'}
            </UserStatus>
          </UserInfo>
        </UserItem>
      </LazyLoad>
    );
  }, [selectedUserId, onSelectUser]);

  // Get users with conversations
  const usersWithConversations = conversations
    .map(conversation => {
      // Find the other participant in the conversation
      const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
      if (!otherParticipantId) return null;

      // Find the user
      const user = users.find(user => user.id === otherParticipantId);
      if (!user) return null;

      return {
        ...user,
        conversationId: conversation.id,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount
      };
    })
    .filter(Boolean) as (User & { conversationId: string; lastMessage?: Message; unreadCount: number })[];

  // Filter conversations based on search query
  const filteredConversations = usersWithConversations
    .filter(user =>
      user.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

  return (
    <Container>
      <Header>
        <Title>Sohbetler</Title>
        <NewChatButton>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </NewChatButton>
      </Header>

      <Tabs>
        <Tab
          isActive={activeTab === 'chats'}
          onClick={() => setActiveTab('chats')}
        >
          Sohbetler
        </Tab>
        <Tab
          isActive={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          Kullanıcılar
        </Tab>
      </Tabs>

      <SearchBarWrapper>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={activeTab === 'chats' ? "Sohbet ara..." : "Kullanıcı ara..."}
        />
      </SearchBarWrapper>

      <UserList>
        {activeTab === 'chats' ? (
          filteredConversations.length > 0 ? (
            filteredConversations.map(user => (
              <LazyLoad key={user.id} height="72px">
                <UserItem
                  isSelected={user.conversationId === selectedUserId}
                  onClick={() => onSelectUser(user.id)}
                >
                  <UserAvatar src={user.avatar} alt={user.name} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <LastMessage>
                      {user.lastMessage ? user.lastMessage.text : 'Henüz mesaj yok'}
                    </LastMessage>
                  </UserInfo>
                  <UserMeta>
                    {user.lastMessage && (
                      <LastMessageTime>
                        {new Date(user.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </LastMessageTime>
                    )}
                    {user.unreadCount > 0 && (
                      <UnreadBadge>{user.unreadCount}</UnreadBadge>
                    )}
                    {user.status === 'online' && (
                      <StatusIndicator status={user.status} />
                    )}
                  </UserMeta>
                </UserItem>
              </LazyLoad>
            ))
          ) : (
            <EmptyState>
              <EmptyStateText>
                {searchQuery ? 'Sohbet bulunamadı' : 'Henüz sohbet yok'}
              </EmptyStateText>
            </EmptyState>
          )
        ) : (
          filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <LazyLoad key={user.id} height="72px">
                <UserItem
                  isSelected={user.id === selectedUserId}
                  onClick={() => onSelectUser(user.id)}
                >
                  <UserAvatar src={user.avatar} alt={user.name} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <LastMessage>Yeni sohbet başlat</LastMessage>
                  </UserInfo>
                  <UserMeta>
                    {user.status === 'online' && (
                      <StatusIndicator status={user.status} />
                    )}
                  </UserMeta>
                </UserItem>
              </LazyLoad>
            ))
          ) : (
            <EmptyState>
              <EmptyStateText>
                {searchQuery ? 'Kullanıcı bulunamadı' : 'Kullanıcı yok'}
              </EmptyStateText>
            </EmptyState>
          )
        )}
      </UserList>
    </Container>
  );
};

const Container = styled.div`
  width: 300px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  margin: 0;
`;

const NewChatButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #050505;

  &:hover {
    color: #0084ff;
  }
`;

const SearchBarWrapper = styled.div`
  padding: 8px 16px;
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

interface UserItemProps {
  isSelected: boolean;
}

const UserItem = styled.div<UserItemProps>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#e6f2ff' : 'transparent'};

  &:hover {
    background-color: ${props => props.isSelected ? '#e6f2ff' : '#f5f5f5'};
  }
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #050505;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 12px;
  color: #65676b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 8px;
`;

const LastMessageTime = styled.div`
  font-size: 11px;
  color: #8e8e8e;
  margin-bottom: 4px;
`;

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator = styled.div<StatusIndicatorProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props =>
    props.status === 'online' ? '#31a24c' :
    props.status === 'offline' ? '#8e8e8e' :
    '#f7b928'
  };
`;

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const EmptyStateText = styled.p`
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
`;

interface TabProps {
  isActive: boolean;
}

const Tab = styled.div<TabProps>`
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: ${props => props.isActive ? '600' : '400'};
  color: ${props => props.isActive ? '#0084ff' : '#65676b'};
  border-bottom: 2px solid ${props => props.isActive ? '#0084ff' : 'transparent'};
  cursor: pointer;

  &:hover {
    background-color: ${props => props.isActive ? 'transparent' : '#f5f5f5'};
  }
`;

const UnreadBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #0084ff;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 0 5px;
  margin-bottom: 4px;
`;

export default ChatSidebar;
