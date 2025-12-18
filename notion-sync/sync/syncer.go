package sync

import (
	"crypto/md5"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

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

	// Filter to only sync pages with Status = "Published"
	filter := map[string]interface{}{
		"property": "Status",
		"select": map[string]interface{}{
			"equals": "Published",
		},
	}

	response, err := s.client.QueryDatabase(s.config.NotionDatabaseID, filter)
	if err != nil {
		return fmt.Errorf("failed to query database: %w", err)
	}

	fmt.Printf("Found %d published pages\n", len(response.Results))

	syncedCount := 0
	for _, page := range response.Results {
		if err := s.SyncPage(page); err != nil {
			fmt.Printf("Error syncing page %s: %v\n", page.ID, err)
			continue
		}
		syncedCount++
	}

	fmt.Printf("Sync completed! Successfully synced %d pages\n", syncedCount)
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

	// Collect all image URLs and download them
	imagePathMap := make(map[string]string)
	for _, block := range blocks.Results {
		if block.Type == "image" && block.Image != nil {
			imageURL := ""
			if block.Image.Type == "external" && block.Image.External != nil {
				imageURL = block.Image.External.URL
			} else if block.Image.Type == "file" && block.Image.File != nil {
				imageURL = block.Image.File.URL
			}

			if imageURL != "" {
				localPath, err := s.downloadImage(imageURL, title)
				if err != nil {
					fmt.Printf("Warning: Failed to download image %s: %v\n", imageURL, err)
					// Continue with original URL if download fails
				} else {
					imagePathMap[imageURL] = localPath
				}
			}
		}
	}

	// Convert Notion blocks to Markdown format
	var markdownContent strings.Builder
	for _, block := range blocks.Results {
		markdownContent.WriteString(ConvertBlockToMarkdown(block, imagePathMap))
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

	// Clean up old files that might have been created with incorrect naming
	// (e.g., files starting with "-" due to previous SanitizeFileName issues)
	if err := s.cleanupOldFiles(targetDir, frontmatter.Title, fileName); err != nil {
		fmt.Printf("Warning: Failed to cleanup old files: %v\n", err)
	}

	// Write the complete content to file
	if err := os.WriteFile(targetPath, []byte(fullContent), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	fmt.Printf("Synced: %s\n", fileName)
	return nil
}

// downloadImage downloads an image from URL and saves it locally
// Returns the local path relative to Hugo static directory
func (s *Syncer) downloadImage(imageURL, postTitle string) (string, error) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Download the image
	resp, err := client.Get(imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download image: status code %d", resp.StatusCode)
	}

	// Determine file extension from Content-Type or URL
	ext := ".png" // default
	contentType := resp.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "image/") {
		ext = "." + strings.TrimPrefix(contentType, "image/")
		if ext == ".jpeg" {
			ext = ".jpg"
		}
	} else {
		// Try to get extension from URL
		if strings.Contains(imageURL, ".") {
			parts := strings.Split(imageURL, ".")
			if len(parts) > 0 {
				lastPart := strings.ToLower(parts[len(parts)-1])
				// Remove query parameters
				if idx := strings.Index(lastPart, "?"); idx != -1 {
					lastPart = lastPart[:idx]
				}
				if lastPart == "jpg" || lastPart == "jpeg" || lastPart == "png" || lastPart == "gif" || lastPart == "webp" {
					ext = "." + lastPart
				}
			}
		}
	}

	// Create directory name from post title
	dirName := SanitizeFileName(postTitle)
	if dirName == "" {
		dirName = "images"
	}

	// Generate unique filename using MD5 hash of URL
	hash := md5.Sum([]byte(imageURL))
	urlHash := fmt.Sprintf("%x", hash)[:8]
	fileName := fmt.Sprintf("img_%s%s", urlHash, ext)

	// Create target directory
	targetDir := filepath.Join(s.config.ImageDir, dirName)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create image directory: %w", err)
	}

	// Save the image
	targetPath := filepath.Join(targetDir, fileName)
	file, err := os.Create(targetPath)
	if err != nil {
		return "", fmt.Errorf("failed to create image file: %w", err)
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	// Return path relative to Hugo static directory
	// Hugo copies static/ directory to site root, so if file is in static/images/post-title/img.png
	// the URL path should be /images/post-title/img.png
	// Extract path after "static" from ImageDir
	staticPath := s.config.ImageDir
	if idx := strings.Index(staticPath, "static"); idx != -1 {
		// Get path after "static/"
		afterStatic := strings.TrimPrefix(staticPath[idx+6:], "/")
		// Remove leading "./" if present
		afterStatic = strings.TrimPrefix(afterStatic, "./")
		return fmt.Sprintf("/%s/%s/%s", afterStatic, dirName, fileName), nil
	}

	// Fallback: assume ImageDir is relative to static, extract last part
	parts := strings.Split(strings.TrimPrefix(staticPath, "./"), "/")
	if len(parts) > 0 {
		lastPart := parts[len(parts)-1]
		return fmt.Sprintf("/%s/%s/%s", lastPart, dirName, fileName), nil
	}

	return fmt.Sprintf("/images/%s/%s", dirName, fileName), nil
}

// cleanupOldFiles removes old files that might have been created with incorrect naming
// This handles cases where files were created with leading hyphens or other naming issues
func (s *Syncer) cleanupOldFiles(targetDir, title, correctFileName string) error {
	// Get all files in the target directory
	files, err := os.ReadDir(targetDir)
	if err != nil {
		return err
	}

	// Generate the sanitized title for comparison
	sanitizedTitle := SanitizeFileName(title)
	correctBaseName := strings.TrimSuffix(correctFileName, ".md")

	// Remove old files that match the pattern
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		fileName := file.Name()
		// Skip the correct file
		if fileName == correctFileName {
			continue
		}

		// Remove files that start with "-" and likely match this article
		if strings.HasPrefix(fileName, "-") {
			fileNameWithoutExt := strings.TrimSuffix(fileName, ".md")
			// Check if it contains the sanitized title (without leading hyphen)
			if strings.Contains(fileNameWithoutExt, sanitizedTitle) ||
				strings.Contains(fileNameWithoutExt[1:], correctBaseName) {
				oldPath := filepath.Join(targetDir, fileName)
				if err := os.Remove(oldPath); err != nil {
					fmt.Printf("Warning: Failed to remove old file %s: %v\n", fileName, err)
				} else {
					fmt.Printf("Removed old file: %s\n", fileName)
				}
			}
		}
	}

	return nil
}
