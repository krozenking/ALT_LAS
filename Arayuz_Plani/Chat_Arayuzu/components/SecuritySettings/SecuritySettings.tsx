import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface SecuritySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Device {
  id: string;
  name: string;
  lastActive: string;
  location: string;
  isCurrent: boolean;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'2fa' | 'password' | 'devices'>('2fa');
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Chrome on Windows',
      lastActive: 'Şimdi',
      location: 'İstanbul, Türkiye',
      isCurrent: true,
    },
    {
      id: '2',
      name: 'Safari on iPhone',
      lastActive: '2 saat önce',
      location: 'İstanbul, Türkiye',
      isCurrent: false,
    },
    {
      id: '3',
      name: 'Firefox on MacBook',
      lastActive: '3 gün önce',
      location: 'Ankara, Türkiye',
      isCurrent: false,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Handle 2FA toggle
  const handle2faToggle = () => {
    if (is2faEnabled) {
      // Disable 2FA
      setIs2faEnabled(false);
      setQrCode(null);
      setSuccess('İki faktörlü kimlik doğrulama devre dışı bırakıldı.');
    } else {
      // Enable 2FA
      setIs2faEnabled(true);
      // In a real application, we would call an API to generate a QR code
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/ALT_LAS:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ALT_LAS');
    }
  };
  
  // Handle 2FA verification
  const handle2faVerification = () => {
    if (!verificationCode) {
      setError('Lütfen doğrulama kodunu girin.');
      return;
    }
    
    // In a real application, we would call an API to verify the code
    if (verificationCode === '123456') {
      setSuccess('İki faktörlü kimlik doğrulama etkinleştirildi.');
      setError(null);
    } else {
      setError('Geçersiz doğrulama kodu.');
    }
  };
  
  // Handle password change
  const handlePasswordChange = () => {
    setError(null);
    
    if (!currentPassword) {
      setError('Lütfen mevcut şifrenizi girin.');
      return;
    }
    
    if (!newPassword) {
      setError('Lütfen yeni şifrenizi girin.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    // In a real application, we would call an API to change the password
    setSuccess('Şifreniz başarıyla değiştirildi.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  // Handle device logout
  const handleDeviceLogout = (deviceId: string) => {
    // In a real application, we would call an API to log out the device
    setDevices(devices.filter(device => device.id !== deviceId));
    setSuccess('Cihaz oturumu kapatıldı.');
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
          <ModalTitle>Güvenlik Ayarları</ModalTitle>
          <CloseButton onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <Tabs>
          <Tab 
            isActive={activeTab === '2fa'} 
            onClick={() => setActiveTab('2fa')}
          >
            İki Faktörlü Kimlik Doğrulama
          </Tab>
          <Tab 
            isActive={activeTab === 'password'} 
            onClick={() => setActiveTab('password')}
          >
            Şifre Değiştir
          </Tab>
          <Tab 
            isActive={activeTab === 'devices'} 
            onClick={() => setActiveTab('devices')}
          >
            Oturum Açık Cihazlar
          </Tab>
        </Tabs>
        
        <ModalBody>
          {activeTab === '2fa' && (
            <TabContent>
              <SectionTitle>İki Faktörlü Kimlik Doğrulama</SectionTitle>
              <SectionDescription>
                İki faktörlü kimlik doğrulama, hesabınıza ekstra bir güvenlik katmanı ekler. 
                Etkinleştirildiğinde, oturum açarken şifrenize ek olarak telefonunuzdaki bir uygulamadan 
                alınan doğrulama kodunu girmeniz gerekecektir.
              </SectionDescription>
              
              <ToggleContainer>
                <ToggleLabel>İki faktörlü kimlik doğrulama</ToggleLabel>
                <ToggleSwitch 
                  checked={is2faEnabled} 
                  onChange={handle2faToggle} 
                />
              </ToggleContainer>
              
              {is2faEnabled && qrCode && (
                <QrCodeSection>
                  <QrCodeTitle>QR Kodunu Tarayın</QrCodeTitle>
                  <QrCodeDescription>
                    Google Authenticator veya Authy gibi bir kimlik doğrulama uygulaması kullanarak 
                    aşağıdaki QR kodunu tarayın.
                  </QrCodeDescription>
                  <QrCodeImage src={qrCode} alt="QR Code" />
                  
                  <FormGroup>
                    <Label>Doğrulama Kodu</Label>
                    <Input 
                      type="text" 
                      value={verificationCode} 
                      onChange={e => setVerificationCode(e.target.value)} 
                      placeholder="6 haneli kodu girin"
                    />
                  </FormGroup>
                  
                  <VerifyButton onClick={handle2faVerification}>
                    Doğrula
                  </VerifyButton>
                </QrCodeSection>
              )}
            </TabContent>
          )}
          
          {activeTab === 'password' && (
            <TabContent>
              <SectionTitle>Şifre Değiştir</SectionTitle>
              <SectionDescription>
                Güvenliğiniz için şifrenizi düzenli olarak değiştirmenizi öneririz.
              </SectionDescription>
              
              <FormGroup>
                <Label>Mevcut Şifre</Label>
                <Input 
                  type="password" 
                  value={currentPassword} 
                  onChange={e => setCurrentPassword(e.target.value)} 
                  placeholder="Mevcut şifrenizi girin"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Yeni Şifre</Label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Yeni şifrenizi girin"
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Yeni Şifre (Tekrar)</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </FormGroup>
              
              <ChangePasswordButton onClick={handlePasswordChange}>
                Şifreyi Değiştir
              </ChangePasswordButton>
            </TabContent>
          )}
          
          {activeTab === 'devices' && (
            <TabContent>
              <SectionTitle>Oturum Açık Cihazlar</SectionTitle>
              <SectionDescription>
                Hesabınızda oturum açık olan tüm cihazları görüntüleyin ve yönetin.
              </SectionDescription>
              
              <DeviceList>
                {devices.map(device => (
                  <DeviceItem key={device.id}>
                    <DeviceInfo>
                      <DeviceName>{device.name}</DeviceName>
                      <DeviceDetails>
                        <DeviceLocation>{device.location}</DeviceLocation>
                        <DeviceLastActive>{device.lastActive}</DeviceLastActive>
                      </DeviceDetails>
                      {device.isCurrent && (
                        <CurrentDeviceBadge>Bu Cihaz</CurrentDeviceBadge>
                      )}
                    </DeviceInfo>
                    {!device.isCurrent && (
                      <LogoutButton onClick={() => handleDeviceLogout(device.id)}>
                        Oturumu Kapat
                      </LogoutButton>
                    )}
                  </DeviceItem>
                ))}
              </DeviceList>
            </TabContent>
          )}
          
          {error && <ErrorText>{error}</ErrorText>}
          {success && <SuccessText>{success}</SuccessText>}
        </ModalBody>
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

const ModalBody = styled.div`
  padding: 16px;
  overflow-y: auto;
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 8px 0;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0 0 16px 0;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.div`
  font-size: 14px;
  color: #050505;
`;

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <SwitchContainer>
      <SwitchInput 
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
      />
      <SwitchSlider checked={checked} />
    </SwitchContainer>
  );
};

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

interface SwitchSliderProps {
  checked: boolean;
}

const SwitchSlider = styled.span<SwitchSliderProps>`
  position: absolute;
  cursor: pointer;
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

const QrCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
`;

const QrCodeTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #050505;
  margin: 0 0 8px 0;
`;

const QrCodeDescription = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0 0 16px 0;
  text-align: center;
`;

const QrCodeImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
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

const VerifyButton = styled.button`
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

const ChangePasswordButton = styled.button`
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

const DeviceList = styled.div`
  margin-top: 16px;
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f7fb;
  margin-bottom: 8px;
`;

const DeviceInfo = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #050505;
  margin-bottom: 4px;
`;

const DeviceDetails = styled.div`
  display: flex;
  align-items: center;
`;

const DeviceLocation = styled.div`
  font-size: 12px;
  color: #65676b;
  margin-right: 8px;
`;

const DeviceLastActive = styled.div`
  font-size: 12px;
  color: #65676b;
  
  &::before {
    content: '•';
    margin: 0 4px;
  }
`;

const CurrentDeviceBadge = styled.div`
  display: inline-block;
  padding: 2px 6px;
  background-color: #e6f2ff;
  color: #0084ff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 4px;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #ff3b30;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.div`
  font-size: 14px;
  color: #ff3b30;
  margin-top: 16px;
  text-align: center;
`;

const SuccessText = styled.div`
  font-size: 14px;
  color: #31a24c;
  margin-top: 16px;
  text-align: center;
`;

export default SecuritySettings;
