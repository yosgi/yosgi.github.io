#!/usr/bin/env node

/**
 * Notion API to Hugo Sync Script
 * Directly sync articles to Hugo blog using Notion API
 * 
 * Need to set up Notion Integration and API key first
 */

// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
  notionApiKey: process.env.NOTION_API_KEY, // Get from environment variable
  notionDatabaseId: process.env.NOTION_DATABASE_ID, // Your Notion database ID
  hugoContentDir: './content',
  imageDir: './static/images',
};

/**
 * Call Notion API
 */
function callNotionAPI(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.notion.com/v1${endpoint}`;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    
    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
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

/**
 * Get pages from Notion database
 */
async function getNotionPages() {
  try {
    const response = await callNotionAPI(`/databases/${CONFIG.notionDatabaseId}/query`, {
      method: 'POST',
      body: {
        // No filter for now since Status property doesn't exist
      }
    });
    
    return response.results;
  } catch (error) {
    console.error('Failed to get Notion pages:', error.message);
    return [];
  }
}

/**
 * Get page content
 */
async function getPageContent(pageId) {
  try {
    const response = await callNotionAPI(`/blocks/${pageId}/children`);
    return response.results;
  } catch (error) {
    console.error(`Failed to get page content (${pageId}):`, error.message);
    return [];
  }
}

/**
 * Convert Notion blocks to Markdown
 */
function convertBlockToMarkdown(block) {
  switch (block.type) {
    case 'paragraph':
      return convertRichText(block.paragraph.rich_text) + '\n\n';
    
    case 'heading_1':
      return `# ${convertRichText(block.heading_1.rich_text)}\n\n`;
    
    case 'heading_2':
      return `## ${convertRichText(block.heading_2.rich_text)}\n\n`;
    
    case 'heading_3':
      return `### ${convertRichText(block.heading_3.rich_text)}\n\n`;
    
    case 'bulleted_list_item':
      return `- ${convertRichText(block.bulleted_list_item.rich_text)}\n`;
    
    case 'numbered_list_item':
      return `1. ${convertRichText(block.numbered_list_item.rich_text)}\n`;
    
    case 'code':
      return `\`\`\`${block.code.language}\n${convertRichText(block.code.rich_text)}\n\`\`\`\n\n`;
    
    case 'image':
      const imageUrl = block.image.type === 'external' 
        ? block.image.external.url 
        : block.image.file.url;
      return `![${block.image.caption || ''}](${imageUrl})\n\n`;
    
    default:
      return '';
  }
}

/**
 * Convert rich text
 */
function convertRichText(richTextArray) {
  return richTextArray.map(text => {
    let content = text.plain_text;
    
    if (text.annotations.bold) content = `**${content}**`;
    if (text.annotations.italic) content = `*${content}*`;
    if (text.annotations.code) content = `\`${content}\``;
    
    return content;
  }).join('');
}

/**
 * Generate frontmatter
 */
function generateFrontmatter(page) {
  const properties = page.properties;
  
  return {
    title: properties.Name?.title?.[0]?.plain_text || 'Untitled',
    description: properties.Description?.rich_text?.[0]?.plain_text || '',
    categories: properties.Category?.multi_select?.map(cat => cat.name) || ['uncategorized'],
    tags: properties.Tags?.multi_select?.map(tag => tag.name) || [],
    date: properties.Date?.date?.start || new Date().toISOString().split('T')[0] + ' 00:00:00',
    summary: properties.Summary?.rich_text?.[0]?.plain_text || '',
  };
}

/**
 * Sync single page
 */
async function syncPage(page) {
  console.log(`Processing page: ${page.properties.Name?.title?.[0]?.plain_text || 'Untitled'}`);
  
  const content = await getPageContent(page.id);
  const markdownContent = content.map(convertBlockToMarkdown).join('');
  
  const frontmatter = generateFrontmatter(page);
  const frontmatterString = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n  - ${value.join('\n  - ')}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
  
  const fullContent = `---\n${frontmatterString}\n---\n\n${markdownContent}`;
  
  // Detect language
  const language = /[\u4e00-\u9fff]/.test(fullContent) ? 'zh' : 'en';
  const fileName = `${frontmatter.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-')}.md`;
  const targetPath = path.join(CONFIG.hugoContentDir, language, 'post', fileName);
  
  // Ensure directory exists
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(targetPath, fullContent, 'utf8');
  console.log(`Synced: ${fileName}`);
}

/**
 * Main sync function
 */
async function syncFromNotion() {
  if (!CONFIG.notionApiKey) {
    console.error('Please set NOTION_API_KEY environment variable');
    return;
  }
  
  if (!CONFIG.notionDatabaseId) {
    console.error('Please set NOTION_DATABASE_ID environment variable');
    return;
  }
  
  console.log('Starting to sync articles from Notion...');
  
  const pages = await getNotionPages();
  console.log(`Found ${pages.length} pages`);
  
  for (const page of pages) {
    await syncPage(page);
  }
  
  console.log('Sync completed!');
}

// Run sync
if (require.main === module) {
  syncFromNotion().catch(console.error);
}

module.exports = { syncFromNotion };
