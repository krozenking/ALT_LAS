import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../services/themeManager';
import { useLanguage } from '../../context/LanguageContext';
import FocusTrap from '../Accessibility/FocusTrap';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ThemeSettings component for managing theme settings
 * 
 * @param isOpen - Whether the settings modal is open
 * @param onClose - Function to close the settings modal
 */
const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(themeMode);
  
  // Update selected mode when theme mode changes
  useEffect(() => {
    setSelectedMode(themeMode);
  }, [themeMode]);
  
  // Handle theme mode selection
  const handleModeSelect = (mode: ThemeMode) => {
    setSelectedMode(mode);
    setThemeMode(mode);
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
    <ModalOverlay onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="theme-title">
      <FocusTrap>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle id="theme-title">{t('settings', 'theme')}</ModalTitle>
            <CloseButton onClick={onClose} aria-label={t('common', 'close')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <ThemeOptionList>
              <ThemeOption
                isSelected={selectedMode === 'light'}
                onClick={() => handleModeSelect('light')}
              >
                <ThemePreview mode="light">
                  <PreviewHeader />
                  <PreviewContent>
                    <PreviewMessage isOwn={false} />
                    <PreviewMessage isOwn={true} />
                  </PreviewContent>
                  <PreviewInput />
                </ThemePreview>
                <ThemeOptionName>{t('settings', 'lightMode')}</ThemeOptionName>
                {selectedMode === 'light' && (
                  <SelectedIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SelectedIcon>
                )}
              </ThemeOption>
              
              <ThemeOption
                isSelected={selectedMode === 'dark'}
                onClick={() => handleModeSelect('dark')}
              >
                <ThemePreview mode="dark">
                  <PreviewHeader />
                  <PreviewContent>
                    <PreviewMessage isOwn={false} />
                    <PreviewMessage isOwn={true} />
                  </PreviewContent>
                  <PreviewInput />
                </ThemePreview>
                <ThemeOptionName>{t('settings', 'darkMode')}</ThemeOptionName>
                {selectedMode === 'dark' && (
                  <SelectedIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SelectedIcon>
                )}
              </ThemeOption>
              
              <ThemeOption
                isSelected={selectedMode === 'system'}
                onClick={() => handleModeSelect('system')}
              >
                <ThemePreview mode={isDarkMode ? 'dark' : 'light'}>
                  <PreviewHeader />
                  <PreviewContent>
                    <PreviewMessage isOwn={false} />
                    <PreviewMessage isOwn={true} />
                  </PreviewContent>
                  <PreviewInput />
                </ThemePreview>
                <ThemeOptionName>{t('settings', 'systemMode')}</ThemeOptionName>
                {selectedMode === 'system' && (
                  <SelectedIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SelectedIcon>
                )}
              </ThemeOption>
            </ThemeOptionList>
            
            <Description>
              {t('settings', 'themeDescription')}
            </Description>
          </ModalBody>
          
          <ModalFooter>
            <SaveButton onClick={onClose}>
              {t('common', 'ok')}
            </SaveButton>
          </ModalFooter>
        </ModalContent>
      </FocusTrap>
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
  background-color: var(--color-background-paper);
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  
  &:hover {
    color: var(--color-text-primary);
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-main);
    border-radius: 4px;
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
  border-top: 1px solid var(--color-border-light);
`;

const ThemeOptionList = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

interface ThemeOptionProps {
  isSelected: boolean;
}

const ThemeOption = styled.div<ThemeOptionProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.isSelected ? 'var(--color-primary-main)' : 'transparent'};
  background-color: ${props => props.isSelected ? 'var(--color-background-light)' : 'transparent'};
  position: relative;
  
  &:hover {
    background-color: var(--color-background-light);
  }
`;

interface ThemePreviewProps {
  mode: 'light' | 'dark' | 'system';
}

const ThemePreview = styled.div<ThemePreviewProps>`
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid ${props => props.mode === 'light' ? '#e0e0e0' : '#3a3b3c'};
  background-color: ${props => props.mode === 'light' ? '#f0f2f5' : '#18191a'};
`;

const PreviewHeader = styled.div`
  height: 30px;
  background-color: inherit;
  border-bottom: 1px solid inherit;
`;

const PreviewContent = styled.div`
  height: 90px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
`;

interface PreviewMessageProps {
  isOwn: boolean;
}

const PreviewMessage = styled.div<PreviewMessageProps>`
  width: 60%;
  height: 20px;
  border-radius: 18px;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  background-color: ${props => {
    if (props.isOwn) {
      return props.theme.mode === 'light' ? '#0084ff' : '#0084ff';
    } else {
      return props.theme.mode === 'light' ? '#e4e6eb' : '#3a3b3c';
    }
  }};
`;

const PreviewInput = styled.div`
  height: 30px;
  background-color: inherit;
  border-top: 1px solid inherit;
`;

const ThemeOptionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const SelectedIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-primary-main);
  color: var(--color-primary-contrast-text);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Description = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const SaveButton = styled.button`
  background-color: var(--color-primary-main);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary-contrast-text);
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-main);
    box-shadow: 0 0 0 2px var(--color-background-paper), 0 0 0 4px var(--color-primary-main);
  }
`;

export default ThemeSettings;
