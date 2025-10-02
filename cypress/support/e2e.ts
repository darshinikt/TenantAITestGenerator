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
      // UI Commands
      loginAsTenant(email?: string, password?: string): Chainable<Element>;
      loginAsAdmin(): Chainable<Element>;
      createMaintenanceRequest(title: string, description: string): Chainable<Element>;
      makePayment(amount: number, method?: string): Chainable<Element>;
      uploadDocument(fileName: string): Chainable<Element>;
      waitForApiResponse(alias: string): Chainable<Element>;
      
      // API Commands
      apiLogin(credentials?: any): Chainable<any>;
      apiLogout(): Chainable<any>;
      apiGetProfile(): Chainable<any>;
      apiGetMaintenanceRequests(): Chainable<any>;
      apiCreateMaintenanceRequest(requestData?: any): Chainable<any>;
      apiUpdateMaintenanceRequest(id: string, updateData: any): Chainable<any>;
      apiDeleteMaintenanceRequest(id: string): Chainable<any>;
      apiGetPaymentHistory(): Chainable<any>;
      apiProcessPayment(paymentData?: any): Chainable<any>;
      apiGetDocuments(): Chainable<any>;
      apiUploadDocument(documentData?: any): Chainable<any>;
      
      // Utility Commands
      validateApiResponse(response: any, expectedSchema: any, options?: any): Chainable<any>;
      compareJson(expected: any, actual: any, options?: any): Chainable<any>;
      validateResponseTime(response: any, maxTime?: number): Chainable<any>;
      makeAuthenticatedRequest(method: string, url: string, body?: any): Chainable<any>;
    }
  }
}