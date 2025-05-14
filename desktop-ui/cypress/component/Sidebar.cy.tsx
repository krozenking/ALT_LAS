import React from 'react';
import Sidebar from '../../src/renderer/components/organisms/Sidebar';
import { BrowserRouter } from 'react-router-dom';

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Mock active route
    cy.window().then((win) => {
      win.location.pathname = '/dashboard';
    });
  });
  
  it('renders sidebar with navigation items', () => {
    cy.mount(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check if sidebar is rendered
    cy.get('[data-testid=sidebar]').should('exist');
    
    // Check if navigation items are rendered
    cy.get('[data-testid=nav-item-dashboard]').should('exist');
    cy.get('[data-testid=nav-item-files]').should('exist');
    cy.get('[data-testid=nav-item-settings]').should('exist');
  });
  
  it('highlights active navigation item', () => {
    cy.mount(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check if dashboard item is active
    cy.get('[data-testid=nav-item-dashboard]').should('have.class', 'active');
    cy.get('[data-testid=nav-item-files]').should('not.have.class', 'active');
    cy.get('[data-testid=nav-item-settings]').should('not.have.class', 'active');
    
    // Change active route
    cy.window().then((win) => {
      win.location.pathname = '/files';
    });
    
    // Re-mount to reflect the new active route
    cy.mount(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check if files item is active
    cy.get('[data-testid=nav-item-dashboard]').should('not.have.class', 'active');
    cy.get('[data-testid=nav-item-files]').should('have.class', 'active');
    cy.get('[data-testid=nav-item-settings]').should('not.have.class', 'active');
  });
  
  it('collapses and expands sidebar', () => {
    cy.mount(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Check if sidebar is expanded by default
    cy.get('[data-testid=sidebar]').should('have.class', 'expanded');
    cy.get('[data-testid=nav-item-dashboard] .nav-text').should('be.visible');
    
    // Click collapse button
    cy.get('[data-testid=sidebar-collapse-button]').click();
    
    // Check if sidebar is collapsed
    cy.get('[data-testid=sidebar]').should('have.class', 'collapsed');
    cy.get('[data-testid=nav-item-dashboard] .nav-text').should('not.be.visible');
    
    // Click expand button
    cy.get('[data-testid=sidebar-collapse-button]').click();
    
    // Check if sidebar is expanded again
    cy.get('[data-testid=sidebar]').should('have.class', 'expanded');
    cy.get('[data-testid=nav-item-dashboard] .nav-text').should('be.visible');
  });
  
  it('navigates when clicking on navigation items', () => {
    cy.mount(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );
    
    // Click on files navigation item
    cy.get('[data-testid=nav-item-files]').click();
    
    // Check if location changed
    cy.window().its('location.pathname').should('eq', '/files');
    
    // Click on settings navigation item
    cy.get('[data-testid=nav-item-settings]').click();
    
    // Check if location changed
    cy.window().its('location.pathname').should('eq', '/settings');
  });
  
  it('renders sidebar with custom items', () => {
    const customItems = [
      { id: 'custom1', label: 'Custom 1', icon: 'custom-icon-1', path: '/custom1' },
      { id: 'custom2', label: 'Custom 2', icon: 'custom-icon-2', path: '/custom2' },
    ];
    
    cy.mount(
      <BrowserRouter>
        <Sidebar items={customItems} />
      </BrowserRouter>
    );
    
    // Check if custom items are rendered
    cy.get('[data-testid=nav-item-custom1]').should('exist');
    cy.get('[data-testid=nav-item-custom2]').should('exist');
    
    // Check if default items are not rendered
    cy.get('[data-testid=nav-item-dashboard]').should('not.exist');
    cy.get('[data-testid=nav-item-files]').should('not.exist');
  });
});
