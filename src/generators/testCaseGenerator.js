// Enhanced test case generator supporting both Cypress and Playwright

require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class TenantTestGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateTestCases(options = {}) {
    const {
      scenario = 'login',
      framework = 'both', // 'cypress', 'playwright', 'both'
      complexity = 'intermediate',
      includeNegativeTests = true,
      includeAccessibilityTests = false,
      includePerformanceTests = false
    } = options;

    console.log(`🤖 Generating ${framework} tests for ${scenario} scenario...`);

    const prompt = this.buildPrompt(scenario, framework, complexity, {
      includeNegativeTests,
      includeAccessibilityTests,
      includePerformanceTests
    });

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert test automation engineer specializing in tenant management systems. 
            Generate comprehensive, production-ready test cases using modern testing practices.
            Always include proper error handling, assertions, and test data management.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const generatedTests = response.choices[0].message.content;
      
      // Save tests to appropriate directories
      await this.saveGeneratedTests(generatedTests, scenario, framework);
      
      return {
        scenario,
        framework,
        testCount: this.countTests(generatedTests),
        content: generatedTests,
        saved: true
      };

    } catch (error) {
      console.error('❌ Error generating tests:', error);
      throw error;
    }
  }

  buildPrompt(scenario, framework, complexity, options) {
    const basePrompt = `
Generate comprehensive test cases for a tenant management system's ${scenario} functionality.

**Requirements:**
- Framework: ${framework === 'both' ? 'Both Cypress and Playwright' : framework}
- Complexity: ${complexity}
- Include negative tests: ${options.includeNegativeTests}
- Include accessibility tests: ${options.includeAccessibilityTests}
- Include performance tests: ${options.includePerformanceTests}

**Tenant Management System Context:**
This is a real-world property management system where tenants can:
- Login and manage their profile
- Submit and track maintenance requests
- Make rent payments online
- View and download documents (lease, invoices)
- Communicate with property management
- View property announcements and updates

**Test Data to Use:**
- Test tenant: john.doe@email.com / TenantPass123!
- Test admin: admin@propertymanagement.com / AdminPass789!
- Property: Sunset Apartments, 123 Main Street
- Unit: A101 (1BR/1BA, $1200/month)

**Specific ${scenario} Requirements:**
${this.getScenarioRequirements(scenario)}

**Code Style Requirements:**
- Use modern async/await syntax
- Include proper TypeScript types
- Add comprehensive assertions
- Include error handling and retry logic
- Use data-testid selectors for reliability
- Add API mocking/interception
- Include accessibility checks where appropriate
- Add performance timing assertions if requested

Please generate complete, runnable test files with proper setup, teardown, and helper functions.
`;

    return basePrompt;
  }

  getScenarioRequirements(scenario) {
    const requirements = {
      login: `
- Test successful login with valid credentials
- Test login failure with invalid credentials
- Test password reset flow
- Test session management and persistence
- Test logout functionality
- Test form validation
- Test security measures (rate limiting, etc.)`,

      dashboard: `
- Test dashboard loading and data display
- Test navigation between different sections
- Test user profile information display
- Test quick actions and shortcuts
- Test responsive design
- Test data refresh functionality`,

      maintenance: `
- Test viewing existing maintenance requests
- Test creating new maintenance requests with all fields
- Test file upload for photos/documents
- Test editing existing requests
- Test filtering and sorting requests
- Test status updates and notifications
- Test validation of required fields
- Test priority levels and categories`,

      payments: `
- Test viewing payment history
- Test making rent payments
- Test different payment methods (credit card, bank transfer)
- Test payment validation and error handling
- Test receipt generation and download
- Test automatic payment setup
- Test payment reminders and late fees`,

      documents: `
- Test viewing available documents
- Test downloading documents (lease, invoices, etc.)
- Test document search and filtering
- Test document upload by tenants
- Test document versioning
- Test document sharing and permissions`
    };

    return requirements[scenario] || 'Generate appropriate test cases for this scenario.';
  }

  async saveGeneratedTests(content, scenario, framework) {
    try {
      if (framework === 'cypress' || framework === 'both') {
        const cypressFile = path.join(process.cwd(), 'cypress', 'e2e', `generated-${scenario}.cy.ts`);
        const cypressContent = this.extractFrameworkTests(content, 'cypress');
        await fs.writeFile(cypressFile, cypressContent, 'utf8');
        console.log(`✅ Cypress tests saved to: ${cypressFile}`);
      }

      if (framework === 'playwright' || framework === 'both') {
        const playwrightFile = path.join(process.cwd(), 'tests', `generated-${scenario}.spec.ts`);
        const playwrightContent = this.extractFrameworkTests(content, 'playwright');
        await fs.writeFile(playwrightFile, playwrightContent, 'utf8');
        console.log(`✅ Playwright tests saved to: ${playwrightFile}`);
      }
    } catch (error) {
      console.error('❌ Error saving tests:', error);
    }
  }

  extractFrameworkTests(content, framework) {
    // Extract framework-specific tests from generated content
    // This is a simplified implementation - in practice, you'd parse the AI response more carefully
    
    if (framework === 'cypress') {
      const cypressStart = content.indexOf('/// CYPRESS TESTS');
      const cypressEnd = content.indexOf('/// END CYPRESS');
      if (cypressStart !== -1 && cypressEnd !== -1) {
        return content.substring(cypressStart, cypressEnd);
      }
    }
    
    if (framework === 'playwright') {
      const playwrightStart = content.indexOf('/// PLAYWRIGHT TESTS');
      const playwrightEnd = content.indexOf('/// END PLAYWRIGHT');
      if (playwrightStart !== -1 && playwrightEnd !== -1) {
        return content.substring(playwrightStart, playwrightEnd);
      }
    }
    
    // If no specific markers found, return the full content
    return content;
  }

  countTests(content) {
    // Count test cases in the generated content
    const testMatches = content.match(/it\(|test\(/g);
    return testMatches ? testMatches.length : 0;
  }

  async generateAPITests(endpoints = []) {
    console.log('🔧 Generating AI-powered API tests...');
    
    const prompt = `
Generate comprehensive API tests for a tenant management system with these endpoints:
${endpoints.map(ep => `- ${ep.method} ${ep.path}: ${ep.description}${ep.schema ? '\n  Schema: ' + JSON.stringify(ep.schema, null, 2) : ''}`).join('\n')}

Generate tests for BOTH Cypress (using cy.request()) and Playwright (using request API):

**Test Coverage Required:**
1. **CRUD Operations**: Create, Read, Update, Delete for each endpoint
2. **Authentication**: Valid/invalid tokens, expired tokens
3. **Input Validation**: Required fields, data types, boundaries
4. **Error Handling**: 400, 401, 403, 404, 500 responses
5. **Data Integrity**: Verify response schemas and data consistency
6. **Performance**: Response time validation
7. **Security**: SQL injection, XSS prevention tests

**Frameworks:**
- Cypress: Use cy.request() with custom commands (AddTenant, GetTenant, etc.)
- Playwright: Use request context with equivalent test structure

**JSON Schema Validation:**
- Validate response structure against expected schemas
- Support for dynamic fields (IDs, timestamps) that should be ignored
- Nested JSON comparison utilities

**Reusable Patterns:**
- Fixtures for request/response data
- Custom commands for common API operations
- Error response validation helpers
- Authentication token management

Please generate complete, runnable test files with proper setup, fixtures, and utilities.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert API test automation engineer. Generate comprehensive, production-ready API tests using modern testing practices with both Cypress and Playwright.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const apiTests = response.choices[0].message.content;
      
      // Save API tests for both frameworks
      await this.saveAPITests(apiTests, endpoints);
      
      console.log(`✅ API tests generated successfully!`);
      
      return {
        testCount: this.countTests(apiTests),
        content: apiTests,
        endpoints: endpoints.length,
        frameworks: ['cypress', 'playwright'],
        saved: true
      };
    } catch (error) {
      console.error('❌ Error generating API tests:', error);
      throw error;
    }
  }

  async saveAPITests(content, endpoints) {
    try {
      // Create API test directories
      const cypressApiDir = path.join(process.cwd(), 'cypress', 'e2e', 'api');
      const playwrightApiDir = path.join(process.cwd(), 'tests', 'api');
      
      await fs.mkdir(cypressApiDir, { recursive: true });
      await fs.mkdir(playwrightApiDir, { recursive: true });
      
      // Extract and save Cypress API tests
      const cypressContent = this.extractFrameworkTests(content, 'cypress') || content;
      const cypressFile = path.join(cypressApiDir, 'tenant-api.cy.ts');
      await fs.writeFile(cypressFile, cypressContent, 'utf8');
      console.log(`✅ Cypress API tests saved to: ${cypressFile}`);
      
      // Extract and save Playwright API tests
      const playwrightContent = this.extractFrameworkTests(content, 'playwright') || content;
      const playwrightFile = path.join(playwrightApiDir, 'tenant-api.spec.ts');
      await fs.writeFile(playwrightFile, playwrightContent, 'utf8');
      console.log(`✅ Playwright API tests saved to: ${playwrightFile}`);
      
      // Save API schemas and fixtures
      await this.saveAPIFixtures(endpoints);
      
    } catch (error) {
      console.error('❌ Error saving API tests:', error);
    }
  }

  async saveAPIFixtures(endpoints) {
    const fixturesDir = path.join(process.cwd(), 'cypress', 'fixtures', 'api');
    await fs.mkdir(fixturesDir, { recursive: true });
    
    // Create fixtures for each endpoint
    for (const endpoint of endpoints) {
      const fixtureName = endpoint.path.replace(/[\/{}]/g, '_').replace(/^_|_$/g, '');
      const fixture = {
        endpoint: endpoint,
        request: endpoint.requestExample || {},
        response: endpoint.responseExample || {},
        schema: endpoint.schema || {}
      };
      
      const fixtureFile = path.join(fixturesDir, `${fixtureName}.json`);
      await fs.writeFile(fixtureFile, JSON.stringify(fixture, null, 2), 'utf8');
    }
    
    console.log(`✅ API fixtures saved to: ${fixturesDir}`);
  }

  async generateFromSchema(schema, operation = 'CRUD') {
    console.log('📋 Generating API tests from JSON schema...');
    
    const prompt = `
Analyze this JSON schema and generate comprehensive API tests:

Schema: ${JSON.stringify(schema, null, 2)}

Generate ${operation} operation tests for both Cypress and Playwright:

1. **Create Tests**: POST with valid/invalid data
2. **Read Tests**: GET with various query parameters
3. **Update Tests**: PUT/PATCH with partial/full updates
4. **Delete Tests**: DELETE with validation

Include:
- Schema validation for responses
- Error handling for malformed requests
- Boundary testing for fields
- Security testing for injection attacks
- Performance benchmarks

Focus on the tenant management domain with realistic test scenarios.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: 'Generate API tests from JSON schema with focus on comprehensive coverage.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3500
      });

      const schemaTests = response.choices[0].message.content;
      
      // Save schema-based tests
      const schemaTestFile = path.join(process.cwd(), 'tests', 'api', 'schema-generated.spec.ts');
      await fs.mkdir(path.dirname(schemaTestFile), { recursive: true });
      await fs.writeFile(schemaTestFile, schemaTests, 'utf8');
      
      console.log(`✅ Schema-based tests saved to: ${schemaTestFile}`);
      
      return {
        testCount: this.countTests(schemaTests),
        content: schemaTests,
        schema: schema,
        operation: operation,
        saved: true
      };
    } catch (error) {
      console.error('❌ Error generating schema tests:', error);
      throw error;
    }
  }

  async analyzeResults(resultsPath) {
    try {
      const results = await fs.readFile(resultsPath, 'utf8');
      const resultsData = JSON.parse(results);
      
      const prompt = `
Analyze these test results and provide insights:

${JSON.stringify(resultsData, null, 2)}

Provide:
1. Summary of test execution
2. Failure analysis with root causes
3. Recommendations for improvement
4. Suggestions for additional test coverage
5. Performance insights if available
`;

      const response = await this.openai.chat.completions.create({
        model: process.env.AI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a test analysis expert. Provide actionable insights from test results.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      return {
        summary: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
        resultsAnalyzed: resultsPath
      };
    } catch (error) {
      console.error('❌ Error analyzing results:', error);
      throw error;
    }
  }
}

module.exports = TenantTestGenerator;