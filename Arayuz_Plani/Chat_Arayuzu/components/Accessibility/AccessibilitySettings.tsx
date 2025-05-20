import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useLocalStorage from '../../hooks/useLocalStorage';
import FocusTrap from './FocusTrap';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AccessibilitySettings component for managing accessibility settings
 * 
 * @param isOpen - Whether the settings modal is open
 * @param onClose - Function to close the settings modal
 */
const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  // Accessibility settings
  const [highContrast, setHighContrast] = useLocalStorage('accessibility_high_contrast', false);
  const [largeText, setLargeText] = useLocalStorage('accessibility_large_text', false);
  const [reducedMotion, setReducedMotion] = useLocalStorage('accessibility_reduced_motion', false);
  const [keyboardMode, setKeyboardMode] = useLocalStorage('accessibility_keyboard_mode', false);
  
  // Apply settings to document
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    if (keyboardMode) {
      document.body.classList.add('keyboard-mode');
    } else {
      document.body.classList.remove('keyboard-mode');
    }
  }, [highContrast, largeText, reducedMotion, keyboardMode]);
  
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
    <ModalOverlay onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="accessibility-title">
      <FocusTrap>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle id="accessibility-title">Erişilebilirlik Ayarları</ModalTitle>
            <CloseButton onClick={onClose} aria-label="Kapat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <SettingItem>
              <SettingLabel htmlFor="high-contrast">Yüksek Kontrast Modu</SettingLabel>
              <SettingDescription>
                Metin ve arka plan arasındaki kontrastı artırır.
              </SettingDescription>
              <ToggleSwitch 
                id="high-contrast"
                checked={highContrast} 
                onChange={() => setHighContrast(!highContrast)} 
              />
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="large-text">Büyük Metin</SettingLabel>
              <SettingDescription>
                Metin boyutunu artırır.
              </SettingDescription>
              <ToggleSwitch 
                id="large-text"
                checked={largeText} 
                onChange={() => setLargeText(!largeText)} 
              />
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="reduced-motion">Azaltılmış Hareket</SettingLabel>
              <SettingDescription>
                Animasyonları ve geçişleri azaltır veya kaldırır.
              </SettingDescription>
              <ToggleSwitch 
                id="reduced-motion"
                checked={reducedMotion} 
                onChange={() => setReducedMotion(!reducedMotion)} 
              />
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="keyboard-mode">Klavye Modu</SettingLabel>
              <SettingDescription>
                Odaklanma göstergelerini her zaman görünür yapar.
              </SettingDescription>
              <ToggleSwitch 
                id="keyboard-mode"
                checked={keyboardMode} 
                onChange={() => setKeyboardMode(!keyboardMode)} 
              />
            </SettingItem>
          </ModalBody>
          
          <ModalFooter>
            <SaveButton onClick={onClose}>
              Tamam
            </SaveButton>
          </ModalFooter>
        </ModalContent>
      </FocusTrap>
    </ModalOverlay>
  );
};

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange }) => {
  return (
    <SwitchContainer>
      <SwitchInput 
        id={id}
        type="checkbox" 
        checked={checked} 
        onChange={onChange} 
      />
      <SwitchSlider checked={checked} />
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
  width: 500px;
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
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const SettingItem = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

const SettingLabel = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #050505;
  margin-bottom: 4px;
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: #65676b;
  margin: 0 0 8px 0;
`;

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  align-self: flex-start;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:focus + span {
    box-shadow: 0 0 0 2px #0084ff;
  }
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
  
  &:focus {
    outline: 2px solid #0084ff;
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #0084ff;
  }
`;

export default AccessibilitySettings;
