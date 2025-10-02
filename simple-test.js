const { chromium } = require('playwright');

async function runSimpleTest() {
  console.log('🚀 Starting simple Playwright test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test 1: Navigate to the application
    console.log('📍 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    
    // Test 2: Check if login form is visible
    console.log('🔍 Checking login form...');
    await page.waitForSelector('[data-testid="email-input"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="password-input"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="login-button"]', { timeout: 5000 });
    console.log('✅ Login form is visible');
    
    // Test 3: Try to login with demo credentials
    console.log('🔐 Testing login...');
    await page.fill('[data-testid="email-input"]', 'john.doe@email.com');
    await page.fill('[data-testid="password-input"]', 'TenantPass123!');
    await page.click('[data-testid="login-button"]');
    
    // Test 4: Check if dashboard loads
    console.log('📊 Checking dashboard...');
    await page.waitForSelector('[data-testid="welcome-message"]', { timeout: 10000 });
    console.log('✅ Dashboard loaded successfully');
    
    // Test 5: Test navigation
    console.log('🧭 Testing navigation...');
    await page.click('[data-testid="nav-maintenance"]');
    await page.waitForSelector('[data-testid="maintenance-requests-list"]', { timeout: 5000 });
    console.log('✅ Navigation to maintenance section works');
    
    // Test 6: Test creating a maintenance request
    console.log('🔧 Testing maintenance request creation...');
    await page.click('[data-testid="create-maintenance-button"]');
    await page.fill('[data-testid="maintenance-title"]', 'Test Request');
    await page.fill('[data-testid="maintenance-description"]', 'This is a test maintenance request');
    await page.selectOption('[data-testid="maintenance-category"]', 'plumbing');
    await page.click('[data-testid="submit-maintenance"]');
    
    // Wait for success message
    await page.waitForSelector('.alert-success', { timeout: 10000 });
    console.log('✅ Maintenance request created successfully');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-failure.png' });
    console.log('📸 Screenshot saved as test-failure.png');
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

// Run the test
runSimpleTest().then(() => {
  console.log('✨ Test execution completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});