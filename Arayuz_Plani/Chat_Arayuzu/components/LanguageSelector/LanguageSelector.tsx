import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { i18n, Language, t } from '../../services/i18n';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LanguageSelector component for selecting the application language
 * 
 * @param isOpen - Whether the language selector is open
 * @param onClose - Function to close the language selector
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.getLanguage());
  const [availableLanguages, setAvailableLanguages] = useState(i18n.getAvailableLanguages());
  
  // Update current language when it changes
  useEffect(() => {
    const handleLanguageChange = (language: Language) => {
      setCurrentLanguage(language);
    };
    
    i18n.addListener(handleLanguageChange);
    
    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);
  
  // Handle language selection
  const handleLanguageSelect = async (language: Language) => {
    await i18n.setLanguage(language);
    onClose();
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
    <ModalOverlay onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="language-title">
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="language-title">{t('settings', 'language')}</ModalTitle>
          <CloseButton onClick={onClose} aria-label={t('common', 'close')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <LanguageList>
            {availableLanguages.map(language => (
              <LanguageItem
                key={language.code}
                isSelected={currentLanguage === language.code}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <LanguageFlag>
                  {language.code === 'tr' && '🇹🇷'}
                  {language.code === 'en' && '🇬🇧'}
                  {language.code === 'de' && '🇩🇪'}
                  {language.code === 'fr' && '🇫🇷'}
                  {language.code === 'es' && '🇪🇸'}
                </LanguageFlag>
                <LanguageName>{language.name}</LanguageName>
                {currentLanguage === language.code && (
                  <SelectedIcon>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SelectedIcon>
                )}
              </LanguageItem>
            ))}
          </LanguageList>
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
  
  &:focus {
    outline: 2px solid #0084ff;
    border-radius: 4px;
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

const LanguageList = styled.div`
  display: flex;
  flex-direction: column;
`;

interface LanguageItemProps {
  isSelected: boolean;
}

const LanguageItem = styled.div<LanguageItemProps>`
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${props => props.isSelected ? '#e6f2ff' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#e6f2ff' : '#f5f5f5'};
  }
`;

const LanguageFlag = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

const LanguageName = styled.div`
  font-size: 16px;
  color: #050505;
  flex: 1;
`;

const SelectedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0084ff;
`;

export default LanguageSelector;
