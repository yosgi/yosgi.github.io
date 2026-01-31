#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const YAML = require('yaml');
require('dotenv').config();

const args = process.argv.slice(2);
const wantsHelp = args.includes('--help') || args.includes('-h');
const wantsClearCache = args.includes('--clear-cache');
const dryRun = args.includes('--dry-run');

const CONFIG = {
  notionApiKey: process.env.NOTION_API_KEY,
  notionDatabaseId: process.env.NOTION_DATABASE_ID,
  hugoContentDir: process.env.HUGO_CONTENT_DIR || './content',
  hugoPostDir: process.env.HUGO_POST_DIR || 'post',
  cacheFile: process.env.HUGO_CACHE_FILE || './.notion-sync-cache.json',
  publishedStatus: process.env.NOTION_PUBLISH_STATUS || 'Published',
  languageProperty: process.env.NOTION_LANGUAGE_PROPERTY || 'Language',
  titleProperty: process.env.NOTION_TITLE_PROPERTY || 'Title',
  nameFallbackProperty: process.env.NOTION_NAME_PROPERTY || 'Name',
  hugoPathProperty: process.env.NOTION_HUGO_PATH_PROPERTY || 'Hugo Path',
  defaultLang: process.env.NOTION_DEFAULT_LANG || 'zh',
  pageSize: Number(process.env.NOTION_PAGE_SIZE || 50),
};

if (wantsHelp) {
  printHelp();
  process.exit(0);
}

if (!CONFIG.notionApiKey || !CONFIG.notionDatabaseId) {
  console.error('Missing NOTION_API_KEY or NOTION_DATABASE_ID in environment.');
  process.exit(1);
}

if (wantsClearCache) {
  clearCache(CONFIG.cacheFile);
  process.exit(0);
}

(async () => {
  const notion = new Client({ auth: CONFIG.notionApiKey });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  const cache = loadCache(CONFIG.cacheFile);
  /* Fetch all pages, then filter/status locally */
  const pages = await queryAllPages(notion, CONFIG.notionDatabaseId, undefined, CONFIG.pageSize);

  let written = 0;
  let skipped = 0;

  for (const page of pages) {
    const props = page.properties || {};
    const title = getTitle(props, CONFIG.titleProperty, CONFIG.nameFallbackProperty) || 'Untitled';
    const hugoPath = getRichText(props[CONFIG.hugoPathProperty]);
    const langRaw = getSelect(props[CONFIG.languageProperty]) || CONFIG.defaultLang;
    const lang = normalizeLang(langRaw);

    /* Determine Draft Status */
    const status = getSelect(props.Status);
    const isDraft = status !== CONFIG.publishedStatus;

    const slug = normalizeSlug(title) || page.id;
    const outputPath = resolveOutputPath(CONFIG.hugoContentDir, lang, CONFIG.hugoPostDir, slug, hugoPath);

    const lastEdited = page.last_edited_time || '';
    const cacheKey = page.id;
    const cached = cache.pages[cacheKey];
    // If cached and nothing changed
    if (cached && cached.lastEdited === lastEdited && fs.existsSync(outputPath)) {
      // Simple check: we might want to update if logic changed (e.g. draft status), 
      // but typically last_edited_time updates on property change too.
      skipped += 1;
      continue;
    }

    const mdBlocks = await n2m.pageToMarkdown(page.id);

    // Process blocks to download images
    await processBlocks(mdBlocks, CONFIG.hugoContentDir);

    const mdResult = n2m.toMarkdownString(mdBlocks);
    const content = typeof mdResult === 'string' ? mdResult : (mdResult.parent || '');

    const frontmatter = buildFrontmatter({
      title,
      description: getRichText(props.Description),
      categories: getMultiSelect(props.Categories),
      tags: getMultiSelect(props.Tags),
      date: normalizeDate(getDate(props.Date)),
      summary: getRichText(props.Summary),
      readingTime: getNumber(props['Reading Time']),
      draft: isDraft,
    });

    const output = formatMarkdown(frontmatter, normalizeMarkdown(content));

    if (!dryRun) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, output, 'utf8');
    }

    cache.pages[cacheKey] = { lastEdited, outputPath };
    written += 1;
  }

  if (!dryRun) {
    saveCache(CONFIG.cacheFile, cache);
  }

  console.log(`Done. Written: ${written}, skipped: ${skipped}${dryRun ? ' (dry-run)' : ''}`);
})().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});

function printHelp() {
  console.log(`Notion to Hugo sync (notion-to-md)

Usage:
  node scripts/notion-to-md-sync.js [--dry-run] [--clear-cache]

Env:
  NOTION_API_KEY            Notion integration API key
  NOTION_DATABASE_ID        Notion database ID
  HUGO_CONTENT_DIR          Hugo content dir (default: ./content)
  HUGO_POST_DIR             Hugo post dir (default: post)
  HUGO_CACHE_FILE           Cache file (default: ./.notion-sync-cache.json)
  NOTION_PUBLISH_STATUS     Status value to sync (default: Published)
  NOTION_LANGUAGE_PROPERTY  Property name for language (default: Language)
  NOTION_TITLE_PROPERTY     Property name for title (default: Title)
  NOTION_NAME_PROPERTY      Fallback title property (default: Name)
  NOTION_HUGO_PATH_PROPERTY Property name for hugo path (default: Hugo Path)
  NOTION_DEFAULT_LANG       Default language (default: zh)
  NOTION_PAGE_SIZE          Page size for Notion query (default: 50)
`);
}

function clearCache(cacheFile) {
  if (fs.existsSync(cacheFile)) {
    fs.unlinkSync(cacheFile);
    console.log(`Cache cleared: ${cacheFile}`);
  } else {
    console.log('Cache file not found, nothing to clear.');
  }
}

function loadCache(cacheFile) {
  try {
    if (fs.existsSync(cacheFile)) {
      const data = fs.readFileSync(cacheFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to read cache, rebuilding:', err.message);
  }
  return { pages: {} };
}

function saveCache(cacheFile, cache) {
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn('Failed to write cache:', err.message);
  }
}

async function queryAllPages(notion, databaseId, statusValue, pageSize) {
  const results = [];
  let cursor = undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: pageSize,
      filter: statusValue
        ? {
          property: 'Status',
          select: { equals: statusValue },
        }
        : undefined,
      start_cursor: cursor,
    });

    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results;
}

function getTitle(properties, titleProperty, fallbackProperty) {
  return getRichText(properties[titleProperty]) || getRichText(properties[fallbackProperty]);
}

function getRichText(prop) {
  if (!prop) return '';
  const rich = prop.rich_text || prop.title || [];
  if (!Array.isArray(rich)) return '';
  return rich.map((t) => t.plain_text || '').join('');
}

function getSelect(prop) {
  return prop && prop.select ? prop.select.name : '';
}

function getMultiSelect(prop) {
  if (!prop || !Array.isArray(prop.multi_select)) return [];
  return prop.multi_select.map((item) => item.name).filter(Boolean);
}

function getDate(prop) {
  if (!prop || !prop.date) return '';
  return prop.date.start || '';
}

function getNumber(prop) {
  if (!prop || typeof prop.number !== 'number') return null;
  return prop.number;
}

function normalizeDate(dateValue) {
  if (!dateValue) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return `${dateValue} 00:00:00`;
  }
  return dateValue;
}

function buildFrontmatter(fields) {
  const fm = {};
  setIf(fm, 'title', fields.title);
  setIf(fm, 'description', fields.description);
  setIfArray(fm, 'categories', fields.categories);
  setIfArray(fm, 'tags', fields.tags);
  setIf(fm, 'date', fields.date);
  setIf(fm, 'summary', fields.summary);
  if (fields.readingTime !== null && fields.readingTime !== undefined) {
    fm.readingTime = fields.readingTime;
  }
  if (fields.draft) {
    fm.draft = true;
  }
  return fm;
}

function setIf(target, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    target[key] = value;
  }
}

function setIfArray(target, key, value) {
  if (Array.isArray(value) && value.length > 0) {
    target[key] = value;
  }
}

function formatMarkdown(frontmatter, content) {
  const yaml = YAML.stringify(frontmatter).trimEnd();
  const body = String(content || '').trim();
  return `---\n${yaml}\n---\n\n${body}\n`;
}

