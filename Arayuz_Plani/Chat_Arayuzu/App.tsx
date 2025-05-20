import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatContainer from './components/ChatContainer/ChatContainer';
import NotificationList from './components/NotificationList/NotificationList';
import NotificationSettings from './components/NotificationSettings/NotificationSettings';
import AccessibilitySettings from './components/Accessibility/AccessibilitySettings';
import LanguageSelector from './components/LanguageSelector/LanguageSelector';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';
import OfflineIndicator from './components/OfflineIndicator/OfflineIndicator';
import SkipLink from './components/Accessibility/SkipLink';
import { ChatProvider } from './context/ChatContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { offlineManager } from './services/offlineManager';
import './styles/accessibility.css';
import './styles/themes.css';

const App: React.FC = () => {
  // In a real application, this would come from authentication
  const currentUserId = '1'; // Ayşe Kaya
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // Detect keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-mode');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-mode');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Sync offline messages when back online
  useEffect(() => {
    const handleOnline = () => {
      offlineManager.syncMessages();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <ChatProvider>
          <SkipLink targetId="main-content" />
          <Container>
            <ButtonGroup>
              <ActionButton
                onClick={() => setShowAccessibilitySettings(true)}
                aria-label="Erişilebilirlik ayarları"
              >
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

              <ActionButton
                onClick={() => setShowLanguageSelector(true)}
                aria-label="Dil ayarları"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ActionButton>

              <ActionButton
                onClick={() => setShowThemeSettings(true)}
                aria-label="Tema ayarları"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V12L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ActionButton>
            </ButtonGroup>

          <main id="main-content">
            <ChatContainer
              currentUserId={currentUserId}
              onOpenNotificationSettings={() => setShowNotificationSettings(true)}
              onOpenAccessibilitySettings={() => setShowAccessibilitySettings(true)}
              onOpenLanguageSelector={() => setShowLanguageSelector(true)}
              onOpenThemeSettings={() => setShowThemeSettings(true)}
            />
          </main>

          <NotificationList />
          <OfflineIndicator onRetry={() => offlineManager.retryFailedMessages()} />

          {showNotificationSettings && (
            <NotificationSettings
              isOpen={showNotificationSettings}
              onClose={() => setShowNotificationSettings(false)}
            />
          )}

          {showAccessibilitySettings && (
            <AccessibilitySettings
              isOpen={showAccessibilitySettings}
              onClose={() => setShowAccessibilitySettings(false)}
            />
          )}

          {showLanguageSelector && (
            <LanguageSelector
              isOpen={showLanguageSelector}
              onClose={() => setShowLanguageSelector(false)}
            />
          )}

          {showThemeSettings && (
            <ThemeSettings
              isOpen={showThemeSettings}
              onClose={() => setShowThemeSettings(false)}
            />
          )}
        </Container>
      </ChatProvider>
    </ThemeProvider>
  </LanguageProvider>
  );
};

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
`;

const ButtonGroup = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
`;

const ActionButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #0084ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #0077e6;
  }

  &:focus {
    outline: 2px solid #0084ff;
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0084ff;
  }
`;

export default App;
