// cypress/support/commands.ts

// Custom command to check if an element has a specific class
Cypress.Commands.add('hasClass', { prevSubject: true }, (subject, className) => {
  cy.wrap(subject).should('have.class', className);
});

// Custom command to check if an element is visible in the viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return cy.wrap(subject);
});

// Custom command to check accessibility
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Declare global Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      hasClass(className: string): Chainable<Element>;
      isInViewport(): Chainable<Element>;
      checkA11y(context?: string, options?: any): Chainable<Element>;
      login(email: string, password: string): Chainable<Element>;
    }
  }
}
