package sync

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/yosgi/notion-sync/notion"
)

// ConvertRichText converts rich text array to markdown string
func ConvertRichText(richText []notion.RichText) string {
	var result strings.Builder

	for _, text := range richText {
		content := text.PlainText

		if text.Annotations.Bold {
			content = "**" + content + "**"
		}
		if text.Annotations.Italic {
			content = "*" + content + "*"
		}
		if text.Annotations.Code {
			content = "`" + content + "`"
		}

		result.WriteString(content)
	}

	return result.String()
}

// ConvertBlockToMarkdown converts a Notion block to markdown
func ConvertBlockToMarkdown(block notion.Block) string {
	switch block.Type {
	case "paragraph":
		if block.Paragraph == nil {
			return ""
		}
		return ConvertRichText(block.Paragraph.RichText) + "\n\n"

	case "heading_1":
		if block.Heading1 == nil {
			return ""
		}
		return "# " + ConvertRichText(block.Heading1.RichText) + "\n\n"

	case "heading_2":
		if block.Heading2 == nil {
			return ""
		}
		return "## " + ConvertRichText(block.Heading2.RichText) + "\n\n"

	case "heading_3":
		if block.Heading3 == nil {
			return ""
		}
		return "### " + ConvertRichText(block.Heading3.RichText) + "\n\n"

	case "bulleted_list_item":
		if block.BulletedListItem == nil {
			return ""
		}
		return "- " + ConvertRichText(block.BulletedListItem.RichText) + "\n"

	case "numbered_list_item":
		if block.NumberedListItem == nil {
			return ""
		}
		return "1. " + ConvertRichText(block.NumberedListItem.RichText) + "\n"

	case "code":
		if block.Code == nil {
			return ""
		}
		return fmt.Sprintf("```%s\n%s\n```\n\n",
			block.Code.Language,
			ConvertRichText(block.Code.RichText))

	case "image":
		if block.Image == nil {
			return ""
		}
		imageURL := ""
		if block.Image.Type == "external" && block.Image.External != nil {
			imageURL = block.Image.External.URL
		} else if block.Image.Type == "file" && block.Image.File != nil {
			imageURL = block.Image.File.URL
		}
		caption := ""
		if len(block.Image.Caption) > 0 {
			caption = ConvertRichText(block.Image.Caption)
		}
		return fmt.Sprintf("![%s](%s)\n\n", caption, imageURL)

	default:
		return ""
	}
}

// Frontmatter represents Hugo frontmatter
type Frontmatter struct {
	Title       string   `yaml:"title"`
	Description string   `yaml:"description"`
	Categories  []string `yaml:"categories"`
	Tags        []string `yaml:"tags"`
	Date        string   `yaml:"date"`
	Summary     string   `yaml:"summary"`
}

// GenerateFrontmatter extracts and generates Hugo frontmatter from Notion page properties and content
func GenerateFrontmatter(page notion.Page, content string) *Frontmatter {
	fm := &Frontmatter{
		Title:       "Untitled",
		Description: "",
		Categories:  []string{"uncategorized"},
		Tags:        []string{},
		Date:        "",
		Summary:     "",
	}

	// Try to extract title from content first (first heading has priority)
	// If not found, fall back to Notion properties
	if titleFromContent := ExtractTitleFromContent(content); titleFromContent != "" {
		fm.Title = titleFromContent
	} else if titleProp, ok := page.Properties["Name"]; ok && len(titleProp.Title) > 0 {
		fm.Title = titleProp.Title[0].PlainText
	} else if titleProp, ok := page.Properties["Title"]; ok && len(titleProp.Title) > 0 {
		fm.Title = titleProp.Title[0].PlainText
	}

	// Try to extract date from content first (e.g., "发布日期：2021年03月18日")
	// If not found, fall back to Notion Date property
	if dateFromContent := ExtractDateFromContent(content); dateFromContent != "" {
		fm.Date = dateFromContent
	} else if dateProp, ok := page.Properties["Date"]; ok && dateProp.Date != nil {
		fm.Date = dateProp.Date.Start + " 00:00:00"
	}

	// Extract description from Notion properties
	if descProp, ok := page.Properties["Description"]; ok && len(descProp.RichText) > 0 {
		fm.Description = descProp.RichText[0].PlainText
	}

	// Extract categories from Notion multi-select property
	if catProp, ok := page.Properties["Categories"]; ok && len(catProp.MultiSelect) > 0 {
		fm.Categories = make([]string, 0, len(catProp.MultiSelect))
		for _, item := range catProp.MultiSelect {
			fm.Categories = append(fm.Categories, item.Name)
		}
	}

	// Extract tags from Notion multi-select property
	if tagProp, ok := page.Properties["Tags"]; ok && len(tagProp.MultiSelect) > 0 {
		fm.Tags = make([]string, 0, len(tagProp.MultiSelect))
		for _, item := range tagProp.MultiSelect {
			fm.Tags = append(fm.Tags, item.Name)
		}
	}

	// Extract summary from Notion properties
	if summaryProp, ok := page.Properties["Summary"]; ok && len(summaryProp.RichText) > 0 {
		fm.Summary = summaryProp.RichText[0].PlainText
	}

	return fm
}

