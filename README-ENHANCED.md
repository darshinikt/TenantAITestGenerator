# AI Test Case Generator for Tenants 🤖🏠

A comprehensive test automation system that generates intelligent test cases for tenant management systems using AI and executes them with **both Cypress and Playwright** frameworks.

## 🌟 Enhanced Features

- **🔄 Dual Framework Support**: Run tests on both Cypress and Playwright
- **🤖 AI-Powered Test Generation**: Automatically generates test cases based on tenant scenarios
- **🚀 Parallel Execution**: Run both frameworks simultaneously for faster feedback
- **📊 Unified Reporting**: Combined test reports from both frameworks
- **🎯 Real-World Scenarios**: Complete tenant management system test coverage
- **🔧 MCP Protocol Support**: Model Context Protocol integration for AI assistants
- **📈 Smart Analytics**: AI-powered test result analysis and recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- OpenAI API key (for AI test generation)
- GitHub Personal Access Token (for repository integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/darshinikt/TenantAITestGenerator.git
cd TenantAITestGenerator

# Install all dependencies (including Cypress and Playwright)
npm run setup

# Copy environment file and add your API keys
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and GITHUB_TOKEN
```

### Environment Configuration

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
GITHUB_TOKEN=your_github_personal_access_token
TENANT_PORTAL_URL=https://your-tenant-portal.com
DEFAULT_BROWSER=chromium
```

## 🧪 Running Tests

### Single Framework

```bash
# Cypress only
npm run test:cypress
npm run test:cypress:open    # Interactive mode

# Playwright only  
npm run test:playwright
npm run test:playwright:headed    # Headed mode
npm run test:playwright:ui         # UI mode
```

### Multi-Framework

```bash
# Run both frameworks in parallel
npm run test:parallel

# Run both frameworks sequentially
npm run test:both

# Default (runs Playwright)
npm test
```

### AI Test Generation

```bash
# Generate tests for specific scenarios
npm run generate:cypress        # Cypress-specific tests
npm run generate:playwright     # Playwright-specific tests
npm run generate                # Both frameworks
```

## 🏗️ Project Structure

```
TenantAITestGenerator/
├── cypress/                    # Cypress test framework
│   ├── e2e/                   # End-to-end tests
│   ├── fixtures/              # Test data
│   └── support/               # Custom commands & setup
├── tests/                     # Playwright tests
│   ├── auth.spec.ts          # Authentication tests
│   ├── maintenance.spec.ts   # Maintenance request tests
│   └── api/                  # API tests
├── src/
│   ├── shared/               # Shared utilities for both frameworks
│   │   ├── testData.ts       # Common test data
│   │   └── pageObjects.ts    # Framework-agnostic page objects
│   ├── generators/           # AI test generators
│   │   └── testCaseGenerator.js
│   └── utils/
│       └── testRunner.js     # Multi-framework test runner
├── .github/workflows/        # CI/CD for both frameworks
├── playwright.config.ts      # Playwright configuration
├── cypress.config.ts         # Cypress configuration
└── package.json              # Enhanced scripts for both frameworks
```

## 🎯 Test Scenarios Covered

### 🔐 Authentication & Authorization
- **Login/logout workflows** (both frameworks)
- **Password reset functionality**  
- **Session management and persistence**
- **Multi-factor authentication**
- **Form validation and security**

### 🏠 Tenant Dashboard
- **Property information display**
- **Navigation and user interface**
- **Data loading and refresh**
- **Responsive design testing**
- **Quick actions and shortcuts**

### 🔧 Maintenance Requests
- **Create, edit, and track requests**
- **File upload functionality**
- **Priority levels and categories**
- **Status updates and notifications**
- **Filtering and search capabilities**

### 💳 Payment Processing
- **Rent payment workflows**
- **Multiple payment methods**
- **Payment history and receipts**
- **Automatic payment setup**
- **Error handling and validation**

### 📄 Document Management
- **Document viewing and downloading**
- **Upload functionality**
- **Search and filtering**
- **Version control and permissions**

## 🤖 AI Test Generation Features

### Smart Test Creation
```javascript
// Generate comprehensive test suites
const generator = new TenantTestGenerator();

await generator.generateTestCases({
  scenario: 'maintenance',
  framework: 'both',           // cypress, playwright, or both
  complexity: 'comprehensive',
  includeNegativeTests: true,
  includeAccessibilityTests: true,
  includePerformanceTests: true
});
```

### Supported Scenarios
- `login` - Authentication and session management
- `dashboard` - Main tenant dashboard functionality  
- `maintenance` - Maintenance request workflows
- `payments` - Payment processing and history
- `documents` - Document management features

## 📊 Reporting & Analytics

### Combined Reports
- **Unified test results** from both frameworks
- **Cross-framework comparison** and recommendations
- **Performance metrics** and timing analysis
- **AI-powered insights** and suggestions

### Report Generation
```bash
# Generate combined reports
npm run reports

# View reports
open playwright-report/index.html    # Playwright report
open cypress/reports/index.html      # Cypress report
open test-results/combined-report.json  # Combined analysis
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow that:

- **Runs Cypress tests** across multiple Node.js versions
- **Runs Playwright tests** in parallel  
- **Executes both frameworks** simultaneously
- **Generates combined reports** with AI analysis
- **Uploads artifacts** for debugging and review

### Workflow Jobs
1. `test-cypress` - Dedicated Cypress test execution
2. `test-playwright` - Dedicated Playwright test execution  
3. `test-parallel` - Combined execution and reporting

## 🛠️ Advanced Configuration

### Framework Selection
```javascript
// Run specific framework
const runner = new MultiFrameworkTestRunner();

await runner.executeTests({
  framework: 'both',     // 'cypress', 'playwright', 'both'
  parallel: true,        // Run frameworks in parallel
  browser: 'chromium',   // Browser selection
  headed: false,         // Headless vs headed
  retries: 2            // Retry failed tests
});
```

### Custom Test Data
```javascript
// Shared test data works with both frameworks
import { testUsers, selectors } from './src/shared/testData';

// Use in Cypress
cy.get(selectors.login.emailInput).type(testUsers.tenant1.email);

// Use in Playwright  
await page.fill(selectors.login.emailInput, testUsers.tenant1.email);
```

## 🚀 Best Practices

### 1. **Framework-Agnostic Design**
- Shared selectors and test data
- Common page object patterns
- Unified error handling

### 2. **Comprehensive Coverage**
- Positive and negative test cases
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance

### 3. **Reliable Test Execution**
- Retry mechanisms for flaky tests
- Proper wait strategies
- API mocking and interception
- Environment-specific configurations

### 4. **Maintenance & Scalability**
- Modular test architecture
- AI-assisted test maintenance
- Continuous improvement through analytics
- Version-controlled test data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for both Cypress and Playwright
4. Ensure all tests pass (`npm run test:both`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📈 Performance & Scaling

- **Parallel execution** reduces test time by ~50%
- **Smart test generation** creates optimal coverage
- **Cross-framework validation** ensures robustness
- **AI-powered insights** improve test maintenance

## 🔗 Links & Resources

- **Repository**: https://github.com/darshinikt/TenantAITestGenerator
- **Cypress Documentation**: https://docs.cypress.io
- **Playwright Documentation**: https://playwright.dev
- **OpenAI API**: https://platform.openai.com/docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the tenant management community**

*Combining the power of AI, Cypress, and Playwright for comprehensive test automation*