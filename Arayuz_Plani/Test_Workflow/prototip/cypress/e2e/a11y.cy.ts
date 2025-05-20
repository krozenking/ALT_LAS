// cypress/e2e/a11y.cy.ts

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Load axe-core before each test
    cy.injectAxe();
  });

  it('Home page should have no accessibility violations', () => {
    cy.visit('/');
    cy.checkA11y();
  });

  it('Login page should have no accessibility violations', () => {
    cy.visit('/login');
    cy.checkA11y();
  });

  it('Form page should have no accessibility violations', () => {
    cy.visit('/form');
    cy.checkA11y();
  });

  it('Button components should have no accessibility violations', () => {
    cy.visit('/');
    
    // Focus on the button section
    cy.contains('h2', 'Buton Varyasyonları').scrollIntoView();
    
    // Check only the button section for accessibility violations
    cy.contains('h2', 'Buton Varyasyonları')
      .parent()
      .checkA11y();
  });

  it('should have no accessibility violations when theme is changed', () => {
    cy.visit('/');
    
    // Check with default theme
    cy.checkA11y();
    
    // Change to dark theme
    cy.contains('Koyu Tema').click();
    
    // Check with dark theme
    cy.checkA11y();
    
    // Change to light theme
    cy.contains('Açık Tema').click();
    
    // Check with light theme
    cy.checkA11y();
  });

  it('should have no accessibility violations with keyboard navigation', () => {
    cy.visit('/');
    
    // Tab through the page
    cy.get('body').tab();
    
    // First tab should focus on the first interactive element
    cy.focused().should('exist');
    
    // Continue tabbing through the page
    for (let i = 0; i < 10; i++) {
      cy.focused().should('exist');
      cy.focused().tab();
    }
    
    // Check accessibility after tabbing
    cy.checkA11y();
  });

  it('should have no accessibility violations with form validation errors', () => {
    cy.visit('/form');
    
    // Submit the form without filling it out
    cy.get('button[type="submit"]').click();
    
    // Check accessibility with validation errors
    cy.checkA11y();
  });

  it('should have no accessibility violations with form filled out', () => {
    cy.visit('/form');
    
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Check accessibility with form filled out
    cy.checkA11y();
  });

  it('should have no accessibility violations with dropdown open', () => {
    cy.visit('/form');
    
    // Open dropdown
    cy.get('button[id^="dropdown-ülke"]').click();
    
    // Check accessibility with dropdown open
    cy.checkA11y();
  });

  it('should have no accessibility violations with focus states', () => {
    cy.visit('/');
    
    // Focus on a button
    cy.contains('button', 'Primary').focus();
    
    // Check accessibility with focus
    cy.checkA11y();
    
    // Focus on another button
    cy.contains('button', 'Secondary').focus();
    
    // Check accessibility with focus
    cy.checkA11y();
  });

  it('should have no accessibility violations with error states', () => {
    cy.visit('/form');
    
    // Submit the form with invalid email
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    
    // Check accessibility with error states
    cy.checkA11y();
  });

  it('should have no accessibility violations on different viewport sizes', () => {
    // Mobile viewport
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.checkA11y();
    
    // Tablet viewport
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.checkA11y();
    
    // Desktop viewport
    cy.viewport(1280, 800);
    cy.visit('/');
    cy.checkA11y();
  });
});
