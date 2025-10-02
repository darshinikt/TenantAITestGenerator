#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

// Function to check if server is running
function checkServer(url, retries = 10) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running');
          resolve(true);
        } else {
          if (retries > 0) {
            console.log(`⏳ Server not ready, retrying... (${retries} attempts left)`);
            setTimeout(attempt, 1000);
            retries--;
          } else {
            reject(new Error('Server not responding'));
          }
        }
      }).on('error', (err) => {
        if (retries > 0) {
          console.log(`⏳ Server not ready, retrying... (${retries} attempts left)`);
          setTimeout(attempt, 1000);
          retries--;
        } else {
          reject(err);
        }
      });
    };
    attempt();
  });
}

// Function to run tests
async function runTests() {
  try {
    console.log('🔍 Checking server status...');
    await checkServer('http://localhost:3000');
    
    console.log('🚀 Running Cypress tests...');
    const cypress = spawn('npx', ['cypress', 'run', '--spec', 'cypress/e2e/auth.cy.ts', '--headless'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    cypress.on('close', (code) => {
      console.log(`\n📊 Cypress tests finished with code: ${code}`);
      
      if (code === 0) {
        console.log('✅ All tests passed!');
      } else {
        console.log('❌ Some tests failed');
      }
      
      // Run Playwright tests
      console.log('\n🚀 Running Playwright tests...');
      const playwright = spawn('npx', ['playwright', 'test', 'tests/example.spec.ts', '--project=chromium', '--reporter=line'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      playwright.on('close', (code) => {
        console.log(`\n📊 Playwright tests finished with code: ${code}`);
        if (code === 0) {
          console.log('✅ All Playwright tests passed!');
        } else {
          console.log('❌ Some Playwright tests failed');
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Please make sure the server is running on http://localhost:3000');
    process.exit(1);
  }
}

runTests();