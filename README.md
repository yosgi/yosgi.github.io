# My Personal Blog

This is a beautiful personal blog website built with Hugo and the Ananke theme.

## ✨ Features

- 🎨 **Modern Design** - Using gradient colors and modern UI elements
- 📱 **Responsive Layout** - Perfect adaptation to various device sizes
- ⚡ **Lightning Fast Loading** - Hugo static site generator with extremely fast build speed
- 🔍 **SEO Optimized** - Built-in search engine optimization features
- 📝 **Markdown Support** - Write content using Markdown
- 🏷️ **Tag Categories** - Support for article tags and categories
- 📊 **Social Sharing** - Built-in social media sharing functionality

## 🚀 Quick Start

### 1. Install Hugo

```bash
# macOS
brew install hugo

# Windows
choco install hugo

# Linux
sudo apt-get install hugo
```

### 2. Clone Project

```bash
git clone <your-repo-url>
cd yosgi-hugo-blog
```

### 3. Start Development Server

```bash
hugo server -D
```

Visit http://localhost:1313 to view the website.

### 4. Build Production Version

```bash
hugo
```

Generated files are in the `public` directory.

## 📁 Project Structure

```
├── content/           # Website content
│   ├── posts/         # Blog posts
│   ├── about.md       # About page
│   ├── contact.md      # Contact page
│   └── _index.md      # Homepage content
├── static/            # Static resources
│   ├── css/           # Custom styles
│   └── favicon.svg    # Website icon
├── themes/            # Theme files
├── hugo.toml          # Configuration file
└── README.md          # Project description
```

## 🎨 Custom Styles

Custom style file is located at `static/css/custom.css`, including:

- Modern color scheme
- Card hover effects
- Gradient backgrounds
- Responsive grid layout
- Custom scrollbars

## 📝 Adding Content

### Create New Post

```bash
hugo new posts/post-title.md
```

### Create New Page

```bash
hugo new page-name.md
```

## 🔧 Configuration

Main configuration is in the `hugo.toml` file:

- `baseURL`: Website domain
- `title`: Website title
- `author`: Author information
- `params.social`: Social media links
- `menu.main`: Navigation menu

## 📱 Social Media Configuration

Configure your social media accounts in `hugo.toml`:

```toml
[params.ananke.social.follow]
networks = ["github", "twitter", "linkedin", "email"]
```

## 🚀 Deployment

### GitHub Pages

1. Push code to GitHub
2. Enable GitHub Pages in repository settings
3. Select `public` directory as source

### Netlify

1. Connect GitHub repository
2. Build command: `hugo`
3. Publish directory: `public`

### Vercel

1. Import GitHub repository
2. Framework preset: Hugo
3. Auto deploy

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

*Thank you for using my blog template!* ✨
