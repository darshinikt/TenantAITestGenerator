// Cypress custom commands for tenant management system

import { testUsers, selectors } from '../../src/shared/testData';
import { TenantAPIEndpoints, APITestData, APIUtils } from '../../src/shared/apiUtils';
import { JSONComparator } from '../../src/shared/jsonComparator';

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

// ===== NEW API COMMANDS =====

// Authentication API commands
Cypress.Commands.add('apiLogin', (credentials = APITestData.validUser) => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: credentials,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      // Store token for subsequent requests
      cy.wrap(response.body.token).as('authToken');
      return response;
    }
    return response;
  });
});

Cypress.Commands.add('apiLogout', () => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'POST',
      url: '/api/auth/logout',
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

// Tenant API commands
Cypress.Commands.add('apiGetProfile', () => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'GET',
      url: '/api/user/profile',
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

// Maintenance Request API commands
Cypress.Commands.add('apiGetMaintenanceRequests', () => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'GET',
      url: '/api/maintenance/requests',
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('apiCreateMaintenanceRequest', (requestData = APITestData.maintenanceRequest) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'POST',
      url: '/api/maintenance/requests',
      headers: APIUtils.generateAuthHeaders(token as string),
      body: requestData,
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('apiUpdateMaintenanceRequest', (id: string, updateData: any) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'PUT',
      url: `/api/maintenance/requests/${id}`,
      headers: APIUtils.generateAuthHeaders(token as string),
      body: updateData,
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('apiDeleteMaintenanceRequest', (id: string) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'DELETE',
      url: `/api/maintenance/requests/${id}`,
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

// Payment API commands
Cypress.Commands.add('apiGetPaymentHistory', () => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'GET',
      url: '/api/payments/history',
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('apiProcessPayment', (paymentData = APITestData.payment) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'POST',
      url: '/api/payments/process',
      headers: APIUtils.generateAuthHeaders(token as string),
      body: paymentData,
      failOnStatusCode: false
    });
  });
});

// Document API commands
Cypress.Commands.add('apiGetDocuments', () => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'GET',
      url: '/api/documents',
      headers: APIUtils.generateAuthHeaders(token as string),
      failOnStatusCode: false
    });
  });
});

Cypress.Commands.add('apiUploadDocument', (documentData = APITestData.document) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: 'POST',
      url: '/api/documents/upload',
      headers: APIUtils.generateAuthHeaders(token as string),
      body: documentData,
      failOnStatusCode: false
    });
  });
});

// Utility API commands
Cypress.Commands.add('validateApiResponse', (response: any, expectedSchema: any, options = {}) => {
  const comparator = new JSONComparator();
  const result = comparator.validateSchema(response.body, expectedSchema, options);
  
  if (!result.isEqual) {
    throw new Error(`API Response validation failed: ${result.summary}`);
  }
});

Cypress.Commands.add('compareJson', (expected: any, actual: any, options = {}) => {
  JSONComparator.cypressAssert(expected, actual, options);
});

Cypress.Commands.add('validateResponseTime', (response: any, maxTime: number = 2000) => {
  expect(response.duration).to.be.lessThan(maxTime);
});

Cypress.Commands.add('makeAuthenticatedRequest', (method: string, url: string, body?: any) => {
  return cy.get('@authToken').then((token) => {
    return cy.request({
      method: method as any,
      url,
      headers: APIUtils.generateAuthHeaders(token as string),
      body,
      failOnStatusCode: false
    });
  });
});