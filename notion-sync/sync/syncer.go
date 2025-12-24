package sync

import (
	"crypto/md5"
	"fmt"
	"io"
	"net/http"
	"net/url"
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
	// Extract initial page title for logging (will be updated after content parsing)
	initialTitle := "Untitled"
	if titleProp, ok := page.Properties["Name"]; ok && len(titleProp.Title) > 0 {
		initialTitle = titleProp.Title[0].PlainText
	}

	fmt.Printf("Processing page: %s\n", initialTitle)

	// Fetch all blocks (content) from the Notion page with pagination support
	var allBlocks []notion.Block
	var cursor string

	for {
		blocks, err := s.client.GetBlockChildren(page.ID, cursor)
		if err != nil {
			return fmt.Errorf("failed to get page content: %w", err)
		}

		// Add blocks from this page to the collection
		allBlocks = append(allBlocks, blocks.Results...)

		// Check if there are more blocks to fetch
		if !blocks.HasMore {
			break
		}

		// Set cursor for next page
		cursor = blocks.NextCursor
		if cursor == "" {
			break
		}
	}

	fmt.Printf("  Fetched %d blocks\n", len(allBlocks))

	var err error
	allBlocks, err = s.hydrateBlocks(allBlocks)
	if err != nil {
		return fmt.Errorf("failed to fetch block children: %w", err)
	}

	// First, convert blocks to markdown temporarily to extract title from content
	// This allows us to get the correct title before downloading images
	var tempMarkdownContent strings.Builder
	tempMarkdownContent.WriteString(ConvertBlocksToMarkdown(allBlocks, nil, 0))
	tempContentStr := tempMarkdownContent.String()

	// Generate Hugo frontmatter from Notion properties and content
	// This will extract the title from content if available
	frontmatter := GenerateFrontmatter(page, tempContentStr)

	// Use the frontmatter title for logging and image directory naming
	actualTitle := frontmatter.Title
	if actualTitle == "" || actualTitle == "Untitled" {
		// Fallback to property title if frontmatter title is still Untitled
		if titleProp, ok := page.Properties["Name"]; ok && len(titleProp.Title) > 0 {
			actualTitle = titleProp.Title[0].PlainText
		} else if titleProp, ok := page.Properties["Title"]; ok && len(titleProp.Title) > 0 {
			actualTitle = titleProp.Title[0].PlainText
		}
	}

	if initialTitle != actualTitle {
		fmt.Printf("  Using title: %s\n", actualTitle)
	}

	// Collect all image URLs and download them using the correct title
	imagePathMap := make(map[string]string)
	normalizedPathMap := make(map[string]string)
	s.collectImagePaths(allBlocks, imagePathMap, normalizedPathMap, actualTitle)

	// Convert Notion blocks to Markdown format with correct image paths
	var markdownContent strings.Builder
	markdownContent.WriteString(ConvertBlocksToMarkdown(allBlocks, imagePathMap, 0))

	contentStr := markdownContent.String()
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

func (s *Syncer) hydrateBlocks(blocks []notion.Block) ([]notion.Block, error) {
	for i := range blocks {
		if !blocks[i].HasChildren {
			continue
		}

		children, err := s.getAllBlockChildren(blocks[i].ID)
		if err != nil {
			return nil, err
		}

		children, err = s.hydrateBlocks(children)
		if err != nil {
			return nil, err
		}

		blocks[i].Children = children
	}
	return blocks, nil
}

func (s *Syncer) getAllBlockChildren(blockID string) ([]notion.Block, error) {
	var allBlocks []notion.Block
	var cursor string

	for {
		blocks, err := s.client.GetBlockChildren(blockID, cursor)
		if err != nil {
			return nil, err
		}

		allBlocks = append(allBlocks, blocks.Results...)

		if !blocks.HasMore {
			break
		}

		cursor = blocks.NextCursor
		if cursor == "" {
			break
		}
	}

	return allBlocks, nil
}

func (s *Syncer) collectImagePaths(blocks []notion.Block, imagePathMap map[string]string, normalizedPathMap map[string]string, postTitle string) {
	for _, block := range blocks {
		if block.Type == "image" && block.Image != nil {
			imageURL := ""
			if block.Image.Type == "external" && block.Image.External != nil {
				imageURL = block.Image.External.URL
			} else if block.Image.Type == "file" && block.Image.File != nil {
				imageURL = block.Image.File.URL
			}

			if imageURL != "" {
				normalizedURL := normalizeImageURL(imageURL)
				if cachedPath, ok := normalizedPathMap[normalizedURL]; ok {
					imagePathMap[imageURL] = cachedPath
				} else {
					localPath, err := s.downloadImage(imageURL, postTitle)
					if err != nil {
						fmt.Printf("Warning: Failed to download image %s: %v\n", imageURL, err)
					} else {
						imagePathMap[imageURL] = localPath
						normalizedPathMap[normalizedURL] = localPath
					}
				}
			}
		}

		if block.HasChildren && len(block.Children) > 0 {
			s.collectImagePaths(block.Children, imagePathMap, normalizedPathMap, postTitle)
		}
	}
}

func normalizeImageURL(imageURL string) string {
	parsed, err := url.Parse(imageURL)
	if err != nil {
		return imageURL
	}
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed.String()
}

// downloadImage downloads an image from URL and saves it locally
// Returns the local path relative to Hugo static directory
func (s *Syncer) downloadImage(imageURL, postTitle string) (string, error) {
	// Create directory name from post title
	dirName := SanitizeFileName(postTitle)
	if dirName == "" {
		dirName = "images"
	}

	normalizedURL := normalizeImageURL(imageURL)

	// Generate unique filename using MD5 hash of normalized URL
	// We need to determine extension first, but we'll try common extensions
	hash := md5.Sum([]byte(normalizedURL))
	urlHash := fmt.Sprintf("%x", hash)[:8]

	// Try to determine extension from URL first
	ext := ".png" // default
	if strings.Contains(normalizedURL, ".") {
		parts := strings.Split(normalizedURL, ".")
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

	fileName := fmt.Sprintf("img_%s%s", urlHash, ext)

	// Create target directory
	targetDir := filepath.Join(s.config.ImageDir, dirName)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create image directory: %w", err)
	}

	// Check if file already exists
	targetPath := filepath.Join(targetDir, fileName)
	fileInfo, fileExists := os.Stat(targetPath)

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create request with conditional headers if file exists
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// If file exists, add If-Modified-Since header to check if it needs update
	if fileExists == nil && !fileInfo.ModTime().IsZero() {
		req.Header.Set("If-Modified-Since", fileInfo.ModTime().UTC().Format(http.TimeFormat))
	}

	// Download the image
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	// If server returned 304 Not Modified, file is up to date
	if resp.StatusCode == http.StatusNotModified {
		return s.getImagePath(targetPath, dirName, fileName)
	}

	if resp.StatusCode != http.StatusOK {
		// If file exists but server returned error, return existing file path
		if fileExists == nil {
			return s.getImagePath(targetPath, dirName, fileName)
		}
		return "", fmt.Errorf("failed to download image: status code %d", resp.StatusCode)
	}

	// If file exists but server returned 200, it means the file may have been updated
	// Remove old file before downloading new one
	if fileExists == nil {
		if err := os.Remove(targetPath); err != nil {
			fmt.Printf("Warning: Failed to remove old image %s: %v\n", fileName, err)
		}
	}

	// Update extension based on Content-Type if available
	contentType := resp.Header.Get("Content-Type")
	if strings.HasPrefix(contentType, "image/") {
		newExt := "." + strings.TrimPrefix(contentType, "image/")
		if newExt == ".jpeg" {
			newExt = ".jpg"
		}
		// If extension changed, update filename
		if newExt != ext {
			fileName = fmt.Sprintf("img_%s%s", urlHash, newExt)
			targetPath = filepath.Join(targetDir, fileName)
		}
	}

	// Save the image
	file, err := os.Create(targetPath)
	if err != nil {
		return "", fmt.Errorf("failed to create image file: %w", err)
	}
	defer file.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return s.getImagePath(targetPath, dirName, fileName)
}

// getImagePath returns the path relative to Hugo static directory
func (s *Syncer) getImagePath(targetPath, dirName, fileName string) (string, error) {

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
