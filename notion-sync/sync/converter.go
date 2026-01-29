package sync

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/yosgi/notion-sync/notion"
	"gopkg.in/yaml.v3"
)

// ConvertRichText converts rich text array to markdown string
func ConvertRichText(richText []notion.RichText) string {
	var result strings.Builder

	for _, text := range richText {
		if text.Type == "equation" && text.Equation != nil {
			// Use double backslashes so Markdown preserves \(...\) for KaTeX.
			result.WriteString("\\\\(" + text.Equation.Expression + "\\\\)")
			continue
		}
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

		linkURL := ""
		if text.Text != nil && text.Text.Link != nil {
			linkURL = text.Text.Link.URL
		}
		if linkURL == "" && text.Href != "" {
			linkURL = text.Href
		}
		if linkURL != "" {
			content = fmt.Sprintf("[%s](%s)", content, linkURL)
		}

		result.WriteString(content)
	}

	return result.String()
}

// ConvertBlocksToMarkdown converts Notion blocks to markdown with nesting support.
// imagePathMap maps original image URLs to local paths.
func ConvertBlocksToMarkdown(blocks []notion.Block, imagePathMap map[string]string, indentLevel int) string {
	var result strings.Builder
	for i, block := range blocks {
		result.WriteString(ConvertBlockToMarkdown(block, imagePathMap, indentLevel))
		if indentLevel == 0 && isListBlock(block.Type) {
			nextIsList := i+1 < len(blocks) && isListBlock(blocks[i+1].Type)
			if !nextIsList {
				result.WriteString("\n")
			}
		}
	}
	return result.String()
}

func isListBlock(blockType string) bool {
	return blockType == "bulleted_list_item" || blockType == "numbered_list_item"
}

func addBlockquotePrefix(content string) string {
	lines := strings.Split(content, "\n")
	for i, line := range lines {
		if line == "" {
			lines[i] = ">"
			continue
		}
		lines[i] = "> " + line
	}
	return strings.Join(lines, "\n")
}

func tableRowToCells(row *notion.TableRowBlock) []string {
	if row == nil {
		return nil
	}
	cells := make([]string, 0, len(row.Cells))
	for _, cell := range row.Cells {
		cells = append(cells, ConvertRichText(cell))
	}
	return cells
}

func padCells(cells []string, width int) []string {
	if len(cells) >= width {
		return cells
	}
	padded := make([]string, width)
	copy(padded, cells)
	return padded
}

func renderTableRow(cells []string) string {
	return "| " + strings.Join(cells, " | ") + " |"
}

