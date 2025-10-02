# Tenant Management Portal with AI-Powered Testing 🏠🤖

A complete full-stack tenant management portal with comprehensive E2E testing using Cypress and Playwright, featuring AI-powered test generation and real-time test execution.

## 🌟 Features

### 🖥️ **Full-Stack Web Application**
- **Express.js Backend**: RESTful API with SQLite database
- **Responsive Frontend**: Bootstrap 5 UI with modern JavaScript
- **Authentication System**: JWT-based login/logout with session management
- **Maintenance Requests**: Full CRUD operations for tenant maintenance
- **Payment Management**: Payment history and processing interface
- **Document Management**: File upload and document storage
- **Real-time Dashboard**: Live data updates and notifications

### 🧪 **Comprehensive Testing Suite**
- **Cypress E2E Tests**: 15 tests covering full user workflows (100% passing)
- **Playwright API Tests**: Backend API validation and integration testing
- **Dual Framework Support**: Both Cypress and Playwright for maximum coverage
- **Real-time Test Execution**: Live test monitoring with visual feedback
- **Cross-browser Testing**: Chrome, Firefox, Safari compatibility
- **AI-Generated Test Cases**: Intelligent test scenario creation

### 🤖 **AI-Powered Test Generation**
- **Smart Test Creation**: AI generates comprehensive test scenarios
- **Boundary Testing**: Automatic edge case detection and testing
- **Assertion Generation**: Intelligent validation point creation
- **Test Maintenance**: AI-assisted test updates and optimization

## 🚀 Quick Start

> **⚡ Super Quick**: Just run `npm run demo` and you're ready to test!  
> **📖 Full Guide**: See [QUICK-START.md](QUICK-START.md) for all commands

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/darshinikt/TenantAITestGenerator.git
cd TenantAITestGenerator

# Install dependencies
npm install

# Install Playwright browsers (optional)
npx playwright install
```

### 🎯 One-Command Demo

```bash
# Start server + open Cypress in one command
npm run demo
```

This automatically:
- ✅ Starts the backend server
- ✅ Waits for server to be ready
- ✅ Opens Cypress Test Runner
- ✅ Ready to run any test with one click!

### Running Tests

```bash
# 🎯 EASIEST - Start server + open Cypress in one command
npm run demo

# ⚡ Quick automated test run
npm run test:quick

# 🔥 Run all tests automatically
npm run run:tests

# 🎮 Interactive Cypress (manual control)
npm run run:cypress
```

### Manual Commands (if needed)

```bash
# Start server only
npm start

# Run Cypress tests (server must be running)
npx cypress open
npx cypress run

# Run Playwright tests
npx playwright test
```

## 🏗️ Project Structure

```
TenantAITestGenerator/
├── 📁 cypress/                    # Cypress E2E tests
│   ├── e2e/
│   │   ├── auth.cy.ts             # Authentication tests (7 tests)
│   │   ├── maintenance.cy.ts      # Maintenance request tests (8 tests)
│   │   └── api/                   # API testing suite
│   └── support/                   # Test configuration
├── 📁 tests/                      # Playwright tests
│   ├── api/                       # API integration tests
│   └── example.spec.ts            # Sample Playwright tests
├── 📁 public/                     # Frontend application
│   ├── index.html                 # Main application UI
│   └── app.js                     # Client-side JavaScript
├── 📁 src/                        # AI test generation
│   └── index.js                   # MCP server entry point
├── 📁 playwright-mcp/             # MCP integration
├── simple-server.js               # Express.js backend server
├── package.json                   # Dependencies and scripts
├── cypress.config.ts              # Cypress configuration
├── playwright.config.ts           # Playwright configuration
└── README.md                      # This file
```

## 🎯 Demo Credentials

Use these credentials to test the application:

```
Email: john.doe@email.com
Password: TenantPass123!
```

## 📊 Test Coverage

### ✅ E2E Tests (15/15 passing - 100%)

#### Authentication Tests (7 tests)
- ✅ Login page display and validation
- ✅ Valid credential authentication
- ✅ Invalid credential error handling
- ✅ Email format validation
- ✅ Required field validation
- ✅ Logout functionality
- ✅ Session persistence

#### Maintenance Request Tests (8 tests)
- ✅ Maintenance page display
- ✅ Request table functionality
- ✅ New request creation
- ✅ Form validation
- ✅ Priority selection
- ✅ Category selection
- ✅ Modal interactions
- ✅ Form submission workflows

### 🔧 API Tests
- ✅ Authentication endpoints
- ✅ CRUD operations
- ✅ Error handling
- ⚠️ Advanced features (rate limiting, etc.)

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout

### Maintenance Requests
- `GET /maintenance` - Get all maintenance requests
- `POST /maintenance` - Create new maintenance request

### Other Endpoints
- `GET /payments` - Payment history
- `GET /documents` - Document management
- `GET /` - Serve main application

## 🧪 Running Different Test Scenarios

### 🎯 **EASIEST - One Command Demo (RECOMMENDED)**
```bash
npm run demo
```
- Starts server automatically
- Opens Cypress Test Runner
- Ready to click and run any test
- Perfect for demonstrations

### ⚡ **Quick Automated Testing**
```bash
# Run quick auth tests
npm run test:quick