// FormatFrontmatter formats frontmatter as YAML
func FormatFrontmatter(fm *Frontmatter) string {
	var result strings.Builder

	result.WriteString(fmt.Sprintf("title: %s\n", fm.Title))
	result.WriteString(fmt.Sprintf("description: %s\n", fm.Description))

	if len(fm.Categories) > 0 {
		result.WriteString("categories:\n")
		for _, cat := range fm.Categories {
			result.WriteString(fmt.Sprintf("  - %s\n", cat))
		}
	}

	if len(fm.Tags) > 0 {
		result.WriteString("tags:\n")
		for _, tag := range fm.Tags {
			result.WriteString(fmt.Sprintf("  - %s\n", tag))
		}
	}

	result.WriteString(fmt.Sprintf("date: %s\n", fm.Date))
	result.WriteString(fmt.Sprintf("summary: %s\n", fm.Summary))

	return result.String()
}

// DetectLanguage detects the language of content by checking for Chinese characters
// Returns "zh" for Chinese content, "en" otherwise
func DetectLanguage(content string) string {
	matched, _ := regexp.MatchString("[\u4e00-\u9fff]", content)
	if matched {
		return "zh"
	}
	return "en"
}

// ExtractDateFromContent extracts date from markdown content using various Chinese date patterns
func ExtractDateFromContent(content string) string {
	// Match Chinese date patterns like "**发布日期：** 2021年03月18日" or "发布日期：2021年03月18日"
	datePatterns := []string{
		`\*\*发布日期：\*\*\s*(\d{4}年\d{1,2}月\d{1,2}日)`, // **发布日期：** 2021年03月18日
		`发布日期：\s*(\d{4}年\d{1,2}月\d{1,2}日)`,          // 发布日期：2021年03月18日
		`\*\*日期：\*\*\s*(\d{4}年\d{1,2}月\d{1,2}日)`,    // **日期：** 2021年03月18日
		`日期：\s*(\d{4}年\d{1,2}月\d{1,2}日)`,             // 日期：2021年03月18日
	}

	for _, pattern := range datePatterns {
		reg := regexp.MustCompile(pattern)
		matches := reg.FindStringSubmatch(content)
		if len(matches) > 1 {
			// Convert Chinese date format to ISO format
			chineseDate := matches[1]
			isoDate := convertChineseDateToISO(chineseDate)
			return isoDate + " 00:00:00"
		}
	}

	return ""
}

// convertChineseDateToISO converts Chinese date format "2021年03月18日" to ISO format "2021-03-18"
func convertChineseDateToISO(chineseDate string) string {
	reg := regexp.MustCompile(`(\d{4})年(\d{1,2})月(\d{1,2})日`)
	matches := reg.FindStringSubmatch(chineseDate)
	if len(matches) == 4 {
		year := matches[1]
		month := fmt.Sprintf("%02s", matches[2])
		day := fmt.Sprintf("%02s", matches[3])
		return fmt.Sprintf("%s-%s-%s", year, month, day)
	}
	return ""
}

// ExtractTitleFromContent extracts the title from markdown content by finding the first heading
func ExtractTitleFromContent(content string) string {
	// Match first heading (# title)
	reg := regexp.MustCompile(`^#\s+(.+)$`)
	matches := reg.FindStringSubmatch(content)
	if len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}
	return ""
}

// SanitizeFileName creates a valid and safe filename from a title by replacing invalid characters
func SanitizeFileName(title string) string {
	// Replace invalid filename characters with hyphens, allowing alphanumeric and Chinese characters
	reg := regexp.MustCompile(`[^a-zA-Z0-9\p{Han}]+`)
	return reg.ReplaceAllString(title, "-")
}
