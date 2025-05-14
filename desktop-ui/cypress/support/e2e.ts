// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Mock Electron
Cypress.Commands.add('mockElectron', () => {
  cy.window().then((win) => {
    win.electron = {
      ipcRenderer: {
        on: cy.stub().as('ipcOn'),
        once: cy.stub().as('ipcOnce'),
        send: cy.stub().as('ipcSend'),
        invoke: cy.stub().as('ipcInvoke'),
        removeListener: cy.stub().as('ipcRemoveListener'),
      },
    };
  });
});

// Disable smooth scrolling for tests
Cypress.Commands.add('disableSmoothScrolling', () => {
  cy.document().then((document) => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  });
});

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['token', 'session_id'],
});

// Disable uncaught exception handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
