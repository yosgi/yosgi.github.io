#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

const langFlagIndex = args.indexOf("--lang");
const lang = langFlagIndex >= 0 ? args[langFlagIndex + 1] : "zh";
const title = args.filter((arg, index) => index !== langFlagIndex && index !== langFlagIndex + 1)[0];

if (!title) {
  console.error('Usage: node scripts/new-post.js --lang <zh|en> "Post Title"');
  process.exit(1);
}

if (!["zh", "en"].includes(lang)) {
  console.error('Language must be "zh" or "en".');
  process.exit(1);
}

const slug = slugify(title);
const postDir = path.resolve(__dirname, "..", "content", lang, "post");
const filePath = path.join(postDir, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`File already exists: ${filePath}`);
  process.exit(1);
}

fs.mkdirSync(postDir, { recursive: true });
fs.writeFileSync(filePath, buildTemplate(title), "utf8");

console.log(filePath);

function buildTemplate(postTitle) {
  const today = new Date().toISOString().slice(0, 10);
  const body = lang === "zh" ? "在这里开始写正文。\n" : "Start writing here.\n";

  return [
    "---",
    `title: ${quoteYaml(postTitle)}`,
    'description: ""',
    "categories:",
    "  - Technology",
    "tags: []",
    `date: ${today} 00:00:00`,
    "draft: true",
    "---",
    "",
    body,
  ].join("\n");
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function quoteYaml(value) {
  return JSON.stringify(value);
}
