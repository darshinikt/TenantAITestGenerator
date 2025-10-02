// Shared API utilities for both Cypress and Playwright
// Provides consistent API testing patterns across frameworks

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  schema?: any;
  requestExample?: any;
  responseExample?: any;
  requiresAuth?: boolean;
}

export interface APITestConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  auth?: {
    type: 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

export interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number;
}

// Tenant Management System API Endpoints
export const TenantAPIEndpoints: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate tenant user',
    requestExample: {
      email: 'john.doe@email.com',
      password: 'TenantPass123!'
    },
    responseExample: {
      success: true,
      user: {
        id: 1,
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant'
      },
      token: 'jwt-token-here',
      expiresIn: '24h'
    },
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/user/profile',
    description: 'Get user profile information',
    responseExample: {
      id: 1,
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      propertyId: 'prop_001',
      unitNumber: 'A101'
    },
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/maintenance/requests',
    description: 'Get maintenance requests for tenant',
    responseExample: [
      {
        id: 'maint_001',
        title: 'Leaky Faucet',
        description: 'Kitchen faucet is dripping',
        priority: 'medium',
        status: 'open',
        category: 'plumbing',
        createdDate: '2025-09-30',
        unitId: 'unit_001'
      }
    ],
    requiresAuth: true
  },
  {
    method: 'POST',
    path: '/api/maintenance/requests',
    description: 'Create new maintenance request',
    requestExample: {
      title: 'AC Not Working',
      description: 'Air conditioning unit not cooling',
      priority: 'high',
      category: 'HVAC'
    },
    responseExample: {
      id: 'maint_002',
      title: 'AC Not Working',
      description: 'Air conditioning unit not cooling',
      priority: 'high',
      status: 'open',
      category: 'HVAC',
      createdDate: '2025-09-30',
      unitId: 'unit_001'
    },
    requiresAuth: true
  },
  {
    method: 'PUT',
    path: '/api/maintenance/requests/{id}',
    description: 'Update maintenance request',
    requestExample: {
      title: 'AC Not Working - Updated',
      description: 'Air conditioning unit not cooling - urgent',
      priority: 'urgent'
    },
    requiresAuth: true
  },
  {
    method: 'DELETE',
    path: '/api/maintenance/requests/{id}',
    description: 'Delete maintenance request',
    responseExample: {
      success: true,
      message: 'Maintenance request deleted successfully'
    },
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/payments/history',
    description: 'Get payment history',
    responseExample: [
      {
        id: 'pay_001',
        amount: 1200.00,
        date: '2025-09-01',
        type: 'rent',
        status: 'paid',
        method: 'credit_card'
      }
    ],
    requiresAuth: true
  },
  {
    method: 'POST',
    path: '/api/payments/process',
    description: 'Process rent payment',
    requestExample: {
      amount: 1200.00,
      method: 'credit_card',
      cardToken: 'card_token_here'
    },
    responseExample: {
      success: true,
      paymentId: 'pay_002',
      amount: 1200.00,
      status: 'paid',
      receipt: 'receipt_url_here'
    },
    requiresAuth: true
  },
  {
    method: 'GET',
    path: '/api/documents',
    description: 'Get tenant documents',
    responseExample: [
      {
        id: 'doc_001',
        name: 'Lease Agreement',
        type: 'lease',
        url: 'document_url_here',
        uploadDate: '2025-01-01'
      }
    ],
    requiresAuth: true
  },
  {
    method: 'POST',
    path: '/api/documents/upload',
    description: 'Upload document',
    requestExample: {
      name: 'Insurance Certificate',
      type: 'insurance',
      file: 'base64_encoded_file'
    },
    responseExample: {
      success: true,
      document: {
        id: 'doc_002',
        name: 'Insurance Certificate',
        type: 'insurance',
        url: 'document_url_here',
        uploadDate: '2025-09-30'
      }
    },
    requiresAuth: true
  }
];

// API Test Data Templates
export const APITestData = {
  validUser: {
    email: 'john.doe@email.com',
    password: 'TenantPass123!',
    firstName: 'John',
    lastName: 'Doe'
  },
  invalidUser: {
    email: 'invalid@email.com',
    password: 'wrongpassword'
  },
  maintenanceRequest: {
    title: 'Test Maintenance Request',
    description: 'This is a test maintenance request for automation',
    priority: 'medium',
    category: 'general'
  },
  payment: {
    amount: 1200.00,
    method: 'credit_card',
    cardToken: 'test_card_token'
  },
  document: {
    name: 'Test Document',
    type: 'other',
    content: 'Test document content'
  }
};

// Common API Utilities
export class APIUtils {
  static generateAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static validateStatusCode(actual: number, expected: number | number[]): boolean {
    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }
    return actual === expected;
  }

  static validateResponseTime(duration: number, maxTime: number = 2000): boolean {
    return duration <= maxTime;
  }

  static sanitizeEndpoint(path: string, params: Record<string, any> = {}): string {
    let sanitized = path;
    Object.entries(params).forEach(([key, value]) => {
      sanitized = sanitized.replace(`{${key}}`, String(value));
    });
    return sanitized;
  }

  static generateTestCaseId(method: string, endpoint: string, scenario: string): string {
    const cleanEndpoint = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    return `${method}_${cleanEndpoint}_${scenario}`.toLowerCase();
  }

  static createErrorScenarios(endpoint: APIEndpoint): any[] {
    const scenarios = [];

    // Authentication errors
    if (endpoint.requiresAuth) {
      scenarios.push({
        name: 'Missing authentication token',
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        description: 'Should return 401 when no auth token provided'
      });

      scenarios.push({
        name: 'Invalid authentication token',
        statusCode: 401,
        headers: { 'Authorization': 'Bearer invalid_token', 'Content-Type': 'application/json' },
        description: 'Should return 401 when invalid token provided'
      });
    }

    // Method not allowed
    scenarios.push({
      name: 'Method not allowed',
      method: 'OPTIONS',
      statusCode: 405,
      description: 'Should return 405 for unsupported HTTP methods'
    });

    // Invalid content type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      scenarios.push({
        name: 'Invalid content type',
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        description: 'Should return 400 for invalid content type'
      });
    }

    return scenarios;
  }

  static generateBoundaryTests(endpoint: APIEndpoint): any[] {
    const tests = [];

    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.requestExample) {
      // Test with empty body
      tests.push({
        name: 'Empty request body',
        body: {},
        expectedStatus: 400,
        description: 'Should validate required fields'
      });

      // Test with oversized data
      tests.push({
        name: 'Oversized request',
        body: { ...endpoint.requestExample, description: 'x'.repeat(10000) },
        expectedStatus: 413,
        description: 'Should reject oversized requests'
      });

      // Test with SQL injection attempts
      tests.push({
        name: 'SQL injection attempt',
        body: { ...endpoint.requestExample, title: "'; DROP TABLE users; --" },
        expectedStatus: 400,
        description: 'Should sanitize SQL injection attempts'
      });
    }

    return tests;
  }
}

export default APIUtils;