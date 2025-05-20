import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { User, Conversation } from '../../types';
import { useChat } from '../../context/ChatContext';
import { useLanguage } from '../../context/LanguageContext';
import SearchResults from '../SearchResults/SearchResults';
import GroupChatModal from '../GroupChatModal/GroupChatModal';
import UserProfile from '../UserProfile/UserProfile';
import SecuritySettings from '../SecuritySettings/SecuritySettings';

interface ChatHeaderProps {
  user?: User;
  conversation?: Conversation;
  onToggleSidebar: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenAccessibilitySettings?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenThemeSettings?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  conversation,
  onToggleSidebar,
  onOpenNotificationSettings,
  onOpenAccessibilitySettings,
  onOpenLanguageSelector,
  onOpenThemeSettings
}) => {
  const { t } = useLanguage();
  const { searchMessages, clearSearch, currentUserId } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | undefined>(undefined);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      searchMessages(query);
      setShowSearchResults(true);
    } else {
      clearSearch();
      setShowSearchResults(false);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      setSearchQuery('');
      clearSearch();
      setShowSearchResults(false);
    }
  };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Determine what to display in the header
  const isGroup = conversation?.type === 'group';
  const displayName = isGroup ? conversation?.name : user?.name;
  const displayAvatar = isGroup ? conversation?.avatar : user?.avatar;
  const displayStatus = !isGroup && user?.status;

  // Handle user profile click
  const handleUserProfileClick = () => {
    setProfileUserId(user?.id);
    setShowUserProfile(true);
  };

  // Handle security settings click
  const handleSecuritySettingsClick = () => {
    setShowSecuritySettings(true);
  };

  return (
    <Container>
      <ToggleSidebarButton onClick={onToggleSidebar}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ToggleSidebarButton>

      {displayName ? (
        <UserInfo onClick={!isGroup ? handleUserProfileClick : undefined} clickable={!isGroup}>
          {displayAvatar && <UserAvatar src={displayAvatar} alt={displayName} />}
          <UserDetails>
            <UserName>{displayName}</UserName>
            {displayStatus && (
              <UserStatus status={displayStatus}>
                {displayStatus === 'online' ? 'Çevrimiçi' :
                 displayStatus === 'offline' ? 'Çevrimdışı' : 'Uzakta'}
              </UserStatus>
            )}
            {isGroup && (
              <GroupInfo>
                {conversation?.participants.length} üye
              </GroupInfo>
            )}
          </UserDetails>
        </UserInfo>
      ) : (
        <Title>ALT_LAS Chat</Title>
      )}

      <Actions>
        {isSearching ? (
          <SearchContainer>
            <SearchInput
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Mesajlarda ara..."
              autoFocus
            />
            {showSearchResults && searchQuery.trim().length > 0 && (
              <SearchResultsContainer ref={searchResultsRef}>
                <SearchResults onClose={() => setShowSearchResults(false)} />
              </SearchResultsContainer>
            )}
          </SearchContainer>
        ) : (
          <>
            <ActionButton onClick={handleSearchClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={() => setShowGroupModal(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={onOpenNotificationSettings}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={handleSecuritySettingsClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={() => setShowUserProfile(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={onOpenAccessibilitySettings}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
            <ActionButton onClick={onOpenLanguageSelector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>

            <ActionButton onClick={onOpenThemeSettings}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V12L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </ActionButton>
          </>
        )}
      </Actions>

      {showGroupModal && (
        <GroupChatModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} />
      )}

      {showUserProfile && (
        <UserProfile
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          userId={profileUserId}
        />
      )}

      {showSecuritySettings && (
        <SecuritySettings
          isOpen={showSecuritySettings}
          onClose={() => setShowSecuritySettings(false)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  height: 64px;
`;

const ToggleSidebarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #050505;
  margin-right: 16px;

  &:hover {
    color: #0084ff;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  margin: 0;
  flex: 1;
`;

interface UserInfoProps {
  clickable?: boolean;
}

const UserInfo = styled.div<UserInfoProps>`
  display: flex;
  align-items: center;
  flex: 1;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};

  &:hover {
    background-color: ${props => props.clickable ? '#f5f5f5' : 'transparent'};
    border-radius: 8px;
  }
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #050505;
`;

interface UserStatusProps {
  status: string;
}

const UserStatus = styled.span<UserStatusProps>`
  font-size: 12px;
  color: ${props =>
    props.status === 'online' ? '#31a24c' :
    props.status === 'offline' ? '#8e8e8e' :
    '#f7b928'
  };
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #050505;
  margin-left: 8px;

  &:hover {
    color: #0084ff;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0084ff;
  }
`;

const SearchResultsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 100;
`;

const GroupInfo = styled.span`
  font-size: 12px;
  color: #65676b;
`;

export default ChatHeader;
