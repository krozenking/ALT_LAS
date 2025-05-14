import React from 'react';
import { NotificationProvider, useNotification } from '../../src/renderer/components/notifications';
import { Button } from '@chakra-ui/react';

// Test component that uses the notification context
const TestComponent = () => {
  const { info, success, warning, error, toggleNotificationCenter } = useNotification();
  
  return (
    <div>
      <Button
        data-testid="info-button"
        onClick={() => info('Info Title', 'Info message')}
      >
        Show Info
      </Button>
      <Button
        data-testid="success-button"
        onClick={() => success('Success Title', 'Success message')}
      >
        Show Success
      </Button>
      <Button
        data-testid="warning-button"
        onClick={() => warning('Warning Title', 'Warning message')}
      >
        Show Warning
      </Button>
      <Button
        data-testid="error-button"
        onClick={() => error('Error Title', 'Error message')}
      >
        Show Error
      </Button>
      <Button
        data-testid="toggle-center-button"
        onClick={toggleNotificationCenter}
      >
        Toggle Notification Center
      </Button>
    </div>
  );
};

describe('Notification System', () => {
  it('renders notification when info method is called', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click info button
    cy.get('[data-testid=info-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    cy.get('.notification-item').should('have.class', 'notification-info');
    cy.get('.notification-item .notification-title').should('contain', 'Info Title');
    cy.get('.notification-item .notification-message').should('contain', 'Info message');
  });
  
  it('renders notification when success method is called', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click success button
    cy.get('[data-testid=success-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    cy.get('.notification-item').should('have.class', 'notification-success');
    cy.get('.notification-item .notification-title').should('contain', 'Success Title');
    cy.get('.notification-item .notification-message').should('contain', 'Success message');
  });
  
  it('renders notification when warning method is called', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click warning button
    cy.get('[data-testid=warning-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    cy.get('.notification-item').should('have.class', 'notification-warning');
    cy.get('.notification-item .notification-title').should('contain', 'Warning Title');
    cy.get('.notification-item .notification-message').should('contain', 'Warning message');
  });
  
  it('renders notification when error method is called', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click error button
    cy.get('[data-testid=error-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    cy.get('.notification-item').should('have.class', 'notification-error');
    cy.get('.notification-item .notification-title').should('contain', 'Error Title');
    cy.get('.notification-item .notification-message').should('contain', 'Error message');
  });
  
  it('removes notification after duration', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click info button
    cy.get('[data-testid=info-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    
    // Wait for notification to be removed (default duration is 5000ms)
    cy.wait(5500);
    
    // Check if notification is removed
    cy.get('.notification-item').should('not.exist');
  });
  
  it('toggles notification center', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Check if notification center is not visible
    cy.get('.notification-center').should('not.be.visible');
    
    // Click toggle button
    cy.get('[data-testid=toggle-center-button]').click();
    
    // Check if notification center is visible
    cy.get('.notification-center').should('be.visible');
    
    // Click toggle button again
    cy.get('[data-testid=toggle-center-button]').click();
    
    // Check if notification center is not visible
    cy.get('.notification-center').should('not.be.visible');
  });
  
  it('shows notifications in notification center', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click info button
    cy.get('[data-testid=info-button]').click();
    
    // Click success button
    cy.get('[data-testid=success-button]').click();
    
    // Open notification center
    cy.get('[data-testid=toggle-center-button]').click();
    
    // Check if notifications are in the center
    cy.get('.notification-center .notification-item').should('have.length', 2);
    cy.get('.notification-center .notification-item').eq(0).should('contain', 'Success Title');
    cy.get('.notification-center .notification-item').eq(1).should('contain', 'Info Title');
  });
  
  it('dismisses notification when close button is clicked', () => {
    cy.mount(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Click info button
    cy.get('[data-testid=info-button]').click();
    
    // Check if notification is rendered
    cy.get('.notification-item').should('exist');
    
    // Click close button
    cy.get('.notification-item .notification-close-button').click();
    
    // Check if notification is removed
    cy.get('.notification-item').should('not.exist');
  });
});
