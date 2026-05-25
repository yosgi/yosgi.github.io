# Personal Blog

A bilingual Hugo blog with Obsidian-first authoring.

## What Changed

This repository now treats local Markdown as the source of truth. Instead of syncing posts from Notion, you write in Obsidian and sync Markdown back into this repo before publishing.

## Features

- Hugo static site
- English and Chinese content
- Obsidian-compatible Markdown workflow
- GitHub Pages deployment
- Google-based translation helper

## Quick Start

```bash
brew install hugo
git clone <repo-url>
cd yosgi-hugo-blog
hugo server -D
```

Preview at `http://localhost:1313`.

## iCloud + Mobile Workflow

For iPhone editing, use the iCloud Obsidian vault at:

`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/yosgi-blog-vault`

Write in that vault on mobile, then sync back into the repo on your Mac:

```bash
pnpm sync:icloud
```

Important: GitHub Actions does not read directly from iCloud. It only deploys after you sync the vault back into this repo and push the changes to GitHub.

If you want one command for the whole flow on your Mac:

```bash
pnpm publish:icloud
```

That command runs sync, Hugo build, `git add`, `git commit`, and `git push` on the current branch.

Detailed setup is in [docs/OBSIDIAN_SETUP_GUIDE.md](/Users/yosgi/freelancer/yosgi-hugo-blog/docs/OBSIDIAN_SETUP_GUIDE.md).

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm new:zh -- "文章标题"
pnpm new:en -- "Post Title"
pnpm sync:icloud
pnpm publish:icloud
```

You can also create files manually in Obsidian if you prefer.

## Translation

```bash
python3 tools/translate_with_google.py content/en/post/file.md
```

Requires `GOOGLE_API_KEY` in `.env`.

## Project Structure

```text
├── content/en/          # English posts and pages
├── content/zh/          # Chinese posts and pages
├── static/images/       # Post images
├── .obsidian/templates/ # Obsidian post templates
├── tools/               # Translation and maintenance scripts
└── hugo.toml            # Hugo configuration
```

## Deployment

GitHub Pages deploys on push to `master`.

## Legacy Notion Files

The old Notion sync scripts are kept in the repo as legacy migration material, but they are no longer part of the active publishing flow.
