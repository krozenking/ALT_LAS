import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { notificationService } from '../../services/notification';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  // Load settings on mount
  useEffect(() => {
    const settings = notificationService.getSettings();
    setNotificationEnabled(settings.notificationEnabled);
    setSoundEnabled(settings.soundEnabled);
    
    // Check permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);
  
  // Handle notification toggle
  const handleNotificationToggle = () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    notificationService.setNotificationEnabled(newValue);
  };
  
  // Handle sound toggle
  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    notificationService.setSoundEnabled(newValue);
  };
  
  // Request permission
  const requestPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPermissionStatus(permission);
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
          <ModalTitle>Bildirim Ayarları</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {permissionStatus !== 'granted' && (
            <PermissionWarning>
              <WarningIcon>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </WarningIcon>
              <WarningText>
                Bildirim izni verilmedi. Tarayıcı bildirimlerini almak için izin vermeniz gerekiyor.
              </WarningText>
              <PermissionButton onClick={requestPermission}>
                İzin Ver
              </PermissionButton>
            </PermissionWarning>
          )}
          
          <SettingItem>
            <SettingLabel>Bildirimleri Etkinleştir</SettingLabel>
            <ToggleSwitch 
              checked={notificationEnabled} 
              onChange={handleNotificationToggle} 
            />
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>Bildirim Sesini Etkinleştir</SettingLabel>
            <ToggleSwitch 
              checked={soundEnabled} 
              onChange={handleSoundToggle} 
              disabled={!notificationEnabled}
            />
          </SettingItem>
          
          <SettingDescription>
            Bildirimleri etkinleştirdiğinizde, yeni mesajlar, grup davetiyeleri ve diğer önemli etkinlikler hakkında bildirim alırsınız.
          </SettingDescription>
        </ModalBody>
        
        <ModalFooter>
          <SaveButton onClick={onClose}>
            Tamam
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <SwitchContainer disabled={disabled}>
      <SwitchInput 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
        disabled={disabled} 
      />
      <SwitchSlider checked={checked} disabled={disabled} />
    </SwitchContainer>
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

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SettingLabel = styled.label`
  font-size: 14px;
  color: #050505;
`;

interface SwitchContainerProps {
  disabled: boolean;
}

const SwitchContainer = styled.label<SwitchContainerProps>`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

interface SwitchSliderProps {
  checked: boolean;
  disabled: boolean;
}

const SwitchSlider = styled.span<SwitchSliderProps>`
  position: absolute;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#0084ff' : '#ccc'};
  transition: .4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    transform: ${props => props.checked ? 'translateX(16px)' : 'translateX(0)'};
  }
`;

const SettingDescription = styled.p`
  font-size: 12px;
  color: #65676b;
  margin-top: 8px;
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

const PermissionWarning = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff4e5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const WarningIcon = styled.div`
  color: #f7b928;
  margin-bottom: 8px;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: #050505;
  text-align: center;
  margin-bottom: 12px;
`;

const PermissionButton = styled.button`
  background-color: #f7b928;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e5a922;
  }
`;

export default NotificationSettings;
