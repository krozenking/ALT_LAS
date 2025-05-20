/**
 * E2E Test for Chat Flow
 * 
 * This test covers the complete chat flow from sending a message to receiving a response.
 * It also tests various features like model selection, API key configuration, and error handling.
 */

describe('Chat Flow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Intercept API calls
    cy.intercept('POST', '/api/chat', {
      statusCode: 200,
      body: {
        text: 'This is a test response from the AI model.',
        model: 'gpt-3.5-turbo',
        timestamp: new Date().toISOString()
      }
    }).as('chatRequest');
    
    cy.intercept('GET', '/api/models', {
      statusCode: 200,
      body: {
        models: [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
          { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
          { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
          { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'meta' },
          { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral' }
        ]
      }
    }).as('getModels');
  });

  it('should send a message and receive a response', () => {
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello, AI!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if the message is displayed in the chat
    cy.get('[data-testid="message-list"]').should('contain', 'Hello, AI!');
    
    // Check if the response is displayed in the chat
    cy.get('[data-testid="message-list"]').should('contain', 'This is a test response from the AI model.');
  });

  it('should allow selecting different models', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Wait for models to load
    cy.wait('@getModels');
    
    // Select a different model
    cy.get('[data-testid="model-selector"]').click();
    cy.get('[data-testid="model-option-gpt-4"]').click();
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello from GPT-4!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call and check the request payload
    cy.wait('@chatRequest').its('request.body').should('include', { model: 'gpt-4' });
  });

  it('should handle API key configuration', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Go to API keys tab
    cy.get('[data-testid="api-keys-tab"]').click();
    
    // Enter OpenAI API key
    cy.get('[data-testid="openai-api-key-input"]').type('test-openai-api-key');
    
    // Enter Anthropic API key
    cy.get('[data-testid="anthropic-api-key-input"]').type('test-anthropic-api-key');
    
    // Save API keys
    cy.get('[data-testid="save-api-keys-button"]').click();
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello with API key!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call and check the request headers
    cy.wait('@chatRequest').its('request.headers').should('include', {
      'X-API-Key': 'test-openai-api-key'
    });
  });

  it('should handle errors gracefully', () => {
    // Override the intercept to simulate an error
    cy.intercept('POST', '/api/chat', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      }
    }).as('chatRequestError');
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('This will cause an error');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call
    cy.wait('@chatRequestError');
    
    // Check if the error message is displayed
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Error');
  });

  it('should support keyboard shortcuts', () => {
    // Type a message
    cy.get('[data-testid="message-input"]').type('Send with Enter{enter}');
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if the message is displayed in the chat
    cy.get('[data-testid="message-list"]').should('contain', 'Send with Enter');
    
    // Open keyboard shortcuts help
    cy.get('body').type('{ctrl+k}');
    
    // Check if the keyboard shortcuts dialog is displayed
    cy.get('[data-testid="keyboard-shortcuts-dialog"]').should('be.visible');
    
    // Close the dialog
    cy.get('[data-testid="close-keyboard-shortcuts-button"]').click();
  });

  it('should support accessibility features', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Go to accessibility tab
    cy.get('[data-testid="accessibility-tab"]').click();
    
    // Enable high contrast mode
    cy.get('[data-testid="high-contrast-toggle"]').click();
    
    // Enable larger text
    cy.get('[data-testid="larger-text-toggle"]').click();
    
    // Save accessibility settings
    cy.get('[data-testid="save-accessibility-settings-button"]').click();
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Check if high contrast class is applied
    cy.get('body').should('have.class', 'high-contrast');
    
    // Check if larger text class is applied
    cy.get('body').should('have.class', 'larger-text');
  });

  it('should support conversation history', () => {
    // Intercept history API call
    cy.intercept('GET', '/api/chat/history', {
      statusCode: 200,
      body: {
        conversations: [
          {
            id: 'conv-1',
            title: 'Previous Conversation',
            timestamp: new Date().toISOString(),
            messages: [
              {
                role: 'user',
                content: 'Previous message',
                timestamp: new Date().toISOString()
              },
              {
                role: 'assistant',
                content: 'Previous response',
                timestamp: new Date().toISOString()
              }
            ]
          }
        ]
      }
    }).as('getHistory');
    
    // Open conversation history
    cy.get('[data-testid="history-button"]').click();
    
    // Wait for history to load
    cy.wait('@getHistory');
    
    // Select a previous conversation
    cy.get('[data-testid="conversation-item-conv-1"]').click();
    
    // Check if the previous conversation is loaded
    cy.get('[data-testid="message-list"]').should('contain', 'Previous message');
    cy.get('[data-testid="message-list"]').should('contain', 'Previous response');
  });

  it('should support file uploads', () => {
    // Intercept file upload API call
    cy.intercept('POST', '/api/upload', {
      statusCode: 200,
      body: {
        fileId: 'file-1',
        fileName: 'test.txt',
        fileUrl: 'https://example.com/test.txt'
      }
    }).as('fileUpload');
    
    // Upload a file
    cy.get('[data-testid="file-upload-button"]').click();
    cy.get('[data-testid="file-input"]').attachFile('test.txt');
    
    // Wait for the upload to complete
    cy.wait('@fileUpload');
    
    // Check if the file is displayed in the chat
    cy.get('[data-testid="file-preview"]').should('be.visible');
    cy.get('[data-testid="file-preview"]').should('contain', 'test.txt');
    
    // Send a message with the file
    cy.get('[data-testid="message-input"]').type('Here is a file');
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call and check the request payload
    cy.wait('@chatRequest').its('request.body').should('include', { fileId: 'file-1' });
  });
});
