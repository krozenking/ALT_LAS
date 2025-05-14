// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Declare global Cypress namespace to add new commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to mock Electron
       * @example cy.mockElectron()
       */
      mockElectron(): Chainable<void>;
      
      /**
       * Custom command to disable smooth scrolling
       * @example cy.disableSmoothScrolling()
       */
      disableSmoothScrolling(): Chainable<void>;
      
      /**
       * Custom command to login
       * @example cy.login('username', 'password')
       */
      login(username: string, password: string): Chainable<void>;
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to navigate to a page
       * @example cy.navigateTo('dashboard')
       */
      navigateTo(page: string): Chainable<void>;
      
      /**
       * Custom command to mount a component with providers
       * @example cy.mount(<MyComponent />)
       */
      mount(
        component: React.ReactNode,
        options?: {
          providers?: boolean;
          [key: string]: any;
        }
      ): Chainable<any>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('[data-testid=username-input]').type(username);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
  cy.url().should('include', '/dashboard');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid=user-menu]').click();
  cy.get('[data-testid=logout-button]').click();
  cy.url().should('include', '/login');
});

// Navigate to page command
Cypress.Commands.add('navigateTo', (page) => {
  const pageMap: Record<string, string> = {
    dashboard: '/dashboard',
    settings: '/settings',
    profile: '/profile',
    notifications: '/notifications',
    files: '/files',
  };
  
  const path = pageMap[page] || page;
  cy.visit(path);
});

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
