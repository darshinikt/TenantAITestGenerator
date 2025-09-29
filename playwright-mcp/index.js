#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { chromium, firefox, webkit } = require('playwright');

class PlaywrightMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'playwright-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'playwright_navigate',
            description: 'Navigate to a URL using Playwright',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to navigate to',
                },
                browser: {
                  type: 'string',
                  enum: ['chromium', 'firefox', 'webkit'],
                  description: 'Browser to use',
                  default: 'chromium',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'playwright_screenshot',
            description: 'Take a screenshot of the current page',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path to save the screenshot',
                },
                fullPage: {
                  type: 'boolean',
                  description: 'Whether to take a full page screenshot',
                  default: false,
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'playwright_navigate':
            return await this.navigate(args.url, args.browser || 'chromium');
          case 'playwright_screenshot':
            return await this.screenshot(args.path, args.fullPage);
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

  async navigate(url, browserType) {
    const browser = await this.getBrowser(browserType);
    const page = await browser.newPage();
    await page.goto(url);
    
    const title = await page.title();
    await browser.close();

    return {
      content: [
        {
          type: 'text',
          text: `Navigated to ${url}. Page title: ${title}`,
        },
      ],
    };
  }

  async screenshot(path, fullPage = false) {
    // This would need to be implemented with an active browser instance
    return {
      content: [
        {
          type: 'text',
          text: `Screenshot functionality needs active browser instance`,
        },
      ],
    };
  }

  async getBrowser(browserType) {
    switch (browserType) {
      case 'firefox':
        return await firefox.launch();
      case 'webkit':
        return await webkit.launch();
      default:
        return await chromium.launch();
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Playwright MCP server running on stdio');
  }
}

const server = new PlaywrightMCPServer();
server.run().catch(console.error);
