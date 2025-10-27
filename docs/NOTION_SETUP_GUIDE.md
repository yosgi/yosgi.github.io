# Advanced Setup Guide for Notion to Hugo Sync

##  Quick Start

### 1. Environment Preparation

```bash
# Install dependencies
npm install

# Set environment variables
export NOTION_API_KEY="your-notion-api-key"
export NOTION_DATABASE_ID="your-database-id"
```

### 2. Test Connection

```bash
npm run test-api
```

### 3. Start Sync

```bash
npm run sync
```

## Detailed Setup Steps

### Step 1: Create Notion Integration

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the information:
   - **Name**: `Hugo Blog Sync`
   - **Associated workspace**: Select your workspace
4. Click "Submit"
5. Copy "Internal Integration Token" (starts with `ntn_`)

### Step 2: Create Notion Database

Create a database named "Blog Posts" with the following properties:

#### Required Properties
- **Title** (Title) - 文章标题
- **Description** (Rich text) - Article description  
- **Status** (Select) - Status: `Draft`, `Review`, `Published`, `Archived`
- **Language** (Select) - Language: `zh`, `en`
- **Date** (Date) - Publish date

#### Category Properties
- **Categories** (Multi-select) - Categories: `technology`, `life`, `algorithm`, `tutorial`
- **Tags** (Multi-select) - Tags: `javascript`, `vue`, `leetcode`, `css`
- **Series** (Select) - Series (optional)

#### SEO Properties
- **Summary** (Rich text) - Article summary
- **Keywords** (Multi-select) - SEO keywords
- **Featured** (Checkbox) - Whether featured

#### Technical Properties
- **Reading Time** (Number) - Estimated reading time (minutes)
- **Word Count** (Number) - Word count

### Step 3: Configure Database Permissions

1. Click the "Share" button in the top right corner of the Notion database page
2. 点击 "Add people, emails, groups, or integrations"
3. Search and select the Integration you created
4. Grant "Can edit" permission

### Step 4: Get Database ID

The database ID is a 32-character string in the URL:
```
https://www.notion.so/your-workspace/DATABASE_ID?v=...
```

### Step 5: Set Environment Variables

```bash
refer to .env.example
```

## Advanced Features

### Incremental Sync

The script will automatically detect page changes and only sync updated content:

```bash
# Clear cache, force full sync
npm run sync:clear-cache
npm run sync
```

### Automatic Image Download

The script will automatically download images from Notion to the `static/images/` directory and update the links in the Markdown files.

### 批量处理

Supports batch processing of large numbers of pages to avoid API limits:

```javascript
// Adjust in advanced-notion-sync.js
const CONFIG = {
  batchSize: 10, // Number of pages to process per batch
  maxRetries: 3, // Maximum number of retries
  retryDelay: 1000, // Retry delay (milliseconds)
};
```

### Error Handling and Retry

The script includes a complete error handling mechanism:
- API 请求失败自动重试
- Network error handling
- Detailed error logs

## GitHub Actions Automation

### Set Secrets

Add the following Secrets to the GitHub repository settings:

1. `NOTION_API_KEY` - Your Notion API key
2. `NOTION_DATABASE_ID` - Your database ID
3. `CUSTOM_DOMAIN` - Custom domain (optional)

### Workflow Features

- **Scheduled Sync**: Check for updates daily at 9:00 AM
- **Manual Trigger**: Manually trigger sync
- **Incremental Build**: Only rebuild when content changes
- **Cache Management**: Manage sync cache
- **Error Handling**: Handle errors

### Manually Trigger Sync

You can manually trigger sync in the GitHub Actions page and choose to clear the cache.

## Monitoring and Debugging

### View Sync Logs

```bash
# Detailed log output
DEBUG=* npm run sync

# Save logs to file
npm run sync 2>&1 | tee sync.log
```

### 缓存文件

The sync cache is saved in the `.notion-sync-cache.json` file, containing:
- Hash value for each page
- Last sync time
- Page status

### Common Problem Troubleshooting

#### 1. API 连接失败

```bash
# Test API connection
npm run test-api
```

Common errors:
- `401 Unauthorized`: API 密钥错误
- `404 Not Found`: Database ID error
- `403 Forbidden`: Permission denied

#### 2. Image download failed

- Check network connection
- Verify image URL is valid
- Check permissions of `static/images/` directory

#### 3. Frontmatter format error

Check the frontmatter format in the generated Markdown file:
```yaml
---
title: "Article title"
description: "Article description"
categories:
  - technology
tags:
  - javascript
  - tutorial
date: "2024-01-01 00:00:00"
summary: "Article summary"
---
```

## Custom Configuration

### Modify sync rules

Edit the configuration in `scripts/advanced-notion-sync.js`:

```javascript
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
```

### Custom content conversion

Modify the `NotionConverter` class to handle specific Notion block types:

```javascript
async convertBlockToMarkdown(block) {
  switch (block.type) {
    case 'callout':
      return `> ${this.convertRichText(block.callout.rich_text)}\n\n`;
    case 'toggle':
      return this.convertToggle(block.toggle);
    // Add more custom types...
  }
}
```

### Custom Frontmatter

Modify the `generateFrontmatter` method to add custom properties:

```javascript
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
    // Add custom properties
    customField: this.getPropertyValue(properties['Custom Field'], 'rich_text') || '',
  };
}
```

## Performance Optimization

### API Limits

Notion API has the following limits:
- Maximum 3 requests per second
- Maximum 100 pages per query
- Maximum 100 sub-blocks per page

The script has built-in handling for these limits:
- Request interval control
- Batch processing
- Automatic retry

### Cache Optimization

- Use MD5 hash to detect page changes
- Only sync pages that have changed
- Cache file persistence storage

### Image Optimization

- Automatically download images to local
- Avoid duplicate downloads
- Support multiple image formats

## Best Practices

### 1. Content organization

- Use Notion page content instead of database properties for content
- Use Notion collaboration features for content editing
- Use templates to ensure consistent content format

### 2. Status management

- `Draft`: Draft status, will not be synced
- `Review`: Review status, will not be synced  
- `Published`: Published status, will be synced to blog
- `Archived`: Archived status, will be removed from blog

### 3. Version control

- Add `.notion-sync-cache.json` to version control
- Regularly backup Notion database
- Use Git tags to mark important versions

### 4. Monitoring

- Regularly check sync logs
- Monitor API usage
- Set error notifications

## Troubleshooting

### Common errors

1. **Environment variables not set**
   ```bash
   echo $NOTION_API_KEY
   echo $NOTION_DATABASE_ID
   ```

2. **Permission denied**
   - Check if Integration is added to database
    - Verify database permission settings

3. **Network issues**
   - Check network connection
   - Verify firewall settings

4. **API Limits**
   - Reduce batch size
   - Increase retry delay

### Debugging tips

1. **Enable detailed logs**
   ```bash
   DEBUG=* npm run sync
   ```

2. **Test a single page**
   ```bash
   # Modify script to only process specific pages
   ```

3. **Check cache**
   ```bash
   cat .notion-sync-cache.json
   ```

## Extended reading

- [Notion API documentation](https://developers.notion.com/)
- [Hugo documentation](https://gohugo.io/documentation/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)

