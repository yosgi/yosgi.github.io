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
git clone git@github.com:yosgi/yosgi.github.io.git
cd yosgi.github.io
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

Important: GitHub Actions does not read directly from iCloud. It only deploys after you sync the vault back into this repo and push the changes to GitHub. The sync script uses `rsync --delete` for posts and images, so write new posts in the vault first; a post created only in this repository will be removed by the next sync.

If you want one command for the whole flow on your Mac:

```bash
pnpm publish:icloud
```

That command runs sync, Hugo build, `git add`, `git commit`, and `git push` on the current branch.

Detailed setup is in [docs/OBSIDIAN_SETUP_GUIDE.md](docs/OBSIDIAN_SETUP_GUIDE.md).

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

## Site presentation

- `hugo.toml` defines the primary domain, project previews and the three featured articles in each language. Latest articles are selected by publication date.
- Shared interface strings live in `i18n/`. Topic groups and explicitly ordered reading series live in `data/topics.json` and `data/reading_series.json`.
- New project and topic indexes use `content/<lang>/projects.md` and `topics.md`. Existing article URLs are preserved.
- Modification dates use an explicit article `lastmod`, then Git author history, then publication date. Keep full Git history in CI; avoid filesystem modification times.
- Local Markdown images are processed into responsive WebP variants through the `static/images` asset mount. Originals remain available. New screenshots must also be copied into the iCloud vault because the publishing sync uses `rsync --delete` for images.
- Search loads its index and Fuse only on first use. Mermaid is loaded for diagram pages; KaTeX is loaded for detected block formulas or explicit article `math: true` (required for inline `$…$` formulas).
- Validate a production build with `hugo --minify` followed by `python3 tools/check_site.py public`. GitHub Actions runs this check before deployment.
