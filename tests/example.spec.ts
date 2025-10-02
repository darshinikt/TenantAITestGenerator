import { test, expect } from '@playwright/test';

// Tenant Management Portal Tests

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Tenant Management Portal/);
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('invalid@email.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();
    
    await expect(page.getByTestId('error-message')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('john.doe@email.com');
    await page.getByTestId('password-input').fill('TenantPass123!');
    await page.getByTestId('login-button').click();
    
    // Should redirect to dashboard
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    await expect(page.getByTestId('nav-menu')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('john.doe@email.com');
    await page.getByTestId('password-input').fill('TenantPass123!');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('welcome-message')).toBeVisible();
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.getByTestId('welcome-message')).toContainText('Welcome back');
    await expect(page.locator('#maintenanceCount')).toBeVisible();
    await expect(page.locator('#paymentStatus')).toBeVisible();
    await expect(page.locator('#documentCount')).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    // Test navigation to maintenance
    await page.getByTestId('nav-maintenance').click();
    await expect(page.getByTestId('maintenance-requests-list')).toBeVisible();
    
    // Test navigation to payments
    await page.getByTestId('nav-payments').click();
    await expect(page.getByTestId('payment-history')).toBeVisible();
    
    // Test navigation to documents
    await page.getByTestId('nav-documents').click();
    await expect(page.getByTestId('documents-grid')).toBeVisible();
    
    // Test navigation to profile
    await page.getByTestId('nav-profile').click();
    await expect(page.locator('#profileForm')).toBeVisible();
    
    // Test navigation back to dashboard
    await page.getByTestId('nav-dashboard').click();
    await expect(page.getByTestId('welcome-message')).toBeVisible();
  });
});

test.describe('Maintenance Requests', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to maintenance section
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('john.doe@email.com');
    await page.getByTestId('password-input').fill('TenantPass123!');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    await page.getByTestId('nav-maintenance').click();
  });

  test('should create new maintenance request', async ({ page }) => {
    await page.getByTestId('create-maintenance-button').click();
    
    // Fill out the form
    await page.getByTestId('maintenance-title').fill('Leaky Faucet');
    await page.getByTestId('maintenance-description').fill('Kitchen faucet is dripping constantly');
    await page.getByTestId('maintenance-priority').selectOption('high');
    await page.getByTestId('maintenance-category').selectOption('plumbing');
    
    await page.getByTestId('submit-maintenance').click();
    
    // Should show success message and close modal
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByTestId('create-maintenance-button').click();
    
    // Try to submit without filling required fields
    await page.getByTestId('submit-maintenance').click();
    
    // Form validation should prevent submission
    await expect(page.getByTestId('maintenance-title')).toBeVisible();
  });
});

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to payments section
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('john.doe@email.com');
    await page.getByTestId('password-input').fill('TenantPass123!');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    await page.getByTestId('nav-payments').click();
  });

  test('should make a payment', async ({ page }) => {
    await page.getByTestId('make-payment-button').click();
    
    // Fill payment form
    await page.getByTestId('payment-amount').fill('1200');
    await page.getByTestId('payment-method').selectOption('credit_card');
    
    await page.getByTestId('confirm-payment').click();
    
    // Should show success message
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('should show credit card fields when credit card selected', async ({ page }) => {
    await page.getByTestId('make-payment-button').click();
    
    await page.getByTestId('payment-method').selectOption('credit_card');
    await expect(page.locator('#creditCardFields')).toBeVisible();
    
    await page.getByTestId('payment-method').selectOption('bank_transfer');
    await expect(page.locator('#creditCardFields')).toHaveClass(/hidden/);
  });
});

test.describe('User Experience', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('http://localhost:3000');
    
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    await page.getByTestId('email-input').fill('john.doe@email.com');
    await page.getByTestId('password-input').fill('TenantPass123!');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('welcome-message')).toBeVisible();
    
    // Test logout
    await page.getByTestId('profile-dropdown').click();
    await page.getByTestId('logout-button').click();
    
    // Should return to login page
    await expect(page.getByTestId('email-input')).toBeVisible();
  });
});
