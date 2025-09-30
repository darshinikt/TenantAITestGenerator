/// <reference types="cypress" />

describe('Tenant Authentication', () => {
  beforeEach(() => {
    // Visit the application running on localhost:3000
    cy.visit('http://localhost:3000');
  });

  it('should display login page correctly', () => {
    cy.title().should('include', 'Tenant Management Portal');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.get('[data-testid="forgot-password-link"]').should('be.visible');
  });

  it('should allow tenant to login with valid credentials', () => {
    // Fill in login form with demo credentials
    cy.get('[data-testid="email-input"]').type('john.doe@email.com');
    cy.get('[data-testid="password-input"]').type('TenantPass123!');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify successful login
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome back');
    cy.get('[data-testid="nav-menu"]').should('be.visible');
    cy.get('[data-testid="profile-dropdown"]').should('be.visible');
    
    // Verify we're in the main application
    cy.get('#mainApp').should('be.visible');
    cy.get('#loginPage').should('not.be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@email.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    
    // Should remain on login page
    cy.get('#loginPage').should('be.visible');
    cy.get('#mainApp').should('not.be.visible');
  });

  it('should validate email format', () => {
    cy.get('[data-testid="email-input"]').type('invalidemail');
    cy.get('[data-testid="password-input"]').type('somepassword');
    cy.get('[data-testid="login-button"]').click();
    
    // HTML5 validation should prevent submission
    cy.get('[data-testid="email-input"]:invalid').should('exist');
  });

  it('should require both email and password', () => {
    cy.get('[data-testid="login-button"]').click();
    
    // Both fields should be marked as required
    cy.get('[data-testid="email-input"]:invalid').should('exist');
    cy.get('[data-testid="password-input"]:invalid').should('exist');
  });

  it('should logout user successfully', () => {
    // Login first
    cy.get('[data-testid="email-input"]').type('john.doe@email.com');
    cy.get('[data-testid="password-input"]').type('TenantPass123!');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login to complete
    cy.get('[data-testid="welcome-message"]').should('be.visible');
    
    // Logout
    cy.get('[data-testid="profile-dropdown"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Should return to login page
    cy.get('#loginPage').should('be.visible');
    cy.get('#mainApp').should('not.be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
  });

  it('should persist login state on page reload', () => {
    // Login
    cy.get('[data-testid="email-input"]').type('john.doe@email.com');
    cy.get('[data-testid="password-input"]').type('TenantPass123!');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="welcome-message"]').should('be.visible');
    
    // Reload page
    cy.reload();
    
    // Should still be logged in
    cy.get('[data-testid="welcome-message"]').should('be.visible');
    cy.get('#mainApp').should('be.visible');
    cy.get('#loginPage').should('not.be.visible');
  });
});