// ConvertBlockToMarkdown converts a Notion block to markdown.
// imagePathMap maps original image URLs to local paths.
func ConvertBlockToMarkdown(block notion.Block, imagePathMap map[string]string, indentLevel int) string {
	indent := strings.Repeat("  ", indentLevel)
	switch block.Type {
	case "paragraph":
		if block.Paragraph == nil {
			return ""
		}
		text := ConvertRichText(block.Paragraph.RichText)
		if text == "" {
			return ""
		}
		if indentLevel == 0 {
			return text + "\n\n"
		}
		return indent + text + "\n"

	case "heading_1":
		if block.Heading1 == nil {
			return ""
		}
		if indentLevel == 0 {
			return "# " + ConvertRichText(block.Heading1.RichText) + "\n\n"
		}
		return indent + "# " + ConvertRichText(block.Heading1.RichText) + "\n"

	case "heading_2":
		if block.Heading2 == nil {
			return ""
		}
		if indentLevel == 0 {
			return "## " + ConvertRichText(block.Heading2.RichText) + "\n\n"
		}
		return indent + "## " + ConvertRichText(block.Heading2.RichText) + "\n"

	case "heading_3":
		if block.Heading3 == nil {
			return ""
		}
		if indentLevel == 0 {
			return "### " + ConvertRichText(block.Heading3.RichText) + "\n\n"
		}
		return indent + "### " + ConvertRichText(block.Heading3.RichText) + "\n"

	case "bulleted_list_item":
		if block.BulletedListItem == nil {
			return ""
		}
		line := indent + "- " + ConvertRichText(block.BulletedListItem.RichText) + "\n"
		if block.HasChildren && len(block.Children) > 0 {
			line += ConvertBlocksToMarkdown(block.Children, imagePathMap, indentLevel+1)
		}
		return line

	case "numbered_list_item":
		if block.NumberedListItem == nil {
			return ""
		}
		line := indent + "1. " + ConvertRichText(block.NumberedListItem.RichText) + "\n"
		if block.HasChildren && len(block.Children) > 0 {
			line += ConvertBlocksToMarkdown(block.Children, imagePathMap, indentLevel+1)
		}
		return line

	case "callout":
		if block.Callout == nil {
			return ""
		}
		text := ConvertRichText(block.Callout.RichText)
		var body strings.Builder
		if text != "" {
			body.WriteString(text)
		}
		if block.HasChildren && len(block.Children) > 0 {
			if body.Len() > 0 {
				body.WriteString("\n")
			}
			body.WriteString(ConvertBlocksToMarkdown(block.Children, imagePathMap, 0))
		}
		content := strings.TrimSuffix(body.String(), "\n")
		if content == "" {
			return ""
		}
		quoted := addBlockquotePrefix(content)
		if indentLevel > 0 {
			quoted = indent + strings.ReplaceAll(quoted, "\n", "\n"+indent)
		}
		return quoted + "\n\n"

	case "divider":
		if block.Divider == nil {
			return ""
		}
		if indentLevel == 0 {
			return "---\n\n"
		}
		return indent + "---\n"

	case "table":
		if block.Table == nil {
			return ""
		}
		if len(block.Children) == 0 {
			return ""
		}
		var rows [][]string
		maxCols := block.Table.TableWidth
		for _, child := range block.Children {
			if child.Type != "table_row" || child.TableRow == nil {
				continue
			}
			cells := tableRowToCells(child.TableRow)
			if len(cells) > maxCols {
				maxCols = len(cells)
			}
			rows = append(rows, cells)
		}
		if len(rows) == 0 || maxCols == 0 {
			return ""
		}

		var table strings.Builder
		startRow := 0
		if block.Table.HasColumnHeader && len(rows) > 0 {
			header := padCells(rows[0], maxCols)
			table.WriteString(renderTableRow(header))
			table.WriteString("\n")
			startRow = 1
		} else {
			header := make([]string, maxCols)
			table.WriteString(renderTableRow(header))
			table.WriteString("\n")
		}

		separators := make([]string, maxCols)
		for i := range separators {
			separators[i] = "---"
		}
		table.WriteString(renderTableRow(separators))
		table.WriteString("\n")

		for _, row := range rows[startRow:] {
			table.WriteString(renderTableRow(padCells(row, maxCols)))
			table.WriteString("\n")
		}

		if indentLevel == 0 {
			return table.String() + "\n"
		}
		indented := indent + strings.ReplaceAll(strings.TrimSuffix(table.String(), "\n"), "\n", "\n"+indent)
		return indented + "\n"

	case "table_row":
		return ""

	case "equation":
		if block.Equation == nil {
			return ""
		}
		if indentLevel == 0 {
			return fmt.Sprintf("$$\n%s\n$$\n\n", block.Equation.Expression)
		}
		return fmt.Sprintf("%s$$\n%s%s\n%s$$\n",
			indent,
			indent,
			block.Equation.Expression,
			indent)

	case "quote":
		if block.Quote == nil {
			return ""
		}
		// Render Notion quote blocks as Markdown blockquotes.
		// Keep a blank line after to separate from following content.
		text := ConvertRichText(block.Quote.RichText)
		if indentLevel == 0 {
			return "> " + text + "\n\n"
		}
		return indent + "> " + text + "\n"

	case "code":
		if block.Code == nil {
			return ""
		}
		if indentLevel == 0 {
			return fmt.Sprintf("```%s\n%s\n```\n\n",
				block.Code.Language,
				ConvertRichText(block.Code.RichText))
		}
		indentBlock := indent + "  "
		return fmt.Sprintf("%s```%s\n%s%s\n%s```\n",
			indentBlock,
			block.Code.Language,
			indentBlock,
			ConvertRichText(block.Code.RichText),
			indentBlock)

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

		// Use local path if available, otherwise use original URL
		imagePath := imageURL
		if imagePathMap != nil {
			if localPath, ok := imagePathMap[imageURL]; ok {
				imagePath = localPath
			}
		}

		caption := ""
		if len(block.Image.Caption) > 0 {
			caption = ConvertRichText(block.Image.Caption)
		}
		if indentLevel == 0 {
			return fmt.Sprintf("![%s](%s)\n\n", caption, imagePath)
		}
		return fmt.Sprintf("%s![%s](%s)\n", indent, caption, imagePath)

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
	ReadingTime *int     `yaml:"readingTime,omitempty"`
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
		fm.Description = ConvertRichText(descProp.RichText)
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
		fm.Summary = ConvertRichText(summaryProp.RichText)
	}

	// Extract reading time from Notion properties (Number type)
	if readingTimeProp, ok := page.Properties["Reading Time"]; ok && readingTimeProp.Number != nil {
		readingTime := int(*readingTimeProp.Number)
		fm.ReadingTime = &readingTime
	}

	return fm
}

