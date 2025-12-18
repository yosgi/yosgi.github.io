#!/usr/bin/env node

/**
 * Fix legacy code fences that look like:
 *
 * ```
 *
 * javascript
 * console.log('foo')
 * ```
 *
 * and rewrite them to the standard triple-backtick fence:
 *
 * ```javascript
 * console.log('foo')
 * ```
 *
 * Usage:
 *   node tools/fix-codefences.js            # fix all content/{en,zh}/post markdown
 *   node tools/fix-codefences.js --dry-run  # show what would change without writing
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const roots =
  args.filter((a) => !a.startsWith("--")).length > 0
    ? args.filter((a) => !a.startsWith("--"))
    : ["content/en/post", "content/zh/post"];

const fencePattern =
  /```[ \t]*\n[ \t]*\n?[ \t]*([A-Za-z0-9#+.-]+)[ \t]*\n/g;

let filesSeen = 0;
let filesChanged = 0;
let replacements = 0;

const fixFile = (file) => {
  const original = fs.readFileSync(file, "utf8");
  let localReplacements = 0;
  const updated = original.replace(fencePattern, (_match, lang) => {
    localReplacements += 1;
    return `\`\`\`${lang}\n`;
  });

  if (localReplacements > 0) {
    replacements += localReplacements;
    filesChanged += 1;
    const message = `${dryRun ? "[dry]" : "[fix]"} ${file} (${localReplacements})`;
    console.log(message);
    if (!dryRun) {
      fs.writeFileSync(file, updated, "utf8");
    }
  }
};

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && full.endsWith(".md")) {
      filesSeen += 1;
      fixFile(full);
    }
  }
};

roots.forEach((root) => walk(root));

console.log(
  `Done. Scanned ${filesSeen} files, fixed ${filesChanged}, replacements ${replacements}${
    dryRun ? " (dry-run)" : ""
  }.`
);
