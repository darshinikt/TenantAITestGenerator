/// <reference types="cypress" />

describe('Maintenance Requests', () => {
  beforeEach(() => {
    // Login before each test
    cy.loginAsTenant();
    
    // Set up API intercepts
    cy.intercept('GET', '/api/maintenance/requests', { fixture: 'maintenanceRequests.json' }).as('getRequests');
    cy.intercept('POST', '/api/maintenance/requests', { fixture: 'newMaintenanceRequest.json' }).as('createRequest');
    cy.intercept('PUT', '/api/maintenance/requests/*', { fixture: 'updatedMaintenanceRequest.json' }).as('updateRequest');
  });

  it('should display existing maintenance requests', () => {
    cy.visit('/maintenance');
    
    cy.waitForApiResponse('getRequests');
    cy.get('[data-testid="maintenance-requests-list"]').should('be.visible');
    cy.get('[data-testid="maintenance-request-item"]').should('have.length.at.least', 1);
    
    // Verify request details
    cy.get('[data-testid="maintenance-request-item"]').first().within(() => {
      cy.get('[data-testid="request-title"]').should('not.be.empty');
      cy.get('[data-testid="request-status"]').should('be.visible');
      cy.get('[data-testid="request-priority"]').should('be.visible');
      cy.get('[data-testid="request-date"]').should('be.visible');
    });
  });

  it('should create a new maintenance request', () => {
    cy.visit('/maintenance');
    
    const requestTitle = 'Leaky Kitchen Faucet';
    const requestDescription = 'The kitchen faucet has been dripping for the past week and needs repair.';
    
    cy.get('[data-testid="create-maintenance-button"]').click();
    cy.get('[data-testid="maintenance-title"]').type(requestTitle);
    cy.get('[data-testid="maintenance-description"]').type(requestDescription);
    cy.get('[data-testid="maintenance-priority"]').select('medium');
    cy.get('[data-testid="maintenance-category"]').select('plumbing');
    
    // Add photos (optional)
    cy.get('[data-testid="photo-upload"]').selectFile('cypress/fixtures/maintenance-photo.jpg', { force: true });
    
    cy.get('[data-testid="submit-maintenance"]').click();
    
    cy.waitForApiResponse('createRequest');
    cy.get('[data-testid="success-message"]').should('contain', 'Maintenance request submitted successfully');
    
    // Verify the new request appears in the list
    cy.get('[data-testid="maintenance-requests-list"]').should('contain', requestTitle);
  });

  it('should filter maintenance requests by status', () => {
    cy.visit('/maintenance');
    cy.waitForApiResponse('getRequests');
    
    // Test filter by status
    cy.get('[data-testid="status-filter"]').select('open');
    cy.get('[data-testid="maintenance-request-item"]').each(($el) => {
      cy.wrap($el).find('[data-testid="request-status"]').should('contain', 'Open');
    });
    
    cy.get('[data-testid="status-filter"]').select('completed');
    cy.get('[data-testid="maintenance-request-item"]').each(($el) => {
      cy.wrap($el).find('[data-testid="request-status"]').should('contain', 'Completed');
    });
  });

  it('should allow editing an existing maintenance request', () => {
    cy.visit('/maintenance');
    cy.waitForApiResponse('getRequests');
    
    // Click edit on first request
    cy.get('[data-testid="maintenance-request-item"]').first().within(() => {
      cy.get('[data-testid="edit-request-button"]').click();
    });
    
    // Modify the request
    const updatedDescription = 'Updated: The issue has gotten worse and needs urgent attention.';
    cy.get('[data-testid="maintenance-description"]').clear().type(updatedDescription);
    cy.get('[data-testid="maintenance-priority"]').select('high');
    
    cy.get('[data-testid="update-maintenance"]').click();
    
    cy.waitForApiResponse('updateRequest');
    cy.get('[data-testid="success-message"]').should('contain', 'Maintenance request updated');
  });

  it('should show maintenance request details', () => {
    cy.visit('/maintenance');
    cy.waitForApiResponse('getRequests');
    
    // Click on a maintenance request to view details
    cy.get('[data-testid="maintenance-request-item"]').first().click();
    
    // Verify details page
    cy.url().should('match', /\/maintenance\/\d+/);
    cy.get('[data-testid="request-details"]').should('be.visible');
    cy.get('[data-testid="request-title"]').should('not.be.empty');
    cy.get('[data-testid="request-description"]').should('not.be.empty');
    cy.get('[data-testid="request-status"]').should('be.visible');
    cy.get('[data-testid="request-priority"]').should('be.visible');
    cy.get('[data-testid="request-category"]').should('be.visible');
    cy.get('[data-testid="request-created-date"]').should('be.visible');
    
    // Check for photos if any
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="request-photos"]').length > 0) {
        cy.get('[data-testid="request-photos"]').should('be.visible');
      }
    });
  });

  it('should validate required fields when creating request', () => {
    cy.visit('/maintenance');
    
    cy.get('[data-testid="create-maintenance-button"]').click();
    cy.get('[data-testid="submit-maintenance"]').click();
    
    // Check validation errors
    cy.get('[data-testid="title-error"]').should('contain', 'Title is required');
    cy.get('[data-testid="description-error"]').should('contain', 'Description is required');
    cy.get('[data-testid="category-error"]').should('contain', 'Category is required');
  });
});