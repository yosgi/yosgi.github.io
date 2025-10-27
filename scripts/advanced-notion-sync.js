#!/usr/bin/env node

/**
 * Advanced Notion to Hugo Sync Script
 * 
 * Features:
 * - Incremental sync
 * - Automatic image download
 * - Content conversion optimization
 * - Error handling and retry
 * - Detailed logging
 */

// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  notionApiKey: process.env.NOTION_API_KEY,
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
  hugoContentDir: './content',
  imageDir: './static/images',
  cacheFile: './.notion-sync-cache.json',
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 10,
};

// Cache management
class CacheManager {
  constructor(cacheFile) {
    this.cacheFile = cacheFile;
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Failed to load cache file:', error.message);
    }
    return { pages: {}, lastSync: null };
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.warn('Failed to save cache file:', error.message);
    }
  }

  getPageHash(pageId, lastEditedTime) {
    return crypto.createHash('md5').update(`${pageId}-${lastEditedTime}`).digest('hex');
  }

  hasPageChanged(pageId, lastEditedTime) {
    const currentHash = this.getPageHash(pageId, lastEditedTime);
    const cachedHash = this.cache.pages[pageId];
    return cachedHash !== currentHash;
  }

  updatePageCache(pageId, lastEditedTime) {
    this.cache.pages[pageId] = this.getPageHash(pageId, lastEditedTime);
  }

  clearCache() {
    this.cache = { pages: {}, lastSync: null };
    this.saveCache();
  }
}