// FormatFrontmatter formats frontmatter as YAML using yaml.v3 library
// This automatically handles escaping of special characters like colons, quotes, etc.
func FormatFrontmatter(fm *Frontmatter) string {
	// Build a map with only non-empty values for cleaner YAML output
	frontmatterMap := make(map[string]interface{})

	frontmatterMap["title"] = fm.Title

	if fm.Description != "" {
		frontmatterMap["description"] = fm.Description
	}

	if len(fm.Categories) > 0 {
		frontmatterMap["categories"] = fm.Categories
	}

	if len(fm.Tags) > 0 {
		frontmatterMap["tags"] = fm.Tags
	}

	if fm.Date != "" {
		frontmatterMap["date"] = fm.Date
	}

	if fm.Summary != "" {
		frontmatterMap["summary"] = fm.Summary
	}

	if fm.ReadingTime != nil {
		frontmatterMap["readingTime"] = *fm.ReadingTime
	}

	// Use yaml.Marshal with custom encoder to ensure consistent formatting
	var buf strings.Builder
	encoder := yaml.NewEncoder(&buf)
	encoder.SetIndent(2) // Use 2 spaces for indentation (standard YAML)

	if err := encoder.Encode(frontmatterMap); err != nil {
		encoder.Close()
		// Fallback: use Go's %q which automatically quotes and escapes
		var result strings.Builder
		result.WriteString(fmt.Sprintf("title: %q\n", fm.Title))
		if fm.Description != "" {
			result.WriteString(fmt.Sprintf("description: %q\n", fm.Description))
		}
		if len(fm.Categories) > 0 {
			result.WriteString("categories:\n")
			for _, cat := range fm.Categories {
				result.WriteString(fmt.Sprintf("  - %q\n", cat))
			}
		}
		if len(fm.Tags) > 0 {
			result.WriteString("tags:\n")
			for _, tag := range fm.Tags {
				result.WriteString(fmt.Sprintf("  - %q\n", tag))
			}
		}
		if fm.Date != "" {
			result.WriteString(fmt.Sprintf("date: %q\n", fm.Date))
		}
		if fm.Summary != "" {
			result.WriteString(fmt.Sprintf("summary: %q\n", fm.Summary))
		}
		if fm.ReadingTime != nil {
			result.WriteString(fmt.Sprintf("readingTime: %d\n", *fm.ReadingTime))
		}
		// Ensure trailing newline
		return result.String()
	}
	encoder.Close()

	// Get the encoded YAML
	data := buf.String()

	// Ensure the frontmatter ends with exactly one newline
	// yaml encoder typically adds a trailing newline, but we normalize it
	result := strings.TrimRight(data, " \t\n\r")
	// Add exactly one newline at the end to separate from the closing ---
	result += "\n"
	return result
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
		`发布日期：\s*(\d{4}年\d{1,2}月\d{1,2}日)`,         // 发布日期：2021年03月18日
		`\*\*日期：\*\*\s*(\d{4}年\d{1,2}月\d{1,2}日)`,   // **日期：** 2021年03月18日
		`日期：\s*(\d{4}年\d{1,2}月\d{1,2}日)`,           // 日期：2021年03月18日
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
	result := reg.ReplaceAllString(title, "-")
	// Remove leading and trailing hyphens to avoid files starting/ending with "-"
	result = strings.Trim(result, "-")
	// If result is empty after trimming, use a default name
	if result == "" {
		result = "untitled"
	}
	return result
}
