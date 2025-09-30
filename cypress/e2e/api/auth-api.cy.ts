/// <reference types="cypress" />

describe('Tenant Management API - Authentication', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000';

  beforeEach(() => {
    // Set up API base URL
    cy.intercept('GET', '/api/**').as('apiRequest');
    cy.intercept('POST', '/api/**').as('apiPost');
    cy.intercept('PUT', '/api/**').as('apiPut');
    cy.intercept('DELETE', '/api/**').as('apiDelete');
  });

  describe('Authentication API', () => {
    it('should authenticate with valid credentials', () => {
      const validCredentials = {
        email: 'john.doe@email.com',
        password: 'TenantPass123!'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: validCredentials,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('email', validCredentials.email);
        
        // Validate response time
        expect(response.duration).to.be.lessThan(2000);
        
        // Store token for other tests
        cy.wrap(response.body.token).as('authToken');
      });
    });

    it('should reject invalid credentials', () => {
      const invalidCredentials = {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: invalidCredentials,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.contain('Invalid');
      });
    });

    it('should validate required fields', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject malformed email addresses', () => {
      const malformedCredentials = {
        email: 'not-an-email',
        password: 'TenantPass123!'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: malformedCredentials,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        expect(response.body).to.have.property('error');
      });
    });

    it('should handle SQL injection attempts', () => {
      const sqlInjectionAttempt = {
        email: "'; DROP TABLE users; --",
        password: 'password'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: sqlInjectionAttempt,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 401]);
        // Should not return 500 (server error from SQL injection)
        expect(response.status).to.not.eq(500);
      });
    });

    it('should rate limit excessive login attempts', () => {
      const invalidCredentials = {
        email: 'test@email.com',
        password: 'wrongpassword'
      };

      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, () => 
        cy.request({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          body: invalidCredentials,
          failOnStatusCode: false
        })
      );

      cy.wrap(Promise.all(requests)).then((responses: any) => {
        // At least some requests should be rate limited
        const rateLimitedResponses = responses.filter((r: any) => r.status === 429);
        expect(rateLimitedResponses.length).to.be.greaterThan(0);
      });
    });
  });

  describe('Profile API', () => {
    beforeEach(() => {
      // Login and get token
      cy.request({
        method: 'POST',
        url: `${baseUrl}/auth/login`,
        body: {
          email: 'john.doe@email.com',
          password: 'TenantPass123!'
        }
      }).then((response) => {
        cy.wrap(response.body.token).as('authToken');
      });
    });

    it('should get user profile with valid token', () => {
      cy.get('@authToken').then((token) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/user/profile`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('email');
          expect(response.body).to.have.property('firstName');
          expect(response.body).to.have.property('lastName');
          
          // Validate response structure
          expect(response.body.email).to.be.a('string');
          expect(response.body.firstName).to.be.a('string');
          expect(response.body.lastName).to.be.a('string');
        });
      });
    });

    it('should reject requests without authentication', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/user/profile`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject requests with invalid token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/user/profile`,
        headers: {
          'Authorization': 'Bearer invalid_token_here',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject expired tokens', () => {
      // Mock expired token (in real scenario, this would be an actual expired token)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token';
      
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/user/profile`,
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });
  });
});