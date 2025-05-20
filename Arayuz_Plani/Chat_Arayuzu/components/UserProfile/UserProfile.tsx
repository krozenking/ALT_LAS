import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User } from '../../types';
import { useChat } from '../../context/ChatContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // If provided, show another user's profile, otherwise show current user's profile
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, userId }) => {
  const { users, currentUserId } = useChat();
  
  const [user, setUser] = useState<User | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'online' | 'offline' | 'away'>('online');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Load user data
  useEffect(() => {
    const targetUserId = userId || currentUserId;
    const foundUser = users.find(u => u.id === targetUserId);
    
    if (foundUser) {
      setUser(foundUser);
      setName(foundUser.name);
      setStatus(foundUser.status);
      setAvatar(foundUser.avatar);
      setIsCurrentUser(targetUserId === currentUserId);
    } else {
      setError('Kullanıcı bulunamadı');
    }
  }, [userId, currentUserId, users]);
  
  // Handle save profile
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('İsim alanı boş olamaz');
      return;
    }
    
    try {
      // In a real application, we would call an API to update the user profile
      // For now, we'll just update the local state
      setUser(prev => prev ? { ...prev, name, status, avatar } : null);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError('Profil güncellenirken bir hata oluştu');
      console.error('Error updating profile:', error);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
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
  
  if (!isOpen || !user) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{isCurrentUser ? 'Profilim' : 'Kullanıcı Profili'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ProfileSection>
            <AvatarContainer>
              {isEditing ? (
                <AvatarUpload>
                  {avatar ? (
                    <AvatarPreview>
                      <Avatar src={avatar} alt={name} />
                      <RemoveAvatarButton onClick={() => setAvatar('')}>
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
              ) : (
                <Avatar src={user.avatar} alt={user.name} />
              )}
            </AvatarContainer>
            
            {isEditing ? (
              <FormGroup>
                <Label>İsim</Label>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="İsminizi girin"
                />
              </FormGroup>
            ) : (
              <UserName>{user.name}</UserName>
            )}
            
            {isEditing ? (
              <FormGroup>
                <Label>Durum</Label>
                <Select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as 'online' | 'offline' | 'away')}
                >
                  <option value="online">Çevrimiçi</option>
                  <option value="away">Uzakta</option>
                  <option value="offline">Çevrimdışı</option>
                </Select>
              </FormGroup>
            ) : (
              <UserStatus status={user.status}>
                {user.status === 'online' ? 'Çevrimiçi' : 
                 user.status === 'offline' ? 'Çevrimdışı' : 'Uzakta'}
              </UserStatus>
            )}
          </ProfileSection>
          
          {isCurrentUser && !isEditing && (
            <SecuritySection>
              <SectionTitle>Güvenlik</SectionTitle>
              
              <SecurityOption>
                <SecurityOptionLabel>İki Faktörlü Kimlik Doğrulama</SecurityOptionLabel>
                <SecurityOptionValue>Kapalı</SecurityOptionValue>
                <SecurityOptionButton>Etkinleştir</SecurityOptionButton>
              </SecurityOption>
              
              <SecurityOption>
                <SecurityOptionLabel>Şifre Değiştir</SecurityOptionLabel>
                <SecurityOptionButton>Değiştir</SecurityOptionButton>
              </SecurityOption>
              
              <SecurityOption>
                <SecurityOptionLabel>Oturum Açık Cihazlar</SecurityOptionLabel>
                <SecurityOptionValue>1 Cihaz</SecurityOptionValue>
                <SecurityOptionButton>Görüntüle</SecurityOptionButton>
              </SecurityOption>
            </SecuritySection>
          )}
          
          {error && <ErrorText>{error}</ErrorText>}
        </ModalBody>
        
        <ModalFooter>
          {isCurrentUser && (
            isEditing ? (
              <>
                <CancelButton onClick={() => setIsEditing(false)}>İptal</CancelButton>
                <SaveButton onClick={handleSaveProfile}>Kaydet</SaveButton>
              </>
            ) : (
              <EditButton onClick={() => setIsEditing(true)}>Profili Düzenle</EditButton>
            )
          )}
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
  width: 400px;
  max-width: 90%;
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
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const AvatarContainer = styled.div`
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 8px 0;
`;

interface UserStatusProps {
  status: string;
}

const UserStatus = styled.div<UserStatusProps>`
  font-size: 14px;
  color: ${props => 
    props.status === 'online' ? '#31a24c' : 
    props.status === 'offline' ? '#8e8e8e' : 
    '#f7b928'
  };
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => 
      props.status === 'online' ? '#31a24c' : 
      props.status === 'offline' ? '#8e8e8e' : 
      '#f7b928'
    };
    margin-right: 6px;
  }
`;

const SecuritySection = styled.div`
  margin-top: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 16px 0;
`;

const SecurityOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const SecurityOptionLabel = styled.div`
  font-size: 14px;
  color: #050505;
  flex: 1;
`;

const SecurityOptionValue = styled.div`
  font-size: 14px;
  color: #65676b;
  margin-right: 12px;
`;

const SecurityOptionButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #0084ff;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FormGroup = styled.div`
  width: 100%;
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

const Select = styled.select`
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

const ErrorText = styled.div`
  font-size: 14px;
  color: #ff3b30;
  margin-top: 16px;
  text-align: center;
`;

const EditButton = styled.button`
  background-color: #0084ff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0077e6;
  }
`;

const SaveButton = styled.button`
  background-color: #0084ff;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0077e6;
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
  margin-right: 8px;
  
  &:hover {
    color: #050505;
  }
`;

const AvatarUpload = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

export default UserProfile;
