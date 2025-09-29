// Shared test data and utilities for both Cypress and Playwright

export interface TenantUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  propertyId: string;
  unitNumber: string;
  role: 'tenant' | 'admin' | 'manager';
}

export interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  number: string;
  type: string;
  rent: number;
  tenant?: TenantUser;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'completed' | 'closed';
  category: string;
  createdDate: string;
  unitId: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  type: 'rent' | 'deposit' | 'fee';
  status: 'paid' | 'pending' | 'overdue';
  method: 'credit_card' | 'bank_transfer' | 'check';
}

// Test data
export const testUsers: Record<string, TenantUser> = {
  tenant1: {
    email: 'john.doe@email.com',
    password: 'TenantPass123!',
    firstName: 'John',
    lastName: 'Doe',
    propertyId: 'prop_001',
    unitNumber: 'A101',
    role: 'tenant'
  },
  tenant2: {
    email: 'jane.smith@email.com',
    password: 'TenantPass456!',
    firstName: 'Jane',
    lastName: 'Smith',
    propertyId: 'prop_001',
    unitNumber: 'B205',
    role: 'tenant'
  },
  admin: {
    email: 'admin@propertymanagement.com',
    password: 'AdminPass789!',
    firstName: 'Admin',
    lastName: 'User',
    propertyId: 'prop_001',
    unitNumber: '',
    role: 'admin'
  }
};

export const testProperties: Property[] = [
  {
    id: 'prop_001',
    name: 'Sunset Apartments',
    address: '123 Main Street, Anytown, ST 12345',
    units: [
      { id: 'unit_001', number: 'A101', type: '1BR/1BA', rent: 1200 },
      { id: 'unit_002', number: 'A102', type: '1BR/1BA', rent: 1200 },
      { id: 'unit_003', number: 'B205', type: '2BR/2BA', rent: 1800 }
    ]
  }
];

export const testMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint_001',
    title: 'Leaky Faucet',
    description: 'Kitchen faucet is dripping constantly',
    priority: 'medium',
    status: 'open',
    category: 'Plumbing',
    createdDate: '2025-09-28',
    unitId: 'unit_001'
  },
  {
    id: 'maint_002',
    title: 'AC Not Working',
    description: 'Air conditioning unit not cooling',
    priority: 'high',
    status: 'in-progress',
    category: 'HVAC',
    createdDate: '2025-09-29',
    unitId: 'unit_003'
  }
];

// Selectors that work with both frameworks
export const selectors = {
  // Login page
  login: {
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    errorMessage: '[data-testid="error-message"]',
    forgotPasswordLink: '[data-testid="forgot-password-link"]'
  },
  
  // Dashboard
  dashboard: {
    welcomeMessage: '[data-testid="welcome-message"]',
    navigationMenu: '[data-testid="nav-menu"]',
    profileDropdown: '[data-testid="profile-dropdown"]',
    logoutButton: '[data-testid="logout-button"]'
  },
  
  // Maintenance requests
  maintenance: {
    createButton: '[data-testid="create-maintenance-button"]',
    titleInput: '[data-testid="maintenance-title"]',
    descriptionInput: '[data-testid="maintenance-description"]',
    prioritySelect: '[data-testid="maintenance-priority"]',
    categorySelect: '[data-testid="maintenance-category"]',
    submitButton: '[data-testid="submit-maintenance"]',
    requestsList: '[data-testid="maintenance-requests-list"]',
    requestItem: '[data-testid="maintenance-request-item"]'
  },
  
  // Payments
  payments: {
    paymentHistory: '[data-testid="payment-history"]',
    makePaymentButton: '[data-testid="make-payment-button"]',
    amountInput: '[data-testid="payment-amount"]',
    paymentMethodSelect: '[data-testid="payment-method"]',
    confirmPaymentButton: '[data-testid="confirm-payment"]',
    paymentSuccessMessage: '[data-testid="payment-success"]'
  },
  
  // Documents
  documents: {
    documentsGrid: '[data-testid="documents-grid"]',
    uploadButton: '[data-testid="upload-document"]',
    fileInput: '[data-testid="file-input"]',
    documentItem: '[data-testid="document-item"]',
    downloadButton: '[data-testid="download-document"]'
  }
};

// Common test utilities
export class TestUtils {
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test_${timestamp}@example.com`;
  }
  
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US');
  }
}