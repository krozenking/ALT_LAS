// cypress/e2e/visual-regression.cy.ts

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    // Visit the page
    cy.visit('/');
  });

  it('should match homepage snapshot', () => {
    // Take a snapshot of the homepage
    cy.percySnapshot('Homepage');
  });

  it('should match form with validation errors snapshot', () => {
    // Submit the form without entering any data to trigger validation errors
    cy.get('button[type="submit"]').click();
    
    // Take a snapshot of the form with validation errors
    cy.percySnapshot('Form with Validation Errors');
  });

  it('should match form with filled data snapshot', () => {
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Take a snapshot of the form with filled data
    cy.percySnapshot('Form with Filled Data');
  });

  it('should match dropdown open snapshot', () => {
    // Open dropdown
    cy.get('button[id^="dropdown-ülke"]').click();
    
    // Take a snapshot of the dropdown open
    cy.percySnapshot('Dropdown Open');
  });

  it('should match error message snapshot', () => {
    // Fill out the form with existing email
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('existing@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Take a snapshot of the error message
    cy.percySnapshot('Error Message');
  });

  it('should match success message snapshot', () => {
    // Fill out the form
    cy.get('input[id^="textfield-isim"]').type('Test User');
    cy.get('input[id^="textfield-e-posta"]').type('test@example.com');
    
    // Open dropdown and select a country
    cy.get('button[id^="dropdown-ülke"]').click();
    cy.contains('Türkiye').click();
    
    // Check terms
    cy.get('input[id^="checkbox-kullanım"]').click();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Take a snapshot of the success message
    cy.percySnapshot('Success Message');
  });
});
