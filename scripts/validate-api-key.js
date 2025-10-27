#!/usr/bin/env node

/**
 * Validate Notion API key format
 */

// Load environment variables
require('dotenv').config();

function validateNotionApiKey(apiKey) {
  console.log('Validating Notion API key format...\n');
  
  if (!apiKey) {
    console.log('API key not set');
    console.log('Please set environment variable: export NOTION_API_KEY="your-api-key"');
    return false;
  }
  
  console.log(`API key: ${apiKey.substring(0, 10)}...`);
  
  // Check format
  if (apiKey.startsWith('ntn_')) {
    console.log('API key format is correct (starts with ntn_)');
    return true;
  } else if (apiKey.startsWith('secret_')) {
    console.log('Detected old format API key (starts with secret_)');
    console.log('   This might be an old version of Notion Integration');
    console.log('   Recommend creating a new Integration to get ntn_ format key');
    return true;
  } else {
    console.log('API key format is incorrect');
    console.log('   Correct format should start with "ntn_"');
    console.log('   Example: ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    return false;
  }
}

function main() {
  const apiKey = process.env.NOTION_API_KEY;
  const isValid = validateNotionApiKey(apiKey);
  
  if (isValid) {
    console.log('\nAPI key format validation passed!');
    console.log('Next step: Run npm run test-api to test API connection');
  } else {
    console.log('\nAPI key format validation failed');
    console.log('Please check your Notion Integration settings');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateNotionApiKey };
