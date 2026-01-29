#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  const pages = await queryAllPages(notion, CONFIG.notionDatabaseId, CONFIG.publishedStatus, CONFIG.pageSize);

  let written = 0;
  let skipped = 0;

  for (const page of pages) {
    const props = page.properties || {};
    const title = getTitle(props, CONFIG.titleProperty, CONFIG.nameFallbackProperty) || 'Untitled';
    const hugoPath = getRichText(props[CONFIG.hugoPathProperty]);
    const langRaw = getSelect(props[CONFIG.languageProperty]) || CONFIG.defaultLang;
    const lang = normalizeLang(langRaw);

    const slug = normalizeSlug(title) || page.id;
    const outputPath = resolveOutputPath(CONFIG.hugoContentDir, lang, CONFIG.hugoPostDir, slug, hugoPath);

    const lastEdited = page.last_edited_time || '';
    const cacheKey = page.id;
    const cached = cache.pages[cacheKey];
    if (cached && cached.lastEdited === lastEdited && fs.existsSync(outputPath)) {
      skipped += 1;
      continue;
    }

    const mdBlocks = await n2m.pageToMarkdown(page.id);
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
