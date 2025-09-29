# AI Test Case Generator for Tenants 🤖🏠

An intelligent test automation system that generates comprehensive test cases for tenant management systems using AI and executes them with Playwright.

## 🌟 Features

- **AI-Powered Test Generation**: Automatically generates test cases based on tenant scenarios
- **Playwright Integration**: Executes tests across multiple browsers (Chrome, Firefox, Safari)
- **Tenant-Focused**: Specialized for property management and tenant portal testing
- **MCP Protocol Support**: Model Context Protocol integration for AI assistants
- **Real-time Test Execution**: Live test monitoring and reporting
- **Smart Assertions**: AI-generated validation points for comprehensive testing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI test generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-test-case-generator.git
cd ai-test-case-generator

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Configuration

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
TENANT_PORTAL_URL=https://your-tenant-portal.com
DEFAULT_BROWSER=chromium
```

### Usage

```bash
# Generate AI test cases
npm run generate

# Run tests in headless mode
npm test

# Run tests with browser UI
npm run test:headed

# Run tests with Playwright UI
npm run test:ui

# Start the MCP server
npm start
```

## 🧪 Test Categories

### Tenant Authentication
- Login/logout workflows
- Password reset functionality
- Multi-factor authentication
- Session management

### Tenant Dashboard
- Property information display
- Maintenance request submission
- Payment processing
- Document management

### Property Management
- Lease agreement viewing
- Rent payment history
- Maintenance tracking
- Communication portal

### Administrative Functions
- Tenant onboarding
- Lease renewals
- Property inspections
- Reporting and analytics

## 📁 Project Structure

```
ai-test-case-generator/
├── src/
│   ├── generators/
│   │   ├── testCaseGenerator.js    # AI test case generation
│   │   ├── scenarioBuilder.js      # Test scenario construction
│   │   └── assertionGenerator.js   # Smart assertion creation
│   ├── tests/
│   │   ├── tenant/                 # Tenant-focused tests
│   │   ├── admin/                  # Administrative tests
│   │   └── integration/            # End-to-end scenarios
│   ├── utils/
│   │   ├── aiClient.js            # OpenAI integration
│   │   ├── testHelper.js          # Test utilities
│   │   └── dataGenerator.js       # Test data creation
│   ├── config/
│   │   ├── playwright.config.js   # Playwright configuration
│   │   └── testConfig.js          # Test environment setup
│   └── index.js                   # MCP server entry point
├── docs/                          # Documentation
├── examples/                      # Example test cases
├── .github/                       # GitHub workflows
└── README.md
```

## 🤖 AI Test Generation

The system uses OpenAI's GPT models to generate intelligent test cases:

```javascript
// Example: Generate tenant login tests
const testCases = await generateTestCases({
  scenario: 'tenant_login',
  complexity: 'comprehensive',
  browsers: ['chromium', 'firefox'],
  assertions: 'smart'
});
```

## 🔧 Configuration Options

### Test Generation Settings

```javascript
{
  "aiModel": "gpt-4",
  "testComplexity": "comprehensive",
  "includeBoundaryTests": true,
  "generateNegativeTests": true,
  "smartAssertions": true,
  "crossBrowserTesting": true
}
```

### Playwright Settings

```javascript
{
  "browsers": ["chromium", "firefox", "webkit"],
  "headless": false,
  "screenshot": "on-failure",
  "video": "retain-on-failure",
  "trace": "on-first-retry"
}
```

## 📊 Test Reports

Generated test reports include:

- **Execution Summary**: Pass/fail rates, execution time
- **AI Insights**: Test case quality analysis
- **Coverage Metrics**: Feature coverage assessment
- **Performance Data**: Load time and responsiveness metrics
- **Cross-Browser Results**: Compatibility testing results

## 🔌 MCP Integration

The project supports Model Context Protocol for seamless AI assistant integration:

```json
{
  "servers": {
    "ai-test-generator": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "/path/to/ai-test-case-generator"
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Visual regression testing
- [ ] API testing integration
- [ ] Mobile responsiveness tests
- [ ] Accessibility testing
- [ ] Performance benchmarking
- [ ] CI/CD pipeline integration
- [ ] Docker containerization
- [ ] Cloud testing platform support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@aitestgenerator.com
- 💬 Discord: [Join our community](https://discord.gg/aitestgen)
- 📖 Documentation: [docs.aitestgenerator.com](https://docs.aitestgenerator.com)

## 🙏 Acknowledgments

- OpenAI for GPT model access
- Playwright team for excellent testing framework
- Model Context Protocol contributors
- Open source community

---

Made with ❤️ by the AI Test Generator Team
