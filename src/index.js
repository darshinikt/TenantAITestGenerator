#!/usr/bin/env node

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const TestCaseGenerator = require('./generators/testCaseGenerator');
const TestRunner = require('./utils/testRunner');

class AITestGeneratorMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'ai-test-case-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.testGenerator = new TestCaseGenerator();
    this.testRunner = new TestRunner();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_tenant_tests',
            description: 'Generate AI-powered test cases for tenant scenarios',
            inputSchema: {
              type: 'object',
              properties: {
                scenario: {
                  type: 'string',
                  enum: ['login', 'dashboard', 'maintenance', 'payments', 'documents'],
                  description: 'Type of tenant scenario to test',
                },
                complexity: {
                  type: 'string',
                  enum: ['basic', 'intermediate', 'comprehensive'],
                  default: 'intermediate',
                },
                includeNegativeTests: {
                  type: 'boolean',
                  default: true,
                },
              },
              required: ['scenario'],
            },
          },
          {
            name: 'run_generated_tests',
            description: 'Execute the generated test cases with Playwright',
            inputSchema: {
              type: 'object',
              properties: {
                testFile: {
                  type: 'string',
                  description: 'Path to the test file to execute',
                },
                browser: {
                  type: 'string',
                  enum: ['chromium', 'firefox', 'webkit', 'all'],
                  default: 'chromium',
                },
                headed: {
                  type: 'boolean',
                  default: false,
                },
              },
              required: ['testFile'],
            },
          },
          {
            name: 'analyze_test_results',
            description: 'Analyze test results and provide AI insights',
            inputSchema: {
              type: 'object',
              properties: {
                resultsPath: {
                  type: 'string',
                  description: 'Path to test results file',
                },
              },
              required: ['resultsPath'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_tenant_tests':
            return await this.generateTenantTests(args);
          case 'run_generated_tests':
            return await this.runGeneratedTests(args);
          case 'analyze_test_results':
            return await this.analyzeTestResults(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async generateTenantTests(args) {
    const { scenario, complexity, includeNegativeTests } = args;
    
    const testCases = await this.testGenerator.generateTestCases({
      scenario,
      complexity,
      includeNegativeTests,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Generated ${testCases.length} test cases for ${scenario} scenario with ${complexity} complexity`,
        },
      ],
    };
  }

  async runGeneratedTests(args) {
    const { testFile, browser, headed } = args;
    
    const results = await this.testRunner.executeTests({
      testFile,
      browser,
      headed,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Test execution completed. Passed: ${results.passed}, Failed: ${results.failed}`,
        },
      ],
    };
  }

  async analyzeTestResults(args) {
    const { resultsPath } = args;
    
    const analysis = await this.testGenerator.analyzeResults(resultsPath);

    return {
      content: [
        {
          type: 'text',
          text: `Test analysis: ${analysis.summary}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Test Case Generator MCP server running on stdio');
  }
}

const server = new AITestGeneratorMCP();
server.run().catch(console.error);
