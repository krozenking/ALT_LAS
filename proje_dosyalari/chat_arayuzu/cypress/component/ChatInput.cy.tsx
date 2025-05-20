/**
 * Cypress bileşen testi - ChatInput
 */

import React from 'react';
import { mount } from 'cypress/react';
import { ChakraProvider } from '@chakra-ui/react';
import ChatInput from '../../src/components/Chat/ChatInput';

describe('ChatInput Component', () => {
  const mountComponent = (props = {}) => {
    const defaultProps = {
      message: '',
      setMessage: cy.stub().as('setMessage'),
      onSendMessage: cy.stub().as('onSendMessage'),
      onAttachFile: cy.stub().as('onAttachFile'),
      onVoiceInput: cy.stub().as('onVoiceInput'),
      isLoading: false,
    };
    
    return mount(
      <ChakraProvider>
        <ChatInput {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };
  
  it('should render correctly', () => {
    mountComponent();
    
    // Temel bileşenlerin görünür olduğunu kontrol et
    cy.get('[data-testid="message-input"]').should('be.visible');
    cy.get('[data-testid="send-button"]').should('be.visible');
    cy.get('[data-testid="attach-file-button"]').should('be.visible');
    cy.get('[data-testid="voice-input-button"]').should('be.visible');
  });
  
  it('should update message state when typing', () => {
    mountComponent();
    
    // Mesaj yazma
    cy.get('[data-testid="message-input"]').type('Test message');
    
    // setMessage fonksiyonunun çağrıldığını kontrol et
    cy.get('@setMessage').should('have.been.called');
  });
  
  it('should call onSendMessage when send button is clicked', () => {
    mountComponent({ message: 'Test message' });
    
    // Gönder düğmesine tıklama
    cy.get('[data-testid="send-button"]').click();
    
    // onSendMessage fonksiyonunun çağrıldığını kontrol et
    cy.get('@onSendMessage').should('have.been.called');
  });
  
  it('should call onSendMessage when Enter key is pressed', () => {
    mountComponent({ message: 'Test message' });
    
    // Enter tuşuna basma
    cy.get('[data-testid="message-input"]').type('{enter}');
    
    // onSendMessage fonksiyonunun çağrıldığını kontrol et
    cy.get('@onSendMessage').should('have.been.called');
  });
  
  it('should not call onSendMessage when Shift+Enter is pressed', () => {
    mountComponent({ message: 'Test message' });
    
    // Shift+Enter tuşlarına basma
    cy.get('[data-testid="message-input"]').type('{shift}{enter}');
    
    // onSendMessage fonksiyonunun çağrılmadığını kontrol et
    cy.get('@onSendMessage').should('not.have.been.called');
  });
  
  it('should not call onSendMessage when message is empty', () => {
    mountComponent({ message: '' });
    
    // Gönder düğmesine tıklama
    cy.get('[data-testid="send-button"]').click();
    
    // onSendMessage fonksiyonunun çağrılmadığını kontrol et
    cy.get('@onSendMessage').should('not.have.been.called');
  });
  
  it('should call onAttachFile when attach button is clicked', () => {
    mountComponent();
    
    // Dosya ekle düğmesine tıklama
    cy.get('[data-testid="attach-file-button"]').click();
    
    // onAttachFile fonksiyonunun çağrıldığını kontrol et
    cy.get('@onAttachFile').should('have.been.called');
  });
  
  it('should call onVoiceInput when voice input button is clicked', () => {
    mountComponent();
    
    // Ses girişi düğmesine tıklama
    cy.get('[data-testid="voice-input-button"]').click();
    
    // onVoiceInput fonksiyonunun çağrıldığını kontrol et
    cy.get('@onVoiceInput').should('have.been.called');
  });
  
  it('should show loading state', () => {
    mountComponent({ isLoading: true });
    
    // Yükleme göstergesinin görünür olduğunu kontrol et
    cy.get('[data-testid="loading-indicator"]').should('be.visible');
    
    // Gönder düğmesinin devre dışı olduğunu kontrol et
    cy.get('[data-testid="send-button"]').should('be.disabled');
  });
  
  it('should be accessible', () => {
    mountComponent();
    
    // Erişilebilirlik kontrolü
    cy.injectAxe();
    cy.checkA11y();
  });
});
