package sync

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/yosgi/notion-sync/notion"
)

// Config holds sync configuration
type Config struct {
	NotionAPIKey     string
	NotionDatabaseID string
	HugoContentDir   string
	ImageDir         string
}

// Syncer handles syncing from Notion to Hugo
type Syncer struct {
	client *notion.Client
	config *Config
}

// NewSyncer creates a new syncer
func NewSyncer(config *Config) *Syncer {
	return &Syncer{
		client: notion.NewClient(config.NotionAPIKey),
		config: config,
	}
}

// SyncAll syncs all pages from Notion to Hugo
func (s *Syncer) SyncAll() error {
	if s.config.NotionAPIKey == "" {
		return fmt.Errorf("NOTION_API_KEY is not set")
	}

	if s.config.NotionDatabaseID == "" {
		return fmt.Errorf("NOTION_DATABASE_ID is not set")
	}

	fmt.Println("Starting to sync articles from Notion...")

	response, err := s.client.QueryDatabase(s.config.NotionDatabaseID, nil)
	if err != nil {
		return fmt.Errorf("failed to query database: %w", err)
	}

	fmt.Printf("Found %d pages\n", len(response.Results))

	for _, page := range response.Results {
		if err := s.SyncPage(page); err != nil {
			fmt.Printf("Error syncing page %s: %v\n", page.ID, err)
			continue
		}
	}

	fmt.Println("Sync completed!")
	return nil
}

// SyncPage synchronizes a single page from Notion to Hugo
func (s *Syncer) SyncPage(page notion.Page) error {
	// Extract page title for logging purposes
	title := "Untitled"
	if titleProp, ok := page.Properties["Name"]; ok && len(titleProp.Title) > 0 {
		title = titleProp.Title[0].PlainText
	}

	fmt.Printf("Processing page: %s\n", title)

	// Fetch all blocks (content) from the Notion page
	blocks, err := s.client.GetBlockChildren(page.ID)
	if err != nil {
		return fmt.Errorf("failed to get page content: %w", err)
	}

	// Convert Notion blocks to Markdown format
	var markdownContent strings.Builder
	for _, block := range blocks.Results {
		markdownContent.WriteString(ConvertBlockToMarkdown(block))
	}

	contentStr := markdownContent.String()

	// Generate Hugo frontmatter from Notion properties and content
	frontmatter := GenerateFrontmatter(page, contentStr)
	frontmatterStr := FormatFrontmatter(frontmatter)

	// Combine frontmatter and content to create complete Hugo post
	fullContent := fmt.Sprintf("---\n%s---\n\n%s",
		frontmatterStr,
		contentStr)

	// Detect content language (Chinese or English)
	language := DetectLanguage(fullContent)

	// Generate safe filename and construct target path
	fileName := SanitizeFileName(frontmatter.Title) + ".md"
	targetPath := filepath.Join(s.config.HugoContentDir, language, "post", fileName)

	// Create target directory if it doesn't exist
	targetDir := filepath.Dir(targetPath)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write the complete content to file
	if err := os.WriteFile(targetPath, []byte(fullContent), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	fmt.Printf("Synced: %s\n", fileName)
	return nil
}
