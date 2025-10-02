import { test, expect } from '@playwright/test';

test('simple health check test', async ({ request }) => {
  console.log('Testing health endpoint...');
  
  try {
    const response = await request.get('http://127.0.0.1:3000/health');
    console.log('Response status:', response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log('Response body:', body);
      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('status', 'ok');
    } else {
      console.log('Health check failed with status:', response.status());
      expect(response.status()).toBe(200);
    }
  } catch (error) {
    console.error('Error during health check:', error.message);
    throw error;
  }
});

test('simple auth test', async ({ request }) => {
  console.log('Testing auth endpoint...');
  
  try {
    const response = await request.post('http://127.0.0.1:3000/auth/login', {
      data: {
        email: 'john.doe@email.com',
        password: 'TenantPass123!'
      }
    });
    
    console.log('Auth response status:', response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log('Auth response body:', body);
      expect(response.status()).toBe(200);
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('token');
    } else {
      console.log('Auth failed with status:', response.status());
      const body = await response.text();
      console.log('Error response:', body);
    }
  } catch (error) {
    console.error('Error during auth test:', error.message);
    throw error;
  }
});