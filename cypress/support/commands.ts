// Cypress custom commands for tenant management system

import { testUsers, selectors } from '../../src/shared/testData';

// Login commands
Cypress.Commands.add('loginAsTenant', (email?: string, password?: string) => {
  const user = email && password ? { email, password } : testUsers.tenant1;
  
  cy.visit('/login');
  cy.get(selectors.login.emailInput).type(user.email);
  cy.get(selectors.login.passwordInput).type(user.password);
  cy.get(selectors.login.loginButton).click();
  
  // Wait for dashboard to load
  cy.get(selectors.dashboard.welcomeMessage).should('be.visible');
});

Cypress.Commands.add('loginAsAdmin', () => {
  const admin = testUsers.admin;
  
  cy.visit('/login');
  cy.get(selectors.login.emailInput).type(admin.email);
  cy.get(selectors.login.passwordInput).type(admin.password);
  cy.get(selectors.login.loginButton).click();
  
  // Wait for admin dashboard
  cy.get('[data-testid="admin-dashboard"]').should('be.visible');
});

// Maintenance request commands
Cypress.Commands.add('createMaintenanceRequest', (title: string, description: string) => {
  cy.get(selectors.maintenance.createButton).click();
  cy.get(selectors.maintenance.titleInput).type(title);
  cy.get(selectors.maintenance.descriptionInput).type(description);
  cy.get(selectors.maintenance.prioritySelect).select('medium');
  cy.get(selectors.maintenance.categorySelect).select('plumbing');
  cy.get(selectors.maintenance.submitButton).click();
  
  // Verify request was created
  cy.get(selectors.maintenance.requestsList).should('contain', title);
});

// Payment commands
Cypress.Commands.add('makePayment', (amount: number, method: string = 'credit_card') => {
  cy.get(selectors.payments.makePaymentButton).click();
  cy.get(selectors.payments.amountInput).clear().type(amount.toString());
  cy.get(selectors.payments.paymentMethodSelect).select(method);
  cy.get(selectors.payments.confirmPaymentButton).click();
  
  // Wait for success message
  cy.get(selectors.payments.paymentSuccessMessage).should('be.visible');
});

// Document upload command
Cypress.Commands.add('uploadDocument', (fileName: string) => {
  cy.get(selectors.documents.uploadButton).click();
  cy.get(selectors.documents.fileInput).selectFile(`cypress/fixtures/${fileName}`);
  
  // Wait for upload confirmation
  cy.get('[data-testid="upload-success"]').should('be.visible');
});

// API response waiting
Cypress.Commands.add('waitForApiResponse', (alias: string) => {
  cy.wait(`@${alias}`).then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
  });
});