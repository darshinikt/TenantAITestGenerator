// Cypress support file
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on application errors
  console.error('Uncaught exception:', err);
  return false;
});

// Custom commands for tenant management
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTenant(email?: string, password?: string): Chainable<Element>;
      loginAsAdmin(): Chainable<Element>;
      createMaintenanceRequest(title: string, description: string): Chainable<Element>;
      makePayment(amount: number, method?: string): Chainable<Element>;
      uploadDocument(fileName: string): Chainable<Element>;
      waitForApiResponse(alias: string): Chainable<Element>;
    }
  }
}