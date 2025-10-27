package notion

import "time"

// ErrorResponse represents an error response from the Notion API
type ErrorResponse struct {
	Object  string `json:"object"`
	Status  int    `json:"status"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

// User represents a Notion user
type User struct {
	Object string `json:"object"`
	ID     string `json:"id"`
	Name   string `json:"name,omitempty"`
	Type   string `json:"type"`
}

// Database represents a Notion database
type Database struct {
	Object     string                 `json:"object"`
	ID         string                 `json:"id"`
	Title      []RichText             `json:"title"`
	Properties map[string]interface{} `json:"properties"`
}

// Page represents a Notion page
type Page struct {
	Object     string                 `json:"object"`
	ID         string                 `json:"id"`
	Properties map[string]Property    `json:"properties"`
	CreatedTime time.Time             `json:"created_time"`
	LastEditedTime time.Time          `json:"last_edited_time"`
}

// Property represents a property value in a page
type Property struct {
	ID          string       `json:"id"`
	Type        string       `json:"type"`
	Title       []RichText   `json:"title,omitempty"`
	RichText    []RichText   `json:"rich_text,omitempty"`
	MultiSelect []SelectItem `json:"multi_select,omitempty"`
	Date        *DateValue   `json:"date,omitempty"`
}

// RichText represents rich text content
type RichText struct {
	Type        string      `json:"type"`
	PlainText   string      `json:"plain_text"`
	Annotations Annotations `json:"annotations"`
	Text        *TextValue  `json:"text,omitempty"`
}

// TextValue represents text content
type TextValue struct {
	Content string `json:"content"`
}

// Annotations represents text formatting
type Annotations struct {
	Bold   bool `json:"bold"`
	Italic bool `json:"italic"`
	Code   bool `json:"code"`
}

// SelectItem represents a select or multi-select option
type SelectItem struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

// DateValue represents a date property value
type DateValue struct {
	Start string `json:"start"`
	End   string `json:"end,omitempty"`
}

// Block represents a Notion block
type Block struct {
	Object         string                 `json:"object"`
	ID             string                 `json:"id"`
	Type           string                 `json:"type"`
	HasChildren    bool                   `json:"has_children"`
	Paragraph      *ParagraphBlock        `json:"paragraph,omitempty"`
	Heading1       *HeadingBlock          `json:"heading_1,omitempty"`
	Heading2       *HeadingBlock          `json:"heading_2,omitempty"`
	Heading3       *HeadingBlock          `json:"heading_3,omitempty"`
	BulletedListItem *ListItemBlock       `json:"bulleted_list_item,omitempty"`
	NumberedListItem *ListItemBlock       `json:"numbered_list_item,omitempty"`
	Code           *CodeBlock             `json:"code,omitempty"`
	Image          *ImageBlock            `json:"image,omitempty"`
}

// ParagraphBlock represents a paragraph block
type ParagraphBlock struct {
	RichText []RichText `json:"rich_text"`
}

// HeadingBlock represents a heading block
type HeadingBlock struct {
	RichText []RichText `json:"rich_text"`
}

// ListItemBlock represents a list item block
type ListItemBlock struct {
	RichText []RichText `json:"rich_text"`
}

// CodeBlock represents a code block
type CodeBlock struct {
	RichText []RichText `json:"rich_text"`
	Language string     `json:"language"`
}

// ImageBlock represents an image block
type ImageBlock struct {
	Type     string      `json:"type"`
	File     *FileInfo   `json:"file,omitempty"`
	External *ExternalInfo `json:"external,omitempty"`
	Caption  []RichText  `json:"caption,omitempty"`
}

// FileInfo represents a file hosted by Notion
type FileInfo struct {
	URL string `json:"url"`
}

// ExternalInfo represents an external file
type ExternalInfo struct {
	URL string `json:"url"`
}

// QueryDatabaseResponse represents the response from querying a database
type QueryDatabaseResponse struct {
	Object     string `json:"object"`
	Results    []Page `json:"results"`
	HasMore    bool   `json:"has_more"`
	NextCursor string `json:"next_cursor,omitempty"`
}

// BlockChildrenResponse represents the response from getting block children
type BlockChildrenResponse struct {
	Object     string  `json:"object"`
	Results    []Block `json:"results"`
	HasMore    bool    `json:"has_more"`
	NextCursor string  `json:"next_cursor,omitempty"`
}
