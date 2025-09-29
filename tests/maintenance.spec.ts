import { test, expect } from '@playwright/test';
import { testUsers, testMaintenanceRequests, selectors } from '../src/shared/testData';

test.describe('Maintenance Requests - Playwright', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.route('/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: testUsers.tenant1,
          token: 'mock-jwt-token'
        })
      });
    });

    // Mock maintenance requests API
    await page.route('/api/maintenance/requests', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testMaintenanceRequests)
        });
      } else if (route.request().method() === 'POST') {
        const newRequest = {
          id: 'maint_003',
          ...JSON.parse(route.request().postData() || '{}'),
          status: 'open',
          createdDate: new Date().toISOString().split('T')[0]
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newRequest)
        });
      }
    });

    // Login before each test
    await page.goto('/login');
    await page.fill(selectors.login.emailInput, testUsers.tenant1.email);
    await page.fill(selectors.login.passwordInput, testUsers.tenant1.password);
    await page.click(selectors.login.loginButton);
    await expect(page.locator(selectors.dashboard.welcomeMessage)).toBeVisible();
  });

  test('should display existing maintenance requests', async ({ page }) => {
    await page.goto('/maintenance');
    
    // Wait for requests to load
    await expect(page.locator(selectors.maintenance.requestsList)).toBeVisible();
    
    // Verify requests are displayed
    const requestItems = page.locator(selectors.maintenance.requestItem);
    await expect(requestItems.first()).toBeVisible();
    
    // Check first request details
    const firstRequest = requestItems.first();
    await expect(firstRequest.locator('[data-testid="request-title"]')).not.toBeEmpty();
    await expect(firstRequest.locator('[data-testid="request-status"]')).toBeVisible();
    await expect(firstRequest.locator('[data-testid="request-priority"]')).toBeVisible();
    await expect(firstRequest.locator('[data-testid="request-date"]')).toBeVisible();
  });

  test('should create a new maintenance request', async ({ page }) => {
    await page.goto('/maintenance');
    
    const requestTitle = 'Broken Bathroom Light';
    const requestDescription = 'The main bathroom light fixture is not working and needs replacement.';
    
    // Click create button
    await page.click(selectors.maintenance.createButton);
    
    // Fill out the form
    await page.fill(selectors.maintenance.titleInput, requestTitle);
    await page.fill(selectors.maintenance.descriptionInput, requestDescription);
    await page.selectOption(selectors.maintenance.prioritySelect, 'high');
    await page.selectOption(selectors.maintenance.categorySelect, 'electrical');
    
    // Submit the form
    await page.click(selectors.maintenance.submitButton);
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Maintenance request submitted successfully');
    
    // Verify the new request appears in the list
    await expect(page.locator(selectors.maintenance.requestsList)).toContainText(requestTitle);
  });

  test('should filter maintenance requests by status', async ({ page }) => {
    await page.goto('/maintenance');
    
    // Wait for requests to load
    await expect(page.locator(selectors.maintenance.requestsList)).toBeVisible();
    
    // Filter by 'open' status
    await page.selectOption('[data-testid="status-filter"]', 'open');
    
    // Verify all visible requests have 'open' status
    const visibleRequests = page.locator(selectors.maintenance.requestItem);
    const count = await visibleRequests.count();
    
    for (let i = 0; i < count; i++) {
      const statusText = await visibleRequests.nth(i).locator('[data-testid="request-status"]').textContent();
      expect(statusText?.toLowerCase()).toContain('open');
    }
  });

  test('should show maintenance request details', async ({ page }) => {
    await page.goto('/maintenance');
    
    // Wait for requests to load and click on first one
    await expect(page.locator(selectors.maintenance.requestsList)).toBeVisible();
    await page.locator(selectors.maintenance.requestItem).first().click();
    
    // Verify we're on the details page
    await expect(page).toHaveURL(/.*maintenance\/\d+/);
    
    // Verify details are displayed
    await expect(page.locator('[data-testid="request-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-title"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="request-description"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="request-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="request-created-date"]')).toBeVisible();
  });

  test('should validate required fields when creating request', async ({ page }) => {
    await page.goto('/maintenance');
    
    // Click create and try to submit empty form
    await page.click(selectors.maintenance.createButton);
    await page.click(selectors.maintenance.submitButton);
    
    // Check for validation errors
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required');
    await expect(page.locator('[data-testid="description-error"]')).toContainText('Description is required');
    await expect(page.locator('[data-testid="category-error"]')).toContainText('Category is required');
  });

  test('should allow editing an existing maintenance request', async ({ page }) => {
    // Mock update API
    await page.route('/api/maintenance/requests/*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Request updated successfully' })
        });
      }
    });

    await page.goto('/maintenance');
    
    // Wait for requests and click edit on first one
    await expect(page.locator(selectors.maintenance.requestsList)).toBeVisible();
    await page.locator('[data-testid="edit-request-button"]').first().click();
    
    // Modify the request
    const updatedDescription = 'Updated: This issue is now urgent and requires immediate attention.';
    await page.fill(selectors.maintenance.descriptionInput, updatedDescription);
    await page.selectOption(selectors.maintenance.prioritySelect, 'urgent');
    
    // Submit update
    await page.click('[data-testid="update-maintenance"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Request updated successfully');
  });

  test('should support file upload for maintenance requests', async ({ page }) => {
    await page.goto('/maintenance');
    
    await page.click(selectors.maintenance.createButton);
    
    // Fill basic info
    await page.fill(selectors.maintenance.titleInput, 'Damage Report');
    await page.fill(selectors.maintenance.descriptionInput, 'See attached photos for damage details.');
    await page.selectOption(selectors.maintenance.prioritySelect, 'medium');
    await page.selectOption(selectors.maintenance.categorySelect, 'general');
    
    // Upload a file (mock file upload)
    const fileInput = page.locator('[data-testid="photo-upload"]');
    await fileInput.setInputFiles({
      name: 'damage-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    });
    
    await page.click(selectors.maintenance.submitButton);
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Maintenance request submitted successfully');
  });
});