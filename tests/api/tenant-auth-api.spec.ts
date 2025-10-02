import { test, expect } from '@playwright/test';

test.describe('Tenant Management API - Authentication (Playwright)', () => {
  const baseURL = 'http://127.0.0.1:3000'; // Use IPv4 to avoid connection issues
  
  test.describe('Authentication API', () => {
    test('should authenticate with valid credentials', async ({ request }) => {
      const validCredentials = {
        email: 'john.doe@email.com',
        password: 'TenantPass123!'
      };

      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: validCredentials
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toHaveProperty('email', validCredentials.email);
      
      // Validate response headers
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('should reject invalid credentials', async ({ request }) => {
      const invalidCredentials = {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      };

      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: invalidCredentials
      });

      expect(response.status()).toBe(401);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toMatch(/invalid/i);
    });

    test('should validate required fields', async ({ request }) => {
      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: {}
      });

      expect(response.status()).toBe(401); // Simple server returns 401 for missing fields
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('should reject malformed email addresses', async ({ request }) => {
      const malformedCredentials = {
        email: 'not-an-email',
        password: 'TenantPass123!'
      };

      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: malformedCredentials
      });

      expect(response.status()).toBe(401); // Simple server returns 401 for invalid credentials
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('should handle SQL injection attempts', async ({ request }) => {
      const sqlInjectionAttempt = {
        email: "'; DROP TABLE users; --",
        password: 'password'
      };

      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: sqlInjectionAttempt
      });

      expect(response.status()).toBe(401); // Simple server should handle this gracefully
      // Should not return 500 (server error from SQL injection)
      expect(response.status()).not.toBe(500);
    });

    test('should validate JSON schema of login response', async ({ request }) => {
      const validCredentials = {
        email: 'john.doe@email.com',
        password: 'TenantPass123!'
      };

      const response = await request.post(`${baseURL}/auth/login`, { // Removed /api prefix
        data: validCredentials
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Validate expected fields based on simple server response
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toHaveProperty('id');
      expect(responseBody.user).toHaveProperty('email');
      expect(responseBody.user).toHaveProperty('name');
      expect(responseBody.user).toHaveProperty('role');
    });
  });

  test.describe('Profile API', () => {
    test('should get user profile', async ({ request }) => {
      const response = await request.get(`${baseURL}/user/profile`); // Removed /api prefix

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('email');
      expect(responseBody).toHaveProperty('name');
      expect(responseBody).toHaveProperty('phone');
      expect(responseBody).toHaveProperty('unit');
      expect(responseBody).toHaveProperty('rent');
      expect(responseBody).toHaveProperty('lease_term');
      
      // Validate data types
      expect(typeof responseBody.email).toBe('string');
      expect(typeof responseBody.name).toBe('string');
      expect(typeof responseBody.id).toBe('number');
    });

    test('should validate profile response schema', async ({ request }) => {
      const response = await request.get(`${baseURL}/user/profile`); // Removed /api prefix

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Expected profile schema based on simple server
      expect(responseBody).toEqual({
        id: expect.any(Number),
        email: expect.any(String),
        name: expect.any(String),
        phone: expect.any(String),
        unit: expect.any(String),
        rent: expect.any(String),
        lease_term: expect.any(String)
      });
    });

    test('should handle concurrent profile requests', async ({ request }) => {
      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request.get(`${baseURL}/user/profile`) // Removed /api prefix
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // All responses should have the same data
      const responseBodies = await Promise.all(responses.map(r => r.json()));
      
      for (let i = 1; i < responseBodies.length; i++) {
        expect(responseBodies[0]).toEqual(responseBodies[i]);
      }
    });

    test('should validate response headers', async ({ request }) => {
      const response = await request.get(`${baseURL}/user/profile`); // Removed /api prefix

      expect(response.status()).toBe(200);
      
      // Validate content type
      const headers = response.headers();
      expect(headers['content-type']).toContain('application/json');
    });
  });

  test.describe('API Performance Testing', () => {
    test('should meet response time requirements', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${baseURL}/user/profile`); // Removed /api prefix
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(2000); // 2 seconds max
    });

    test('should handle load testing', async ({ request }) => {
      const concurrentRequests = 20;
      const requests = Array.from({ length: concurrentRequests }, () =>
        request.get(`${baseURL}/user/profile`) // Removed /api prefix
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });

      // Average response time should be reasonable
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(1000); // 1 second average
    });
  });

  test.describe('Maintenance API', () => {
    test('should get maintenance requests', async ({ request }) => {
      const response = await request.get(`${baseURL}/maintenance`);

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });

    test('should create maintenance request', async ({ request }) => {
      const maintenanceData = {
        title: 'Test Maintenance Request',
        description: 'This is a test maintenance request',
        category: 'plumbing',
        priority: 'medium'
      };

      const response = await request.post(`${baseURL}/maintenance`, {
        data: maintenanceData
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('title', maintenanceData.title);
      expect(responseBody).toHaveProperty('status', 'open');
      expect(responseBody).toHaveProperty('created_at');
    });
  });

  test.describe('Payment API', () => {
    test('should get payments', async ({ request }) => {
      const response = await request.get(`${baseURL}/payments`);

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });

    test('should create payment', async ({ request }) => {
      const paymentData = {
        amount: 1200.00,
        payment_method: 'credit_card'
      };

      const response = await request.post(`${baseURL}/payments`, {
        data: paymentData
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('amount', paymentData.amount);
      expect(responseBody).toHaveProperty('status', 'completed');
      expect(responseBody).toHaveProperty('payment_date');
    });
  });

  test.describe('Document API', () => {
    test('should get documents', async ({ request }) => {
      const response = await request.get(`${baseURL}/documents`);

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(Array.isArray(responseBody)).toBe(true);
    });

    test('should create document', async ({ request }) => {
      const documentData = {
        name: 'Test Document',
        type: 'lease',
        file_path: '/test/path.pdf'
      };

      const response = await request.post(`${baseURL}/documents`, {
        data: documentData
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('name', documentData.name);
      expect(responseBody).toHaveProperty('created_at');
    });

    test('should delete document', async ({ request }) => {
      // First create a document
      const documentData = {
        name: 'Document to Delete',
        type: 'invoice',
        file_path: '/test/delete.pdf'
      };

      const createResponse = await request.post(`${baseURL}/documents`, {
        data: documentData
      });

      expect(createResponse.status()).toBe(200);
      const createdDocument = await createResponse.json();

      // Then delete it
      const deleteResponse = await request.delete(`${baseURL}/documents/${createdDocument.id}`);

      expect(deleteResponse.status()).toBe(200);
      
      const responseBody = await deleteResponse.json();
      expect(responseBody).toHaveProperty('success', true);
    });
  });

  test.describe('Health Check API', () => {
    test('should return server health status', async ({ request }) => {
      const response = await request.get(`${baseURL}/health`);

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('status', 'ok');
      expect(responseBody).toHaveProperty('timestamp');
    });
  });
});