import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