function normalizeMarkdown(content) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  let inFence = false;
  const out = [];

  for (const line of lines) {
    const isFence = /^\s*```/.test(line);
    if (isFence) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence) {
      out.push(line.replace(/^\t+/, (tabs) => '  '.repeat(tabs.length)));
    } else {
      out.push(line);
    }
  }

  return out.join('\n');
}

function normalizeSlug(input) {
  if (!input) return '';
  const normalized = String(input).normalize('NFKC');
  return normalized
    .trim()
    .toLowerCase()
    .replace(/[\\/]/g, '-')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveOutputPath(contentDir, lang, postDir, slug, hugoPath) {
  if (hugoPath) {
    let clean = hugoPath.trim();
    clean = clean.replace(/^content[\\/]/, '');
    clean = clean.replace(/^[\\/]+/, '');
    if (clean.endsWith('/')) {
      clean += 'index.md';
    }
    if (!/\.md$/i.test(clean)) {
      clean += '.md';
    }
    return path.join(contentDir, clean);
  }

  return path.join(contentDir, lang, postDir, `${slug}.md`);
}

function normalizeLang(lang) {
  const value = String(lang || '').trim();
  if (!value) return 'zh';
  const key = value.toLowerCase();
  const map = {
    chinese: 'zh',
    zh: 'zh',
    chinese_simplified: 'zh',
    chinese_traditional: 'zh',
    english: 'en',
    en: 'en',
  };
  return map[key] || value;
}

async function processBlocks(blocks, contentRoot) {
  for (const block of blocks) {
    if (block.parent) {
      // Look for images in the block content
      // Pattern: ![alt](url)
      const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
      let match;
      let newParent = block.parent;
      const replacements = [];

      while ((match = imageRegex.exec(block.parent)) !== null) {
        const fullMatch = match[0];
        const alt = match[1];
        const url = match[2];

        // Check if it's a Notion/S3 image (simplified check)
        // Usually long S3 urls
        if (url.includes('amazonaws.com') || url.includes('notion.so') || url.includes('secure.notion-static.com')) {
          try {
            const filename = await downloadAndSaveImage(url, contentRoot);
            if (filename) {
              // Use /images/notion/filename
              const newUrl = `/images/notion/${filename}`;
              replacements.push({ old: fullMatch, new: `![${alt}](${newUrl})` });
            }
          } catch (err) {
            console.error(`Failed to download image: ${url}`, err.message);
          }
        }
      }

      // Apply replacements
      for (const rep of replacements) {
        newParent = newParent.replace(rep.old, rep.new);
      }
      block.parent = newParent;
    }

    if (block.children && block.children.length > 0) {
      await processBlocks(block.children, contentRoot);
    }
  }
}

async function downloadAndSaveImage(url, contentRoot) {
  // We'll save to static/images/notion
  // contentRoot is usually ./content
  // standard Hugo layout: ./static
  // We need to resolve the project root.
  // Assuming script runs from project root.

  const staticDir = path.resolve('static/images/notion');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  // Generate hash
  const hash = crypto.createHash('md5').update(url.split('?')[0]).digest('hex'); // Hash without query params for stability? 
  // Wait, notion signed urls expire, so the URL changes. 
  // But the file content is same. 
  // If we hash the *content* we need to download first. 
  // If we hash the URL (without query), it might be same for same object?
  // Notion URLs: https://s3.us-west-2.amazonaws.com/.../untitled.png?X-Amz...
  // The path part usually contains a UUID.

  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const filename = path.basename(pathname); // e.g. untitled.png
    const ext = path.extname(filename) || '.png';
    // Use a simpler hash technique: MD5 of the pure path
    const pathHash = crypto.createHash('md5').update(pathname).digest('hex');
    const finalFilename = `${pathHash}${ext}`;
    const destPath = path.join(staticDir, finalFilename);

    // If exists, skip?
    // If signed urls change but content doesn't, we want to skip downloading if we have it.
    if (fs.existsSync(destPath)) {
      return finalFilename;
    }

    if (process.env.DRY_RUN || process.argv.includes('--dry-run')) {
      console.log(`[DryRun] Would download ${url} to ${destPath}`);
      return finalFilename;
    }

    await downloadFile(url, destPath);
    console.log(`Downloaded image: ${finalFilename}`);
    return finalFilename;
  } catch (e) {
    console.warn("Invalid URL or download error", e);
    return null;
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 400) {
        reject(new Error(`Status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}
