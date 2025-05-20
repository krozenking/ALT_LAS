import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User } from '../../types';
import { useChat } from '../../context/ChatContext';

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatModal: React.FC<GroupChatModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUserId, searchUsers, searchResults, isSearching, createGroupConversation } = useChat();
  
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter out current user from users list
  const filteredUsers = users.filter(user => user.id !== currentUserId);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      searchUsers(query);
    }
  };
  
  // Handle user selection
  const handleUserSelect = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Grup adı gereklidir');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('En az bir kullanıcı seçmelisiniz');
      return;
    }
    
    try {
      await createGroupConversation(
        groupName,
        selectedUsers.map(user => user.id),
        groupAvatar || undefined
      );
      
      // Reset form and close modal
      setGroupName('');
      setSelectedUsers([]);
      setGroupAvatar(null);
      setError(null);
      onClose();
    } catch (error) {
      setError('Grup oluşturulurken bir hata oluştu');
      console.error('Error creating group:', error);
    }
  };
  
  // Handle file upload for group avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGroupAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Yeni Grup Oluştur</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormGroup>
            <Label>Grup Adı</Label>
            <Input 
              type="text" 
              value={groupName} 
              onChange={e => setGroupName(e.target.value)} 
              placeholder="Grup adı girin"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Grup Avatarı</Label>
            <AvatarUpload>
              {groupAvatar ? (
                <AvatarPreview>
                  <Avatar src={groupAvatar} alt="Group Avatar" />
                  <RemoveAvatarButton onClick={() => setGroupAvatar(null)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </RemoveAvatarButton>
                </AvatarPreview>
              ) : (
                <AvatarUploadButton>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Avatar Ekle</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    style={{ display: 'none' }} 
                  />
                </AvatarUploadButton>
              )}
            </AvatarUpload>
          </FormGroup>
          
          <FormGroup>
            <Label>Kullanıcılar</Label>
            <Input 
              type="text" 
              value={searchQuery} 
              onChange={handleSearchChange} 
              placeholder="Kullanıcı ara..."
            />
          </FormGroup>
          
          <SelectedUsers>
            {selectedUsers.map(user => (
              <SelectedUser key={user.id}>
                <UserAvatar src={user.avatar} alt={user.name} />
                <UserName>{user.name}</UserName>
                <RemoveButton onClick={() => handleUserSelect(user)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </RemoveButton>
              </SelectedUser>
            ))}
          </SelectedUsers>
          
          <UserList>
            {isSearching ? (
              <LoadingText>Aranıyor...</LoadingText>
            ) : searchQuery.trim().length > 0 ? (
              searchResults.length > 0 ? (
                searchResults.map(result => {
                  if (result.type !== 'user' || !result.id || !result.name || !result.avatar) return null;
                  
                  const user = {
                    id: result.id,
                    name: result.name,
                    avatar: result.avatar,
                    status: 'online' as const
                  };
                  
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  
                  return (
                    <UserItem 
                      key={user.id} 
                      isSelected={isSelected}
                      onClick={() => handleUserSelect(user)}
                    >
                      <UserAvatar src={user.avatar} alt={user.name} />
                      <UserName>{user.name}</UserName>
                      {isSelected && (
                        <CheckIcon>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </CheckIcon>
                      )}
                    </UserItem>
                  );
                })
              ) : (
                <EmptyText>Kullanıcı bulunamadı</EmptyText>
              )
            ) : (
              filteredUsers.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                
                return (
                  <UserItem 
                    key={user.id} 
                    isSelected={isSelected}
                    onClick={() => handleUserSelect(user)}
                  >
                    <UserAvatar src={user.avatar} alt={user.name} />
                    <UserName>{user.name}</UserName>
                    {isSelected && (
                      <CheckIcon>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </CheckIcon>
                    )}
                  </UserItem>
                );
              })
            )}
          </UserList>
          
          {error && <ErrorText>{error}</ErrorText>}
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>İptal</CancelButton>
          <CreateButton onClick={handleCreateGroup} disabled={!groupName.trim() || selectedUsers.length === 0}>
            Grup Oluştur
          </CreateButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  
  &:hover {
    color: #050505;
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #050505;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #0084ff;
  }
`;

const UserList = styled.div`
  margin-top: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

interface UserItemProps {
  isSelected: boolean;
}

const UserItem = styled.div<UserItemProps>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  background-color: ${props => props.isSelected ? '#e6f2ff' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#e6f2ff' : '#f5f5f5'};
  }
`;

const UserAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const UserName = styled.div`
  font-size: 14px;
  color: #050505;
  flex: 1;
`;

const CheckIcon = styled.div`
  color: #0084ff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SelectedUsers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const SelectedUser = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #e6f2ff;
  border-radius: 16px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  
  &:hover {
    color: #050505;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #65676b;
  cursor: pointer;
  
  &:hover {
    color: #050505;
  }
`;

const CreateButton = styled.button`
  background-color: #0084ff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: #0077e6;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #8e8e8e;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #ff3b30;
  font-size: 14px;
  margin-top: 8px;
`;

const LoadingText = styled.div`
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
  padding: 16px;
`;

const EmptyText = styled.div`
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
  padding: 16px;
`;

const AvatarUpload = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
`;

const AvatarUploadButton = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  color: #8e8e8e;
  
  span {
    font-size: 12px;
    margin-top: 8px;
  }
  
  &:hover {
    border-color: #0084ff;
    color: #0084ff;
  }
`;

const AvatarPreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;

const RemoveAvatarButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff3b30;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: #ff2d20;
  }
`;

export default GroupChatModal;
