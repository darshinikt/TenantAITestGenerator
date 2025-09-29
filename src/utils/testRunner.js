// Multi-framework test runner for Cypress and Playwright

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class MultiFrameworkTestRunner {
  constructor() {
    this.results = {
      cypress: null,
      playwright: null,
      combined: null
    };
  }

  async executeTests(options = {}) {
    const {
      framework = 'both', // 'cypress', 'playwright', 'both'
      testFiles = [],
      parallel = false,
      browser = 'chromium',
      headed = false,
      retries = 1
    } = options;

    console.log(`🚀 Starting test execution with ${framework}...`);

    try {
      if (framework === 'both') {
        if (parallel) {
          await this.runTestsInParallel(testFiles, browser, headed, retries);
        } else {
          await this.runTestsSequentially(testFiles, browser, headed, retries);
        }
      } else if (framework === 'cypress') {
        await this.runCypressTests(testFiles, browser, headed, retries);
      } else if (framework === 'playwright') {
        await this.runPlaywrightTests(testFiles, browser, headed, retries);
      }

      // Generate combined report
      await this.generateCombinedReport();

      return this.results;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  async runTestsInParallel(testFiles, browser, headed, retries) {
    console.log('🔄 Running Cypress and Playwright tests in parallel...');
    
    const cypressPromise = this.runCypressTests(testFiles, browser, headed, retries);
    const playwrightPromise = this.runPlaywrightTests(testFiles, browser, headed, retries);

    const [cypressResult, playwrightResult] = await Promise.allSettled([
      cypressPromise,
      playwrightPromise
    ]);

    this.results.cypress = cypressResult.status === 'fulfilled' ? cypressResult.value : { error: cypressResult.reason };
    this.results.playwright = playwrightResult.status === 'fulfilled' ? playwrightResult.value : { error: playwrightResult.reason };
  }

  async runTestsSequentially(testFiles, browser, headed, retries) {
    console.log('🔄 Running Cypress tests first...');
    this.results.cypress = await this.runCypressTests(testFiles, browser, headed, retries);
    
    console.log('🔄 Running Playwright tests...');
    this.results.playwright = await this.runPlaywrightTests(testFiles, browser, headed, retries);
  }

  async runCypressTests(testFiles, browser, headed, retries) {
    return new Promise((resolve, reject) => {
      const args = ['run'];
      
      if (headed) args.push('--headed');
      if (browser !== 'chromium') args.push('--browser', browser);
      if (testFiles.length > 0) {
        args.push('--spec', testFiles.join(','));
      }
      
      const cypress = spawn('npx', ['cypress', ...args], {
        stdio: 'pipe',
        env: { ...process.env, CYPRESS_RETRIES: retries }
      });

      let output = '';
      let errorOutput = '';

      cypress.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[Cypress] ${data.toString().trim()}`);
      });

      cypress.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[Cypress Error] ${data.toString().trim()}`);
      });

      cypress.on('close', (code) => {
        const result = {
          framework: 'cypress',
          exitCode: code,
          passed: code === 0,
          output,
          errorOutput,
          timestamp: new Date().toISOString()
        };

        if (code === 0) {
          resolve(result);
        } else {
          resolve(result); // Don't reject, just return the result with error info
        }
      });
    });
  }

  async runPlaywrightTests(testFiles, browser, headed, retries) {
    return new Promise((resolve, reject) => {
      const args = ['test'];
      
      if (headed) args.push('--headed');
      if (browser !== 'chromium') args.push('--project', browser);
      if (retries > 0) args.push('--retries', retries.toString());
      if (testFiles.length > 0) {
        args.push(...testFiles);
      }
      
      const playwright = spawn('npx', ['playwright', ...args], {
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      playwright.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[Playwright] ${data.toString().trim()}`);
      });

      playwright.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[Playwright Error] ${data.toString().trim()}`);
      });

      playwright.on('close', (code) => {
        const result = {
          framework: 'playwright',
          exitCode: code,
          passed: code === 0,
          output,
          errorOutput,
          timestamp: new Date().toISOString()
        };

        if (code === 0) {
          resolve(result);
        } else {
          resolve(result); // Don't reject, just return the result with error info
        }
      });
    });
  }

  async generateCombinedReport() {
    const combinedReport = {
      summary: {
        totalFrameworks: 0,
        passedFrameworks: 0,
        failedFrameworks: 0,
        executionTime: new Date().toISOString()
      },
      frameworks: {},
      recommendations: []
    };

    // Process Cypress results
    if (this.results.cypress) {
      combinedReport.frameworks.cypress = this.processCypressResults(this.results.cypress);
      combinedReport.summary.totalFrameworks++;
      if (this.results.cypress.passed) {
        combinedReport.summary.passedFrameworks++;
      } else {
        combinedReport.summary.failedFrameworks++;
      }
    }

    // Process Playwright results
    if (this.results.playwright) {
      combinedReport.frameworks.playwright = this.processPlaywrightResults(this.results.playwright);
      combinedReport.summary.totalFrameworks++;
      if (this.results.playwright.passed) {
        combinedReport.summary.passedFrameworks++;
      } else {
        combinedReport.summary.failedFrameworks++;
      }
    }

    // Generate recommendations
    combinedReport.recommendations = this.generateRecommendations(combinedReport);

    // Save combined report
    const reportPath = path.join(process.cwd(), 'test-results', 'combined-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(combinedReport, null, 2));

    console.log(`📊 Combined report saved to: ${reportPath}`);
    
    this.results.combined = combinedReport;
    return combinedReport;
  }

  processCypressResults(cypressResult) {
    // Parse Cypress output to extract test statistics
    const stats = {
      tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };

    // Extract test counts from output (simplified parsing)
    const output = cypressResult.output || '';
    const testMatches = output.match(/(\d+) passing/);
    if (testMatches) stats.passed = parseInt(testMatches[1]);
    
    const failMatches = output.match(/(\d+) failing/);
    if (failMatches) stats.failed = parseInt(failMatches[1]);
    
    stats.tests = stats.passed + stats.failed + stats.skipped;

    return {
      framework: 'cypress',
      passed: cypressResult.passed,
      stats,
      timestamp: cypressResult.timestamp
    };
  }

  processPlaywrightResults(playwrightResult) {
    // Parse Playwright output to extract test statistics
    const stats = {
      tests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    };

    // Extract test counts from output (simplified parsing)
    const output = playwrightResult.output || '';
    const testMatches = output.match(/(\d+) passed/);
    if (testMatches) stats.passed = parseInt(testMatches[1]);
    
    const failMatches = output.match(/(\d+) failed/);
    if (failMatches) stats.failed = parseInt(failMatches[1]);
    
    stats.tests = stats.passed + stats.failed + stats.skipped;

    return {
      framework: 'playwright',
      passed: playwrightResult.passed,
      stats,
      timestamp: playwrightResult.timestamp
    };
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Check if both frameworks passed/failed consistently
    const cypressPassed = report.frameworks.cypress?.passed;
    const playwrightPassed = report.frameworks.playwright?.passed;

    if (cypressPassed && playwrightPassed) {
      recommendations.push('✅ Both frameworks passed - Tests are robust across different automation tools');
    } else if (!cypressPassed && !playwrightPassed) {
      recommendations.push('❌ Both frameworks failed - Check application functionality and test environment');
    } else if (cypressPassed && !playwrightPassed) {
      recommendations.push('⚠️ Cypress passed but Playwright failed - Check browser compatibility and timing issues');
    } else if (!cypressPassed && playwrightPassed) {
      recommendations.push('⚠️ Playwright passed but Cypress failed - Check Cypress-specific configurations and selectors');
    }

    // Add performance recommendations
    const cypressStats = report.frameworks.cypress?.stats;
    const playwrightStats = report.frameworks.playwright?.stats;

    if (cypressStats && playwrightStats) {
      if (cypressStats.tests > 0 && playwrightStats.tests > 0) {
        recommendations.push('📊 Consider using both frameworks for comprehensive test coverage');
        recommendations.push('🔄 Run tests in parallel to reduce overall execution time');
      }
    }

    return recommendations;
  }

  async getTestSummary() {
    return {
      cypress: this.results.cypress ? {
        passed: this.results.cypress.passed,
        timestamp: this.results.cypress.timestamp
      } : null,
      playwright: this.results.playwright ? {
        passed: this.results.playwright.passed,
        timestamp: this.results.playwright.timestamp
      } : null,
      combined: this.results.combined ? {
        totalFrameworks: this.results.combined.summary.totalFrameworks,
        passedFrameworks: this.results.combined.summary.passedFrameworks,
        failedFrameworks: this.results.combined.summary.failedFrameworks
      } : null
    };
  }
}

module.exports = MultiFrameworkTestRunner;