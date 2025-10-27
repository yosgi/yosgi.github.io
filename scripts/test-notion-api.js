#!/usr/bin/env node

/**
 * Notion API Connection Test Script
 * Used to verify Notion Integration setup is correct
 */

// Load environment variables
require('dotenv').config();

const https = require('https');

const CONFIG = {
  notionApiKey: process.env.NOTION_API_KEY,
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
};

class NotionAPITester {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async testConnection() {
    console.log('Testing Notion API connection...');
    
    try {
      // Test basic connection
      await this.testBasicConnection();
      
      // Test database access
      await this.testDatabaseAccess();
      
      // Test page query
      await this.testPageQuery();
      
      console.log('All tests passed! Notion API configuration is correct');
      
    } catch (error) {
      console.error('Test failed:', error.message);
      this.printTroubleshootingTips(error);
    }
  }

  async testBasicConnection() {
    console.log('Testing basic API connection...');
    
    const response = await this.makeRequest('/users/me');
    console.log(`API connection successful, user: ${response.name || 'Unknown'}`);
  }

  async testDatabaseAccess() {
    console.log('Testing database access...');
    
    const response = await this.makeRequest(`/databases/${CONFIG.notionDatabaseId}`);
    console.log(`Database access successful: ${response.title?.[0]?.plain_text || 'Unknown'}`);
    
    // Check database properties
    const properties = response.properties;
    const requiredProperties = ['Title', 'Status', 'Date'];
    const missingProperties = requiredProperties.filter(prop => !properties[prop]);
    
    if (missingProperties.length > 0) {
      console.warn(`Missing required properties: ${missingProperties.join(', ')}`);
    } else {
      console.log('Database properties check passed');
    }
  }

  async testPageQuery() {
    console.log('Testing page query...');
    
    const response = await this.makeRequest(`/databases/${CONFIG.notionDatabaseId}/query`, {
      method: 'POST',
      body: {
        page_size: 5
      }
    });
    
    console.log(`Page query successful, found ${response.results.length} pages`);
    
    if (response.results.length > 0) {
      const firstPage = response.results[0];
      console.log(`Sample page: ${this.getPageTitle(firstPage)}`);
    }
  }

  makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `https://api.notion.com/v1${endpoint}`;
      
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      };
      
      const req = https.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`API error ${res.statusCode}: ${result.message || 'Unknown error'}`));
            } else {
              resolve(result);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      
      req.end();
    });
  }

  getPageTitle(page) {
    const titleProperty = page.properties.Title || page.properties.title;
    return titleProperty?.title?.[0]?.plain_text || 'Untitled';
  }

  printTroubleshootingTips(error) {
    console.log('\nTroubleshooting suggestions:');
    
    if (error.message.includes('401')) {
      console.log('1. Check if NOTION_API_KEY is correct');
      console.log('2. Ensure API key starts with "ntn_"');
      console.log('3. Verify API key is activated');
    }
    
    if (error.message.includes('404')) {
      console.log('1. Check if NOTION_DATABASE_ID is correct');
      console.log('2. Ensure database ID is 32 characters');
      console.log('3. Verify Integration has access to the database');
    }
    
    if (error.message.includes('403')) {
      console.log('1. Ensure Integration is added to the database');
      console.log('2. Check database permission settings');
      console.log('3. Verify workspace permissions');
    }
    
    console.log('\nSetup steps:');
    console.log('1. Visit https://www.notion.so/my-integrations');
    console.log('2. Create a new Integration');
    console.log('3. Copy the API key');
    console.log('4. Add Integration to your Notion database page');
    console.log('5. Set environment variables:');
    console.log('   export NOTION_API_KEY="your-api-key"');
    console.log('   export NOTION_DATABASE_ID="your-database-id"');
  }
}

async function main() {
  console.log('Notion API Connection Test\n');
  
  if (!CONFIG.notionApiKey) {
    console.error('NOTION_API_KEY environment variable not set');
    console.log('Please set: export NOTION_API_KEY="your-api-key"');
    return;
  }
  
  if (!CONFIG.notionDatabaseId) {
    console.error('NOTION_DATABASE_ID environment variable not set');
    console.log('Please set: export NOTION_DATABASE_ID="your-database-id"');
    return;
  }
  
  const tester = new NotionAPITester(CONFIG.notionApiKey);
  await tester.testConnection();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NotionAPITester };
