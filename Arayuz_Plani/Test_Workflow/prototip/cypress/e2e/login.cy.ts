// cypress/e2e/login.cy.ts

describe('Login Form', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('form[aria-label="Login form"]').should('be.visible');
    cy.get('input[id^="textfield-username"]').should('be.visible');
    cy.get('input[id^="textfield-password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Log in');
  });

  it('should show validation errors when submitting empty form', () => {
    // Submit the form without entering any data
    cy.get('button[type="submit"]').click();

    // Check if validation errors are displayed
    cy.contains('Username is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show password length validation error', () => {
    // Enter username but short password
    cy.get('input[id^="textfield-username"]').type('testuser');
    cy.get('input[id^="textfield-password"]').type('short');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if password validation error is displayed
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Enter valid credentials
    cy.get('input[id^="textfield-username"]').type('admin');
    cy.get('input[id^="textfield-password"]').type('password123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if login was successful
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Admin').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[id^="textfield-username"]').type('wronguser');
    cy.get('input[id^="textfield-password"]').type('wrongpassword');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if error message is displayed
    cy.contains('Invalid username or password').should('be.visible');
  });

  it('should clear validation errors when valid input is provided', () => {
    // Submit empty form to trigger validation errors
    cy.get('button[type="submit"]').click();
    
    // Check if validation errors are displayed
    cy.contains('Username is required').should('be.visible');
    
    // Enter valid username
    cy.get('input[id^="textfield-username"]').type('testuser');
    
    // Check if username validation error is cleared
    cy.contains('Username is required').should('not.exist');
  });

  it('should show loading state during login', () => {
    // Enter valid credentials
    cy.get('input[id^="textfield-username"]').type('admin');
    cy.get('input[id^="textfield-password"]').type('password123');
    
    // Intercept the login request to add delay
    cy.intercept('POST', '/api/auth/login', (req) => {
      req.reply({
        delay: 1000,
        body: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'admin',
            name: 'Admin User',
            role: 'admin',
          },
        },
      });
    }).as('loginRequest');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Check if loading state is displayed
    cy.get('button[type="submit"]').should('contain', 'Logging in...');
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Wait for the login request to complete
    cy.wait('@loginRequest');
    
    // Check if login was successful
    cy.url().should('include', '/dashboard');
  });

  it('should remember username when "Remember me" is checked', () => {
    // Check if "Remember me" checkbox exists
    cy.get('input[type="checkbox"][id^="checkbox-remember"]').should('exist');
    
    // Enter credentials and check "Remember me"
    cy.get('input[id^="textfield-username"]').type('testuser');
    cy.get('input[id^="textfield-password"]').type('password123');
    cy.get('input[type="checkbox"][id^="checkbox-remember"]').check();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Reload the page
    cy.reload();
    
    // Check if username is remembered
    cy.get('input[id^="textfield-username"]').should('have.value', 'testuser');
    cy.get('input[id^="textfield-password"]').should('have.value', '');
  });

  it('should navigate to forgot password page', () => {
    // Check if "Forgot password?" link exists
    cy.contains('Forgot password?').should('exist');
    
    // Click on "Forgot password?" link
    cy.contains('Forgot password?').click();
    
    // Check if navigated to forgot password page
    cy.url().should('include', '/forgot-password');
  });

  it('should navigate to registration page', () => {
    // Check if "Create an account" link exists
    cy.contains('Create an account').should('exist');
    
    // Click on "Create an account" link
    cy.contains('Create an account').click();
    
    // Check if navigated to registration page
    cy.url().should('include', '/register');
  });
});
