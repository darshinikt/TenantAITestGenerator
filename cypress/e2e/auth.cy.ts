/// <reference types="cypress" />

describe('Tenant Authentication', () => {
  beforeEach(() => {
    // Set up API intercepts
    cy.intercept('POST', '/api/auth/login', { fixture: 'loginResponse.json' }).as('login');
    cy.intercept('GET', '/api/user/profile', { fixture: 'userProfile.json' }).as('userProfile');
  });

  it('should allow tenant to login with valid credentials', () => {
    cy.visit('/login');
    
    // Fill in login form
    cy.get('[data-testid="email-input"]').type('john.doe@email.com');
    cy.get('[data-testid="password-input"]').type('TenantPass123!');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify successful login
    cy.waitForApiResponse('login');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome back, John');
    cy.url().should('include', '/dashboard');
    
    // Verify user profile is loaded
    cy.waitForApiResponse('userProfile');
    cy.get('[data-testid="profile-dropdown"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('invalid@email.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid email or password');
    cy.url().should('include', '/login');
  });

  it('should handle password reset flow', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="forgot-password-link"]').click();
    cy.url().should('include', '/forgot-password');
    
    cy.get('[data-testid="reset-email-input"]').type('john.doe@email.com');
    cy.get('[data-testid="send-reset-button"]').click();
    
    cy.get('[data-testid="success-message"]').should('contain', 'Password reset email sent');
  });

  it('should logout user successfully', () => {
    cy.loginAsTenant();
    
    cy.get('[data-testid="profile-dropdown"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });
});