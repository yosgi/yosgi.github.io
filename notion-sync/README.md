# Notion to Hugo Sync Tool

A Go-based tool to synchronize content from Notion databases to Hugo static site generator.

## Features

- 🔄 **Automatic Sync**: Syncs Notion database pages to Hugo content
- 🌍 **Multi-language Support**: Automatically detects and organizes content by language (Chinese/English)
- 📝 **Rich Content Conversion**: Converts Notion blocks to Markdown format
- 🏷️ **Metadata Extraction**: Extracts frontmatter from Notion properties
- 🤖 **CI/CD Integration**: GitHub Actions workflow for automated synchronization
- ✅ **API Testing**: Built-in connection and configuration testing

## Project Structure

```
notion-sync/
├── cmd/
│   ├── sync/        # Main sync command
│   └── test/        # API connection test command
├── notion/          # Notion API client
│   ├── client.go    # API client implementation
│   └── types.go     # Type definitions
└── sync/            # Sync logic
    ├── syncer.go    # Core synchronization logic
    └── converter.go # Notion to Markdown converter
```

## Prerequisites

- Go 1.21 or higher
- Notion API key
- Notion database ID

## Setup

### 1. Get Notion API Credentials

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the API key
4. Share your database with the integration
5. Copy the database ID from the database URL

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Notion API Settings
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_database_id_here

# Hugo Blog Settings
HUGO_CONTENT_DIR=./content
HUGO_IMAGE_DIR=./static/images

# Sync Settings
MAX_RETRIES=3
RETRY_DELAY=1000
BATCH_SIZE=10
```

### 3. Install Dependencies

```bash
cd notion-sync
go mod download
```

## Usage

### Test API Connection

Before syncing, test your Notion API connection:

```bash
go run cmd/test/main.go
```

This will verify:
- ✅ API key is valid
- ✅ Database is accessible
- ✅ Required properties exist
- ✅ Pages can be queried

### Run Sync

Synchronize all pages from Notion to Hugo:

```bash
go run cmd/sync/main.go
```

Or build and run:

```bash
go build -o notion-sync cmd/sync/main.go
./notion-sync
```

### Build for Production

```bash
make build
```

## Notion Database Schema

The tool expects the following properties in your Notion database:

| Property Name | Type         | Required | Description                    |
|---------------|--------------|----------|--------------------------------|
| Title         | Title        | ✅       | Page title                     |
| Date          | Date         | ✅       | Publication date               |
| Status        | Select       | ✅       | Publication status             |
| Description   | Rich Text    | ❌       | Meta description               |
| Summary       | Rich Text    | ❌       | Content summary                |
| Tags          | Multi-select | ❌       | Content tags                   |
| Categories    | Multi-select | ❌       | Content categories             |
| Language      | Select       | ❌       | Content language               |
| Featured      | Checkbox     | ❌       | Featured flag                  |
| Keywords      | Multi-select | ❌       | SEO keywords                   |

## GitHub Actions Workflow

The included GitHub Actions workflow automatically syncs content from Notion and deploys to GitHub Pages.

### Features

- 📅 Scheduled daily sync at 9:00 AM UTC
- 🔘 Manual trigger with options
- ✅ API connection testing before sync
- 🚀 Automatic Hugo build and deployment
- 📊 Job summary with change detection

### Setup GitHub Actions

1. Add secrets to your GitHub repository:
   - `NOTION_API_KEY`: Your Notion API key
   - `NOTION_DATABASE_ID`: Your Notion database ID
   - `CUSTOM_DOMAIN`: (Optional) Your custom domain

2. Enable GitHub Pages in repository settings

3. The workflow will run automatically or can be triggered manually

### Manual Trigger Options

- **Clear cache**: Force re-sync all content
- **Force deploy**: Deploy even if no changes detected

## How It Works

### Content Synchronization Flow

```
Notion Database
    ↓
Query all pages
    ↓
For each page:
  1. Fetch page properties
  2. Fetch page content blocks
  3. Convert blocks to Markdown
  4. Generate Hugo frontmatter
  5. Detect language (zh/en)
  6. Save to appropriate directory
    ↓
Hugo Content Directory
```

### Language Detection

The tool automatically detects content language:
- Content with Chinese characters → `content/zh/post/`
- Content without Chinese characters → `content/en/post/`

### Filename Generation

Filenames are sanitized from the title:
- Keeps alphanumeric characters and Chinese characters
- Replaces invalid characters with hyphens
- Example: `Building MCP2: How We Cut...` → `Building-MCP2-How-We-Cut-...md`

## Supported Notion Blocks

The tool converts the following Notion block types to Markdown:

- ✅ Paragraphs
- ✅ Headings (H1, H2, H3)
- ✅ Bulleted lists
- ✅ Numbered lists
- ✅ Code blocks (with syntax highlighting)
- ✅ Images (external and uploaded)
- ✅ Rich text formatting (bold, italic, code)

## Error Handling

Common errors and solutions:

### 401 Unauthorized
- Check if `NOTION_API_KEY` is correct
- Ensure API key starts with `secret_`
- Verify the integration is activated

### 404 Not Found
- Verify `NOTION_DATABASE_ID` is correct (32 characters)
- Ensure the integration has access to the database

### 403 Forbidden
- Share the database with your integration
- Check workspace permissions

## Development

### Run Tests

```bash
go test ./...
```

### Code Structure

- **notion/client.go**: Handles all Notion API requests
- **notion/types.go**: Defines data structures for Notion API
- **sync/syncer.go**: Orchestrates the synchronization process
- **sync/converter.go**: Converts Notion content to Hugo format

### Adding New Block Types

To support additional Notion block types:

1. Add type definition to `notion/types.go`
2. Add conversion logic to `sync/converter.go`
3. Update `ConvertBlockToMarkdown` function

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License

## Author

Yosgi

## Changelog

### Version 1.0.0
- Initial release
- Basic Notion to Hugo synchronization
- Multi-language support
- GitHub Actions workflow
- API connection testing
