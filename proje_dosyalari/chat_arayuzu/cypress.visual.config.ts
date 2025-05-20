import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',
    specPattern: 'cypress/visual/**/*.cy.ts',
    supportFile: 'cypress/support/visual.ts',
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'reports/visual/results-[hash].xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },
      });
      
      return config;
    },
  },
});
