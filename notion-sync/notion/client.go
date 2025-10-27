package notion

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	APIVersion = "2022-06-28"
	BaseURL    = "https://api.notion.com/v1"
)

// Client represents a Notion API client
type Client struct {
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new Notion API client
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// makeRequest makes an HTTP request to the Notion API
func (c *Client) makeRequest(method, endpoint string, body interface{}) ([]byte, error) {
	url := BaseURL + endpoint

	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Notion-Version", APIVersion)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errResp ErrorResponse
		if err := json.Unmarshal(data, &errResp); err == nil {
			return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, errResp.Message)
		}
		return nil, fmt.Errorf("API error %d", resp.StatusCode)
	}

	return data, nil
}

// QueryDatabase queries a Notion database
func (c *Client) QueryDatabase(databaseID string, filter interface{}) (*QueryDatabaseResponse, error) {
	body := map[string]interface{}{}
	if filter != nil {
		body["filter"] = filter
	}

	data, err := c.makeRequest("POST", "/databases/"+databaseID+"/query", body)
	if err != nil {
		return nil, err
	}

	var response QueryDatabaseResponse
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &response, nil
}

// GetBlockChildren retrieves the children blocks of a page or block
func (c *Client) GetBlockChildren(blockID string) (*BlockChildrenResponse, error) {
	data, err := c.makeRequest("GET", "/blocks/"+blockID+"/children", nil)
	if err != nil {
		return nil, err
	}

	var response BlockChildrenResponse
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &response, nil
}

// GetDatabase retrieves database information
func (c *Client) GetDatabase(databaseID string) (*Database, error) {
	data, err := c.makeRequest("GET", "/databases/"+databaseID, nil)
	if err != nil {
		return nil, err
	}

	var database Database
	if err := json.Unmarshal(data, &database); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &database, nil
}

// GetCurrentUser retrieves the current user
func (c *Client) GetCurrentUser() (*User, error) {
	data, err := c.makeRequest("GET", "/users/me", nil)
	if err != nil {
		return nil, err
	}

	var user User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &user, nil
}
