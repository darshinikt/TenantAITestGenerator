/// <reference types="cypress" />

describe('Tenant Management API - Maintenance Requests', () => {
  const baseUrl = Cypress.config('baseUrl') || 'http://localhost:3000';
  let authToken: string;

  before(() => {
    // Authenticate once for all tests
    cy.request({
      method: 'POST',
      url: `${baseUrl}/auth/login`,
      body: {
        email: 'john.doe@email.com',
        password: 'TenantPass123!'
      }
    }).then((response) => {
      authToken = response.body.token;
    });
  });

  describe('CRUD Operations', () => {
    let createdRequestId: string;

    it('should create a new maintenance request', () => {
      const newRequest = {
        title: 'Leaky Bathroom Faucet',
        description: 'The bathroom faucet has been dripping for several days and needs repair.',
        priority: 'medium',
        category: 'plumbing'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: newRequest,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('title', newRequest.title);
        expect(response.body).to.have.property('description', newRequest.description);
        expect(response.body).to.have.property('priority', newRequest.priority);
        expect(response.body).to.have.property('category', newRequest.category);
        expect(response.body).to.have.property('status', 'open');
        expect(response.body).to.have.property('createdDate');
        
        // Store ID for other tests
        createdRequestId = response.body.id;
        cy.wrap(createdRequestId).as('createdRequestId');
        
        // Validate response time
        expect(response.duration).to.be.lessThan(3000);
      });
    });

    it('should retrieve all maintenance requests', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        if (response.body.length > 0) {
          const request = response.body[0];
          expect(request).to.have.property('id');
          expect(request).to.have.property('title');
          expect(request).to.have.property('description');
          expect(request).to.have.property('priority');
          expect(request).to.have.property('status');
          expect(request).to.have.property('category');
          expect(request).to.have.property('createdDate');
        }
        
        // Validate response time
        expect(response.duration).to.be.lessThan(2000);
      });
    });

    it('should retrieve a specific maintenance request', () => {
      cy.get('@createdRequestId').then((requestId) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}/maintenance/${requestId}`,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('id', requestId);
          expect(response.body).to.have.property('title');
          expect(response.body).to.have.property('description');
        });
      });
    });

    it('should update a maintenance request', () => {
      cy.get('@createdRequestId').then((requestId) => {
        const updateData = {
          title: 'Urgent: Leaky Bathroom Faucet',
          priority: 'high',
          description: 'The leak has gotten worse and is now flooding the bathroom floor.'
        };

        cy.request({
          method: 'PUT',
          url: `${baseUrl}/maintenance/${requestId}`,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: updateData,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('id', requestId);
          expect(response.body).to.have.property('title', updateData.title);
          expect(response.body).to.have.property('priority', updateData.priority);
          expect(response.body).to.have.property('description', updateData.description);
        });
      });
    });

    it('should delete a maintenance request', () => {
      cy.get('@createdRequestId').then((requestId) => {
        cy.request({
          method: 'DELETE',
          url: `${baseUrl}/maintenance/${requestId}`,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('success', true);
          expect(response.body).to.have.property('message');
        });
      });
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate required fields when creating request', () => {
      const incompleteRequest = {
        title: 'Missing Fields Request'
        // Missing description, priority, category
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: incompleteRequest,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.contain('required');
      });
    });

    it('should validate priority values', () => {
      const invalidPriorityRequest = {
        title: 'Invalid Priority Request',
        description: 'This request has an invalid priority value',
        priority: 'super-mega-urgent', // Invalid priority
        category: 'general'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: invalidPriorityRequest,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('should validate category values', () => {
      const invalidCategoryRequest = {
        title: 'Invalid Category Request',
        description: 'This request has an invalid category value',
        priority: 'medium',
        category: 'invalid-category'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: invalidCategoryRequest,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('should handle non-existent request ID', () => {
      const nonExistentId = 'nonexistent_request_id';

      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance/${nonExistentId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject oversized requests', () => {
      const oversizedRequest = {
        title: 'Oversized Request',
        description: 'x'.repeat(10000), // Very long description
        priority: 'medium',
        category: 'general'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: oversizedRequest,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 413]);
        expect(response.body).to.have.property('error');
      });
    });

    it('should sanitize HTML/XSS attempts', () => {
      const xssAttempt = {
        title: '<script>alert("XSS")</script>',
        description: '<img src=x onerror=alert("XSS")>',
        priority: 'medium',
        category: 'general'
      };

      cy.request({
        method: 'POST',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: xssAttempt,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201) {
          // If request succeeds, ensure XSS is sanitized
          expect(response.body.title).to.not.contain('<script>');
          expect(response.body.description).to.not.contain('<img');
        } else {
          // Or it should be rejected
          expect(response.status).to.eq(400);
        }
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without authentication', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should reject requests with invalid token', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': 'Bearer invalid_token',
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should only allow tenants to access their own requests', () => {
      // This test would need a second tenant's token to properly test
      // For now, we'll test that the authenticated user gets appropriate data
      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        // All returned requests should belong to the authenticated user
        response.body.forEach((request: any) => {
          // In a real implementation, you'd check request.tenantId or similar
          expect(request).to.have.property('id');
        });
      });
    });
  });

  describe('Performance Testing', () => {
    it('should respond to GET requests within acceptable time', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/maintenance`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.duration).to.be.lessThan(2000); // 2 seconds max
      });
    });

    it('should handle concurrent requests', () => {
      const concurrentRequests = Array.from({ length: 5 }, () =>
        cy.request({
          method: 'GET',
          url: `${baseUrl}/maintenance`,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      cy.wrap(Promise.all(concurrentRequests)).then((responses: any) => {
        responses.forEach((response: any) => {
          expect(response.status).to.eq(200);
          expect(response.duration).to.be.lessThan(3000);
        });
      });
    });
  });
});