// HTTP request utility
class HttpClient {
  constructor(apiKey, maxRetries = 3, retryDelay = 1000) {
    this.apiKey = apiKey;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async request(endpoint, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeRequest(endpoint, options);
      } catch (error) {
        lastError = error;
        console.warn(`Request failed (attempt ${attempt}/${this.maxRetries}):`, error.message);
        
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    
    throw lastError;
  }

  makeRequest(endpoint, options) {
    return new Promise((resolve, reject) => {
      const url = `https://api.notion.com/v1${endpoint}`;
      
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Image downloader
class ImageDownloader {
  constructor(imageDir) {
    this.imageDir = imageDir;
    this.ensureImageDir();
  }

  ensureImageDir() {
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async downloadImage(url, filename) {
    const filePath = path.join(this.imageDir, filename);
    
    // Skip download if file already exists
    if (fs.existsSync(filePath)) {
      return `/images/${filename}`;
    }

    try {
      const data = await this.downloadFile(url);
      fs.writeFileSync(filePath, data);
      console.log(`Downloaded image: ${filename}`);
      return `/images/${filename}`;
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error.message);
      return url; // 返回原始URL作为fallback
    }
  }

  downloadFile(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      });
      
      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  generateFilename(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const ext = path.extname(pathname) || '.png';
      const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
      return `${hash}${ext}`;
    } catch (error) {
      // Use default extension if URL parsing fails
      const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
      return `${hash}.png`;
    }
  }
}

// Notion content converter
class NotionConverter {
  constructor(imageDownloader, httpClient) {
    this.imageDownloader = imageDownloader;
    this.httpClient = httpClient;
  }

  async convertBlocksToMarkdown(blocks) {
    const markdownParts = [];
    
    for (const block of blocks) {
      const markdown = await this.convertBlockToMarkdown(block);
      if (markdown) {
        markdownParts.push(markdown);
      }
    }
    
    return markdownParts.join('');
  }

  async convertBlockToMarkdown(block) {
    switch (block.type) {
      case 'paragraph':
        return this.convertRichText(block.paragraph.rich_text) + '\n\n';
      
      case 'heading_1':
        return `# ${this.convertRichText(block.heading_1.rich_text)}\n\n`;
      
      case 'heading_2':
        return `## ${this.convertRichText(block.heading_2.rich_text)}\n\n`;
      
      case 'heading_3':
        return `### ${this.convertRichText(block.heading_3.rich_text)}\n\n`;
      
      case 'bulleted_list_item':
        return `- ${this.convertRichText(block.bulleted_list_item.rich_text)}\n`;
      
      case 'numbered_list_item':
        return `1. ${this.convertRichText(block.numbered_list_item.rich_text)}\n`;
      
      case 'code':
        const language = block.code.language || '';
        return `\`\`\`${language}\n${this.convertRichText(block.code.rich_text)}\n\`\`\`\n\n`;
      
      case 'image':
        return await this.convertImage(block.image);
      
      case 'callout':
        return `> ${this.convertRichText(block.callout.rich_text)}\n\n`;
      
      case 'quote':
        return `> ${this.convertRichText(block.quote.rich_text)}\n\n`;
      
      case 'divider':
        return '---\n\n';
      
      case 'table':
        return await this.convertTable(block.table);
      
      default:
        console.warn(`Unhandled block type: ${block.type}`);
        return '';
    }
  }

  async convertImage(imageBlock) {
    const imageUrl = imageBlock.type === 'external' 
      ? imageBlock.external.url 
      : imageBlock.file.url;
    
    const caption = imageBlock.caption?.[0]?.plain_text || '';
    const filename = this.imageDownloader.generateFilename(imageUrl);
    
    try {
      const localPath = await this.imageDownloader.downloadImage(imageUrl, filename);
      return `![${caption}](${localPath})\n\n`;
    } catch (error) {
      console.error('Image conversion failed:', error.message);
      return `![${caption}](${imageUrl})\n\n`;
    }
  }

  convertRichText(richTextArray) {
    return richTextArray.map(text => {
      let content = text.plain_text;
      
      if (text.annotations.bold) content = `**${content}**`;
      if (text.annotations.italic) content = `*${content}*`;
      if (text.annotations.code) content = `\`${content}\``;
      if (text.annotations.strikethrough) content = `~~${content}~~`;
      
      if (text.href) {
        content = `[${content}](${text.href})`;
      }
      
      return content;
    }).join('');
  }

  async convertTable(tableBlock) {
    try {
      // 获取表格的详细信息
      const tableId = tableBlock.id;
      const tableResponse = await this.httpClient.request(`/blocks/${tableId}/children`);
      const rows = tableResponse.results;
      
      if (rows.length === 0) {
        return '';
      }
      
      // 检查是否是代码表格（通常只有一行或两行，且包含代码）
      const isCodeTable = this.isCodeTable(rows);
      
      if (isCodeTable) {
        return this.convertCodeTable(rows);
      } else {
        return this.convertRegularTable(rows);
      }
      
    } catch (error) {
      console.error('Table conversion failed:', error.message);
      return '<!-- Table conversion failed -->\n\n';
    }
  }

  isCodeTable(rows) {
    // 检查表格是否包含代码
    // 通常代码表格的特征：
    // 1. 行数较少（1-2行）
    // 2. 包含大量代码内容
    // 3. 单元格内容较长
    
    if (rows.length > 2) {
      return false;
    }
    
    for (const row of rows) {
      if (row.type === 'table_row') {
        const cells = row.table_row.cells;
        for (const cell of cells) {
          const cellText = this.convertRichText(cell);
          // 如果单元格内容很长且包含代码特征，认为是代码表格
          if (cellText.length > 100 && this.containsCodePattern(cellText)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  containsCodePattern(text) {
    // 检查文本是否包含代码模式
    const codePatterns = [
      /function\s+\w+\s*\(/,  // function declarations
      /class\s+\w+/,          // class declarations
      /var\s+\w+\s*=/,        // variable declarations
      /let\s+\w+\s*=/,        // let declarations
      /const\s+\w+\s*=/,      // const declarations
      /if\s*\(/,              // if statements
      /for\s*\(/,             // for loops
      /while\s*\(/,           // while loops
      /return\s+/,             // return statements
      /console\.log/,          // console.log
      /Math\./,                // Math functions
      /Array\./,               // Array methods
      /\.push\(/,              // array methods
      /\.pop\(/,               // array methods
      /\.length/,              // length property
      /\.map\(/,               // map method
      /\.filter\(/,            // filter method
      /\.reduce\(/,            // reduce method
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }

  convertCodeTable(rows) {
    // 转换代码表格为代码块
    let codeContent = '';
    
    for (const row of rows) {
      if (row.type === 'table_row') {
        const cells = row.table_row.cells;
        for (const cell of cells) {
          const cellText = this.convertRichText(cell).trim();
          if (cellText && cellText.length > 10) { // 忽略很短的单元格
            codeContent += cellText + '\n';
          }
        }
      }
    }
    
    // 检测编程语言
    const language = this.detectProgrammingLanguage(codeContent);
    
    return `\`\`\`${language}\n${codeContent.trim()}\n\`\`\`\n\n`;
  }

  detectProgrammingLanguage(code) {
    // 简单的语言检测
    if (/function\s+\w+\s*\(|var\s+\w+\s*=|let\s+\w+\s*=|const\s+\w+\s*=|console\.log|Math\.|Array\./.test(code)) {
      return 'javascript';
    }
    if (/def\s+\w+\s*\(|import\s+|from\s+|print\s*\(/.test(code)) {
      return 'python';
    }
    if (/public\s+class|private\s+|System\.out\.print/.test(code)) {
      return 'java';
    }
    if (/#include|int\s+main|printf|scanf/.test(code)) {
      return 'cpp';
    }
    if (/function\s+\w+\s*\(|<?php|echo\s+/.test(code)) {
      return 'php';
    }
    
    return ''; // 默认无语言标识
  }

  convertRegularTable(rows) {
    // 转换普通表格为 Markdown 表格
    if (rows.length === 0) {
      return '';
    }
    
    let markdown = '';
    
    // 处理表头
    if (rows.length > 0 && rows[0].type === 'table_row') {
      const headerCells = rows[0].table_row.cells;
      const headerRow = headerCells.map(cell => this.convertRichText(cell)).join(' | ');
      markdown += `| ${headerRow} |\n`;
      
      // 添加分隔行
      const separatorRow = headerCells.map(() => '---').join(' | ');
      markdown += `| ${separatorRow} |\n`;
      
      // 处理数据行
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].type === 'table_row') {
          const dataCells = rows[i].table_row.cells;
          const dataRow = dataCells.map(cell => this.convertRichText(cell)).join(' | ');
          markdown += `| ${dataRow} |\n`;
        }
      }
    }
    
    return markdown + '\n';
  }
}

// Main sync class
class NotionHugoSync {
  constructor(config) {
    this.config = config;
    this.httpClient = new HttpClient(config.notionApiKey, config.maxRetries, config.retryDelay);
    this.cacheManager = new CacheManager(config.cacheFile);
    this.imageDownloader = new ImageDownloader(config.imageDir);
    this.converter = new NotionConverter(this.imageDownloader, this.httpClient);
  }

  async sync() {
    console.log('Starting advanced Notion sync...');
    
    try {
      // Validate configuration
      this.validateConfig();
      
      // Get page list
      const pages = await this.getNotionPages();
      console.log(`Found ${pages.length} pages`);
      
      // Filter pages that need sync
      const pagesToSync = pages.filter(page => this.shouldSyncPage(page));
      console.log(`Need to sync ${pagesToSync.length} pages`);
      
      // Batch sync
      await this.syncPagesInBatches(pagesToSync);
      
      // Save cache
      this.cacheManager.saveCache();
      
      console.log('Sync completed!');
      
    } catch (error) {
      console.error('Sync failed:', error.message);
      throw error;
    }
  }

  validateConfig() {
    if (!this.config.notionApiKey) {
      throw new Error('NOTION_API_KEY environment variable not set');
    }
    if (!this.config.notionDatabaseId) {
      throw new Error('NOTION_DATABASE_ID environment variable not set');
    }
  }

  async getNotionPages() {
    const response = await this.httpClient.request(`/databases/${this.config.notionDatabaseId}/query`, {
      method: 'POST',
      body: {
        page_size: 100
      }
    });
    
    return response.results;
  }

  shouldSyncPage(page) {
    const lastEditedTime = page.last_edited_time;
    const pageId = page.id;
    
    // Check if page has changes
    return this.cacheManager.hasPageChanged(pageId, lastEditedTime);
  }

  async syncPagesInBatches(pages) {
    for (let i = 0; i < pages.length; i += this.config.batchSize) {
      const batch = pages.slice(i, i + this.config.batchSize);
      console.log(`Processing batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(pages.length / this.config.batchSize)}`);
      
      await Promise.all(batch.map(page => this.syncPage(page)));
    }
  }

  async syncPage(page) {
    try {
      console.log(`Syncing page: ${this.getPageTitle(page)}`);
      
      // Get page content
      const content = await this.getPageContent(page.id);
      
      // Convert to Markdown
      const markdownContent = await this.converter.convertBlocksToMarkdown(content);
      
      // Generate frontmatter
      const frontmatter = this.generateFrontmatter(page);
      
      // Save file
      await this.saveHugoFile(page, frontmatter, markdownContent);
      
      // Update cache
      this.cacheManager.updatePageCache(page.id, page.last_edited_time);
      
      console.log(`Completed: ${this.getPageTitle(page)}`);
      
    } catch (error) {
      console.error(`Failed to sync page ${this.getPageTitle(page)}:`, error.message);
    }
  }

  async getPageContent(pageId) {
    const response = await this.httpClient.request(`/blocks/${pageId}/children`);
    return response.results;
  }

  getPageTitle(page) {
    const titleProperty = page.properties.Title || page.properties.title;
    return titleProperty?.title?.[0]?.plain_text || 'Untitled';
  }

  generateFrontmatter(page) {
    const properties = page.properties;
    
    return {
      title: this.getPageTitle(page),
      description: this.getPropertyValue(properties.Description, 'rich_text') || '',
      categories: this.getPropertyValue(properties.Categories, 'multi_select') || ['uncategorized'],
      tags: this.getPropertyValue(properties.Tags, 'multi_select') || [],
      date: this.getPropertyValue(properties.Date, 'date') || new Date().toISOString().split('T')[0] + ' 00:00:00',
      summary: this.getPropertyValue(properties.Summary, 'rich_text') || '',
      featured: this.getPropertyValue(properties.Featured, 'checkbox') || false,
      readingTime: this.getPropertyValue(properties['Reading Time'], 'number') || null,
    };
  }

  getPropertyValue(property, type) {
    if (!property) return null;
    
    switch (type) {
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'multi_select':
        return property.multi_select?.map(item => item.name) || [];
      case 'date':
        return property.date?.start || null;
      case 'checkbox':
        return property.checkbox || false;
      case 'number':
        return property.number || null;
      default:
        return null;
    }
  }

  async saveHugoFile(page, frontmatter, content) {
    const language = this.detectLanguage(content);
    const fileName = this.generateFileName(frontmatter.title);
    const targetDir = path.join(this.config.hugoContentDir, language, 'post');
    
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, fileName);
    
    // Generate frontmatter string
    const frontmatterString = this.formatFrontmatter(frontmatter);
    
    // Write file
    const fullContent = `---\n${frontmatterString}\n---\n\n${content}`;
    fs.writeFileSync(targetPath, fullContent, 'utf8');
  }

  detectLanguage(content) {
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(content) ? 'zh' : 'en';
  }

  generateFileName(title) {
    // Handle Chinese and English titles
    let fileName = title
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '') // Keep letters, numbers, Chinese, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    // Use default name if filename is empty
    if (!fileName) {
      fileName = 'untitled';
    }
    
    return fileName.toLowerCase() + '.md';
  }

  formatFrontmatter(frontmatter) {
    return Object.entries(frontmatter)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n  - ${value.join('\n  - ')}`;
        }
        if (typeof value === 'boolean') {
          return `${key}: ${value}`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Advanced Notion to Hugo sync script

Usage:
  node notion-api-sync.js [options]

Options:
  --clear-cache    Clear sync cache
  --help          Show help information

Environment variables:
  NOTION_API_KEY      Notion API key
  NOTION_DATABASE_ID  Notion database ID

Features:
  - Incremental sync (only sync changed pages)
  - Automatic image download
  - Batch processing
  - Error retry
  - Detailed logging
    `);
    return;
  }
  
  if (args.includes('--clear-cache')) {
    const cacheManager = new CacheManager(CONFIG.cacheFile);
    cacheManager.clearCache();
    console.log('Cache cleared');
    return;
  }
  
  const sync = new NotionHugoSync(CONFIG);
  await sync.sync();
}

// Run
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NotionHugoSync };
