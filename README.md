# Personal Blog

A personal blog website built with Hugo and modern automation features.

## Features

- **Modern Design** - Clean and responsive layout
- **Fast Loading** - Hugo static site generator
- **SEO Optimized** - Built-in search engine optimization
- **Markdown Support** - Write content using Markdown
- **Multilingual** - Support for English and Chinese content

## Automation

- **Notion Sync** - Daily automatic content sync from Notion database
- **Google Translation** - Batch translation from Chinese to English
- **Auto Deploy** - Automatic build and deployment to GitHub Pages
- **Smart Caching** - Efficient processing with change detection

## Quick Start

### Setup

```bash
# Install Hugo
brew install hugo  # macOS
# or use your package manager

# Clone and run
git clone <repo-url>
cd yosgi-hugo-blog
hugo server -D
```

Visit http://localhost:1313 to preview.

### Production Build

```bash
hugo  # Output in public/
```

## Project Structure

```
├── content/en/        # English content
├── content/zh/        # Chinese content  
├── static/            # Static resources
├── themes/            # Theme files
├── notion-sync/       # Notion sync tool
├── tools/             # Translation tools
└── hugo.toml          # Configuration
```

## Usage

### Notion Integration

Set GitHub Secrets:
- `NOTION_API_KEY` - Your Notion API key
- `NOTION_DATABASE_ID` - Your database ID

Automatic sync runs daily or manually via GitHub Actions.

### Translation

```bash
# Translate content
python3 tools/translate_with_google.py content/en/post/file.md
```

Requires `GOOGLE_API_KEY` in `.env` file.

### Content Management

```bash
# Create new post
hugo new content/en/post/title.md
hugo new content/zh/post/title.md
```

## Configuration

Main settings in `hugo.toml`:
- `baseURL` - Website domain
- `title` - Site title  
- `params` - Theme parameters

## Deployment

Automatic deployment via GitHub Actions to GitHub Pages when content changes.

Manual deployment options:
- **Netlify**: Connect repo, build command `hugo`, publish dir `public`
- **Vercel**: Import repo, framework preset Hugo

## License

MIT License
