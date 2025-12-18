#!/usr/bin/env node

/**
 * Replace `summary: null` in front matter with an empty summary field.
 * Optionally, use first non-empty paragraph as summary when available.
 *
 * Usage:
 *   node tools/fix-summaries.js                 # replace null with empty string
 *   node tools/fix-summaries.js --auto          # try to populate from first paragraph
 *   node tools/fix-summaries.js --dry           # dry-run
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const auto = args.includes("--auto");

const roots = ["content/en/post", "content/zh/post"];

const parseFrontMatter = (text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { header: match[1], body: match[2] };
};

const firstParagraph = (body) => {
  const stripped = body.replace(/`{3}[\s\S]*?`{3}/g, ""); // drop code fences
  const paras = stripped
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras[0] || "";
};

let filesSeen = 0;
let filesChanged = 0;

const processFile = (file) => {
  const text = fs.readFileSync(file, "utf8");
  const fm = parseFrontMatter(text);
  if (!fm) return;

  const lines = fm.header.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^summary:\\s*null\\s*$/.test(lines[i])) {
      let replacement = 'summary: ""';
      if (auto) {
        const para = firstParagraph(fm.body);
        if (para) {
          replacement = "summary: " + JSON.stringify(para.slice(0, 180));
        }
      }
      lines[i] = replacement;
      changed = true;
    }
  }

  if (changed) {
    filesChanged += 1;
    const newHeader = lines.join("\n");
    const output = `---\n${newHeader}\n---\n${fm.body}`;
    if (!dryRun) {
      fs.writeFileSync(file, output, "utf8");
    }
    console.log(`${dryRun ? "[dry]" : "[fix]"} ${file}`);
  }
};

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith(".md")) {
      filesSeen += 1;
      processFile(full);
    }
  }
};

roots.forEach((r) => walk(r));
console.log(`Done. Scanned ${filesSeen}, changed ${filesChanged}${dryRun ? " (dry-run)" : ""}.`);