# Run all E2E tests automatically
npm run run:tests
```

### 🎮 **Interactive Testing**
```bash
# Start server + Cypress (manual control)
npm run run:cypress

# Select E2E Testing
# Choose your browser
# Run tests and watch them execute live
```

### 📱 **Manual Browser Testing**
```bash
# Start server
npm start

# Open browser: http://localhost:3000
# Login: john.doe@email.com / TenantPass123!
```

## � Configuration

### Environment Setup
```bash
# Database will be created automatically
# No additional configuration required for basic usage
```

### Cypress Configuration
- Browser: Chrome, Firefox, Edge, Electron
- Viewport: 1280x720 (configurable)
- Video: Recorded on failures
- Screenshots: Automatic on failures

### Playwright Configuration
- Browsers: Chromium, Firefox, WebKit
- Parallel execution: Enabled
- Retries: 3 attempts on failure

## 🚀 Development Workflow

### Adding New Tests

#### Cypress E2E Test
```javascript
describe('New Feature', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Login and setup
  });

  it('should test new functionality', () => {
    // Test implementation
  });
});
```

#### Playwright API Test
```javascript
test('API endpoint test', async ({ request }) => {
  const response = await request.post('/api/endpoint', {
    data: { test: 'data' }
  });
  expect(response.status()).toBe(200);
});
```

### Database Schema

The application uses SQLite with the following tables:
- `users` - User authentication and profile data
- `maintenance_requests` - Maintenance request tracking
- `payments` - Payment history and records
- `documents` - Document storage metadata

## 📈 Performance Metrics

- **Test Execution Time**: ~20 seconds for full E2E suite
- **Server Response Time**: <100ms for most endpoints
- **Database Operations**: <50ms average query time
- **Frontend Load Time**: <2 seconds initial load

## 🔍 Debugging Tests

### Cypress Debugging
```bash
# Run with debug mode
DEBUG=cypress:* npx cypress run

# Open developer tools in Cypress
# Use cy.debug() in test code
# Take screenshots with cy.screenshot()
```

### Playwright Debugging
```bash
# Run with debug mode
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes (`git commit -m 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Open a Pull Request

## 📋 Future Enhancements

- [ ] **Advanced API Testing**: Complete CRUD operations for all entities
- [ ] **Visual Regression Testing**: Screenshot comparison testing
- [ ] **Performance Testing**: Load testing and performance benchmarks
- [ ] **Mobile Testing**: Responsive design validation
- [ ] **Accessibility Testing**: WCAG compliance validation
- [ ] **Integration Testing**: External service integration
- [ ] **Docker Support**: Containerized deployment
- [ ] **CI/CD Pipeline**: Automated testing in GitHub Actions

## � Test Results Dashboard

The project generates comprehensive test reports including:
- Execution summaries with pass/fail rates
- Performance metrics and timing data
- Cross-browser compatibility results
- Error logs and debugging information
- Video recordings of test failures

## 🛠️ Troubleshooting

### Common Issues

**Quick Solution - Use Easy Commands:**
```bash
# Kill any running processes and start fresh
npm run demo
```

**Server not starting:**
```bash
# Check if port 3000 is available
lsof -ti:3000

# Kill process if needed
kill -9 $(lsof -ti:3000)

# Restart with easy command
npm run demo
```

**Tests failing:**
```bash
# Clear Cypress cache
npx cypress cache clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try easy demo command
npm run demo
```

**Browser issues:**
```bash
# Reinstall browsers
npx playwright install
npx cypress install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cypress**: Excellent E2E testing framework
- **Playwright**: Powerful browser automation
- **Express.js**: Fast web framework for Node.js
- **Bootstrap**: Responsive UI framework
- **SQLite**: Lightweight database solution

## 📞 Support

For questions or support:
- 📧 Email: darshini1101@gmail.com
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Review test examples in `/cypress/e2e/` and `/tests/`

---

**Made with ❤️ for comprehensive tenant management and testing**

*Created by: Darshini Karroo Tourmentin*  
*Email: darshini1101@gmail.com*  
*Last updated: September 30, 2025*
