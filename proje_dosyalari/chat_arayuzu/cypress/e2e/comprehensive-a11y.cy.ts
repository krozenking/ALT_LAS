/**
 * Comprehensive Accessibility Tests
 * 
 * This test suite performs comprehensive accessibility testing on the chat interface
 * using axe-core and custom accessibility checks.
 */

describe('Accessibility Tests', () => {
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
  });

  it('should pass basic accessibility audit on the main page', () => {
    // Wait for the page to fully load
    cy.get('[data-testid="message-input"]').should('be.visible');
    
    // Run axe accessibility audit
    cy.checkA11y();
  });

  it('should have proper heading structure', () => {
    // Check if there's a main heading (h1)
    cy.get('h1').should('exist');
    
    // Check if headings are in the correct order (no skipped levels)
    cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
      let prevLevel = 0;
      
      $headings.each((i, el) => {
        const level = parseInt(el.tagName.substring(1));
        
        // Heading levels should not skip (e.g., h1 to h3)
        // But they can go back (e.g., h3 to h2)
        if (prevLevel > 0 && level > prevLevel) {
          expect(level).to.equal(prevLevel + 1);
        }
        
        prevLevel = level;
      });
    });
  });

  it('should have proper focus management', () => {
    // Check if the message input is focusable
    cy.get('[data-testid="message-input"]').focus().should('have.focus');
    
    // Check if the send button is focusable
    cy.get('[data-testid="send-button"]').focus().should('have.focus');
    
    // Check if the settings button is focusable
    cy.get('[data-testid="settings-button"]').focus().should('have.focus');
    
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Check if focus is trapped in the settings modal
    cy.get('[data-testid="settings-modal"]').should('be.visible');
    cy.get('[data-testid="close-settings-button"]').focus().should('have.focus');
    
    // Press Tab and check if focus stays within the modal
    cy.focused().tab();
    cy.focused().should('be.visible');
    cy.focused().should('be.within', cy.get('[data-testid="settings-modal"]'));
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Check if focus returns to the settings button
    cy.get('[data-testid="settings-button"]').should('have.focus');
  });

  it('should have proper keyboard navigation', () => {
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello, AI!');
    
    // Send the message with Enter key
    cy.get('[data-testid="message-input"]').type('{enter}');
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if the message is displayed in the chat
    cy.get('[data-testid="message-list"]').should('contain', 'Hello, AI!');
    
    // Open settings with keyboard shortcut
    cy.get('body').type('{ctrl+,}');
    cy.get('[data-testid="settings-modal"]').should('be.visible');
    
    // Close settings with Escape key
    cy.get('body').type('{esc}');
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  it('should have proper ARIA attributes', () => {
    // Check if the chat container has a proper role
    cy.get('[data-testid="chat-container"]').should('have.attr', 'role', 'main');
    
    // Check if the message list has a proper role
    cy.get('[data-testid="message-list"]').should('have.attr', 'role', 'log');
    cy.get('[data-testid="message-list"]').should('have.attr', 'aria-live', 'polite');
    
    // Check if the message input has a proper label
    cy.get('[data-testid="message-input"]').should('have.attr', 'aria-label');
    
    // Check if the send button has a proper label
    cy.get('[data-testid="send-button"]').should('have.attr', 'aria-label');
    
    // Check if the settings button has a proper label
    cy.get('[data-testid="settings-button"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="settings-button"]').should('have.attr', 'aria-expanded', 'false');
    
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Check if the settings button aria-expanded attribute is updated
    cy.get('[data-testid="settings-button"]').should('have.attr', 'aria-expanded', 'true');
    
    // Check if the settings modal has proper ARIA attributes
    cy.get('[data-testid="settings-modal"]').should('have.attr', 'role', 'dialog');
    cy.get('[data-testid="settings-modal"]').should('have.attr', 'aria-labelledby');
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
  });

  it('should have proper color contrast', () => {
    // Configure axe to only check for color contrast issues
    cy.configureAxe({
      rules: [
        { id: 'color-contrast', enabled: true }
      ]
    });
    
    // Run axe accessibility audit for color contrast
    cy.checkA11y(null, {
      includedImpacts: ['serious', 'critical']
    });
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello, AI!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check color contrast in the message list
    cy.checkA11y('[data-testid="message-list"]', {
      includedImpacts: ['serious', 'critical']
    });
  });

  it('should support screen readers', () => {
    // Check if there are proper skip links
    cy.get('[data-testid="skip-to-main"]').should('exist');
    cy.get('[data-testid="skip-to-main"]').should('have.attr', 'href', '#main');
    
    // Check if there are proper landmarks
    cy.get('header').should('exist');
    cy.get('main').should('exist');
    cy.get('footer').should('exist');
    
    // Check if images have alt text
    cy.get('img').each($img => {
      expect($img).to.have.attr('alt');
    });
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello, AI!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if messages have proper structure for screen readers
    cy.get('[data-testid="message-item"]').each($message => {
      // Each message should have a role
      expect($message).to.have.attr('role', 'listitem');
      
      // Each message should have a proper heading
      cy.wrap($message).find('[data-testid="message-sender"]').should('exist');
      
      // Each message should have proper content
      cy.wrap($message).find('[data-testid="message-content"]').should('exist');
    });
  });

  it('should support high contrast mode', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Go to accessibility tab
    cy.get('[data-testid="accessibility-tab"]').click();
    
    // Enable high contrast mode
    cy.get('[data-testid="high-contrast-toggle"]').click();
    
    // Save accessibility settings
    cy.get('[data-testid="save-accessibility-settings-button"]').click();
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Check if high contrast class is applied
    cy.get('body').should('have.class', 'high-contrast');
    
    // Run axe accessibility audit in high contrast mode
    cy.configureAxe({
      rules: [
        { id: 'color-contrast', enabled: true }
      ]
    });
    
    cy.checkA11y();
  });

  it('should support larger text mode', () => {
    // Open settings
    cy.get('[data-testid="settings-button"]').click();
    
    // Go to accessibility tab
    cy.get('[data-testid="accessibility-tab"]').click();
    
    // Enable larger text mode
    cy.get('[data-testid="larger-text-toggle"]').click();
    
    // Save accessibility settings
    cy.get('[data-testid="save-accessibility-settings-button"]').click();
    
    // Close settings
    cy.get('[data-testid="close-settings-button"]').click();
    
    // Check if larger text class is applied
    cy.get('body').should('have.class', 'larger-text');
    
    // Run axe accessibility audit in larger text mode
    cy.checkA11y();
  });

  it('should be accessible when using keyboard only', () => {
    // Navigate through the page using only the keyboard
    cy.get('body').tab();
    
    // First focusable element should be the skip link
    cy.focused().should('have.attr', 'data-testid', 'skip-to-main');
    
    // Tab to the message input
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'message-input');
    
    // Type a message
    cy.focused().type('Hello, AI!');
    
    // Tab to the send button
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'send-button');
    
    // Press the send button
    cy.focused().type('{enter}');
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if the message is displayed in the chat
    cy.get('[data-testid="message-list"]').should('contain', 'Hello, AI!');
  });

  it('should be accessible with screen reader announcements', () => {
    // Check if there are proper live regions
    cy.get('[aria-live="polite"]').should('exist');
    cy.get('[aria-live="assertive"]').should('exist');
    
    // Type a message
    cy.get('[data-testid="message-input"]').type('Hello, AI!');
    
    // Send the message
    cy.get('[data-testid="send-button"]').click();
    
    // Wait for the API call
    cy.wait('@chatRequest');
    
    // Check if the screen reader announcement is made
    cy.get('[data-testid="sr-announcement"]').should('contain', 'Message sent');
    cy.get('[data-testid="sr-announcement"]').should('contain', 'Response received');
  });
});
