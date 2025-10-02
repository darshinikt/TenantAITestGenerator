const { chromium } = require('playwright');

async function testLogin() {
  console.log('🚀 Starting basic Playwright test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to http://localhost:3001');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    console.log('🔍 Checking page title...');
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    console.log('🔍 Looking for login elements...');
    await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
    console.log('✅ Email input found');
    
    await page.waitForSelector('[data-testid="password-input"]', { timeout: 10000 });
    console.log('✅ Password input found');
    
    await page.waitForSelector('[data-testid="login-button"]', { timeout: 10000 });
    console.log('✅ Login button found');
    
    console.log('🔑 Attempting login...');
    await page.fill('[data-testid="email-input"]', 'john.doe@email.com');
    await page.fill('[data-testid="password-input"]', 'TenantPass123!');
    await page.click('[data-testid="login-button"]');
    
    console.log('⏳ Waiting for login response...');
    try {
      await page.waitForSelector('[data-testid="welcome-message"]', { timeout: 15000 });
      console.log('✅ Login successful! Welcome message found.');
      
      // Test navigation
      console.log('🧭 Testing navigation...');
      await page.click('[data-testid="nav-maintenance"]');
      await page.waitForSelector('[data-testid="maintenance-requests-list"]', { timeout: 10000 });
      console.log('✅ Maintenance section loaded');
      
      await page.click('[data-testid="nav-payments"]');
      await page.waitForSelector('[data-testid="payment-history"]', { timeout: 10000 });
      console.log('✅ Payments section loaded');
      
      console.log('🎉 All basic tests passed!');
      
    } catch (error) {
      console.log('❌ Login failed or welcome message not found');
      
      // Check for error messages
      try {
        const errorElement = await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
        const errorText = await errorElement.textContent();
        console.log(`🚨 Error message: ${errorText}`);
      } catch (e) {
        console.log('❌ No error message found either');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
}

if (require.main === module) {
  testLogin().catch(console.error);
}

module.exports = testLogin;