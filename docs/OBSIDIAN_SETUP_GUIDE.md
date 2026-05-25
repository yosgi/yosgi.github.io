# Obsidian Setup Guide

## Goal

Use an iCloud-based Obsidian vault for writing on mobile, then sync that content back into the Hugo repository before committing and deploying.

## Recommended Setup

1. Open `/Users/yosgi/Library/Mobile Documents/iCloud~md~obsidian/Documents/yosgi-blog-vault` in Obsidian.
2. Enable the core `Templates` plugin in Obsidian.
3. Set the template folder to `.obsidian/templates`.
4. Keep writing inside `content/zh/post` or `content/en/post`.
5. On your Mac, sync the vault back into the repo with `pnpm sync:icloud`.

## Writing Rules

- One Markdown file equals one post.
- Use Hugo front matter at the top of every file.
- Keep the final published file inside `content/<lang>/post/`.
- Store images under `static/images/<post-slug>/`.
- Reference images with site-root paths such as `/images/my-post/cover.png`.

## New Post Options

### Option 1: Obsidian Templates

Use:

- `.obsidian/templates/zh-post.md`
- `.obsidian/templates/en-post.md`

### Option 2: CLI Scaffold

```bash
pnpm new:zh -- "文章标题"
pnpm new:en -- "Post Title"
```

The script creates the file in the local repo. If you use mobile editing as the primary flow, prefer creating posts in the iCloud vault with Obsidian templates.

## Attachments

Recommended structure:

```text
static/images/
  my-post/
    cover.png
    diagram-1.png
```

In Markdown:

```md
![Cover](/images/my-post/cover.png)
```

## Preview

```bash
pnpm sync:icloud
pnpm dev
```

## Build

```bash
pnpm sync:icloud
pnpm build
```

## One-Command Publish

```bash
pnpm publish:icloud
```

You can also pass a custom commit message:

```bash
zsh scripts/publish-icloud.sh "Publish new mobile draft"
```

## Deployment

GitHub Actions only runs after Git receives new commits. The deployment flow is:

1. Edit on iPhone or Mac inside the iCloud vault.
2. Run `pnpm sync:icloud` or `pnpm publish:icloud` on the Mac.
3. Commit and push the repo changes.
4. GitHub Pages workflow builds and deploys.

## Migration Notes

- Existing posts already live in Markdown, so no content conversion is required.
- The main migration is operational: use Obsidian plus iCloud as the writing layer and sync back into the Hugo repo before publishing.
