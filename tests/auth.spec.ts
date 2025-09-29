import { test, expect } from '@playwright/test';
import { testUsers, selectors } from '../src/shared/testData';

test.describe('Tenant Authentication - Playwright', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocking
    await page.route('/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 1, email: 'john.doe@email.com', firstName: 'John', lastName: 'Doe' },
          token: 'mock-jwt-token'
        })
      });
    });
  });

  test('should allow tenant to login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill(selectors.login.emailInput, testUsers.tenant1.email);
    await page.fill(selectors.login.passwordInput, testUsers.tenant1.password);
    await page.click(selectors.login.loginButton);
    
    // Verify successful login
    await expect(page.locator(selectors.dashboard.welcomeMessage)).toContainText('Welcome back, John');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify profile dropdown is visible
    await expect(page.locator(selectors.dashboard.profileDropdown)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Mock failed login
    await page.route('/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password' })
      });
    });

    await page.goto('/login');
    
    await page.fill(selectors.login.emailInput, 'invalid@email.com');
    await page.fill(selectors.login.passwordInput, 'wrongpassword');
    await page.click(selectors.login.loginButton);
    
    await expect(page.locator(selectors.login.errorMessage)).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.route('/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset email sent' })
      });
    });

    await page.goto('/login');
    
    await page.click(selectors.login.forgotPasswordLink);
    await expect(page).toHaveURL(/.*forgot-password/);
    
    await page.fill('[data-testid="reset-email-input"]', testUsers.tenant1.email);
    await page.click('[data-testid="send-reset-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Password reset email sent');
  });

  test('should logout user successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill(selectors.login.emailInput, testUsers.tenant1.email);
    await page.fill(selectors.login.passwordInput, testUsers.tenant1.password);
    await page.click(selectors.login.loginButton);
    
    await expect(page.locator(selectors.dashboard.welcomeMessage)).toBeVisible();
    
    // Logout
    await page.click(selectors.dashboard.profileDropdown);
    await page.click(selectors.dashboard.logoutButton);
    
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator(selectors.login.loginButton)).toBeVisible();
  });

  test('should validate login form fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click(selectors.login.loginButton);
    
    // Check HTML5 validation or custom validation
    const emailInput = page.locator(selectors.login.emailInput);
    const passwordInput = page.locator(selectors.login.passwordInput);
    
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should remember login state on page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill(selectors.login.emailInput, testUsers.tenant1.email);
    await page.fill(selectors.login.passwordInput, testUsers.tenant1.password);
    await page.click(selectors.login.loginButton);
    
    await expect(page.locator(selectors.dashboard.welcomeMessage)).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator(selectors.dashboard.welcomeMessage)).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});