package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/yosgi/notion-sync/notion"
)

func main() {
	fmt.Println("Notion API Connection Test\n")

	// Load environment variables from .env file if it exists
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	// Retrieve required environment variables
	apiKey := os.Getenv("NOTION_API_KEY")
	databaseID := os.Getenv("NOTION_DATABASE_ID")

	// Validate that API key is set
	if apiKey == "" {
		fmt.Println("NOTION_API_KEY environment variable not set")
		fmt.Println("Please set: export NOTION_API_KEY=\"your-api-key\"")
		os.Exit(1)
	}

	// Validate that database ID is set
	if databaseID == "" {
		fmt.Println("NOTION_DATABASE_ID environment variable not set")
		fmt.Println("Please set: export NOTION_DATABASE_ID=\"your-database-id\"")
		os.Exit(1)
	}

	// Create tester instance and run tests
	tester := NewTester(apiKey, databaseID)
	if err := tester.TestConnection(); err != nil {
		fmt.Printf("Test failed: %v\n", err)
		tester.PrintTroubleshootingTips(err)
		os.Exit(1)
	}

	fmt.Println("All tests passed! Notion API configuration is correct")
}

type Tester struct {
	client     *notion.Client
	databaseID string
}

func NewTester(apiKey, databaseID string) *Tester {
	return &Tester{
		client:     notion.NewClient(apiKey),
		databaseID: databaseID,
	}
}

func (t *Tester) TestConnection() error {
	fmt.Println("Testing Notion API connection...")

	// Test basic connection
	if err := t.testBasicConnection(); err != nil {
		return err
	}

	// Test database access
	if err := t.testDatabaseAccess(); err != nil {
		return err
	}

	// Test page query
	if err := t.testPageQuery(); err != nil {
		return err
	}

	return nil
}

func (t *Tester) testBasicConnection() error {
	fmt.Println("Testing basic API connection...")

	user, err := t.client.GetCurrentUser()
	if err != nil {
		return fmt.Errorf("basic connection failed: %w", err)
	}

	userName := user.Name
	if userName == "" {
		userName = "Unknown"
	}

	fmt.Printf("API connection successful, user: %s\n", userName)
	return nil
}

func (t *Tester) testDatabaseAccess() error {
	fmt.Println("Testing database access...")

	db, err := t.client.GetDatabase(t.databaseID)
	if err != nil {
		return fmt.Errorf("database access failed: %w", err)
	}

	dbTitle := "Unknown"
	if len(db.Title) > 0 {
		dbTitle = db.Title[0].PlainText
	}

	fmt.Printf("Database access successful: %s\n", dbTitle)

	// Display all available properties
	fmt.Println("Available properties:")
	for propName, prop := range db.Properties {
		if propMap, ok := prop.(map[string]interface{}); ok {
			if propType, exists := propMap["type"]; exists {
				fmt.Printf("  - %s (%v)\n", propName, propType)
			} else {
				fmt.Printf("  - %s (unknown)\n", propName)
			}
		} else {
			fmt.Printf("  - %s (unknown)\n", propName)
		}
	}

	// Check database properties
	requiredProperties := []string{"Title", "Status", "Date"}
	var missingProperties []string

	for _, prop := range requiredProperties {
		if _, ok := db.Properties[prop]; !ok {
			missingProperties = append(missingProperties, prop)
		}
	}

	if len(missingProperties) > 0 {
		fmt.Printf("Warning: Missing recommended properties: %v\n", missingProperties)
	} else {
		fmt.Println("Database properties check passed")
	}

	return nil
}

func (t *Tester) testPageQuery() error {
	fmt.Println("Testing page query...")

	response, err := t.client.QueryDatabase(t.databaseID, nil)
	if err != nil {
		return fmt.Errorf("page query failed: %w", err)
	}

	fmt.Printf("Page query successful, found %d pages\n", len(response.Results))

	if len(response.Results) > 0 {
		firstPage := response.Results[0]
		title := getPageTitle(firstPage)
		fmt.Printf("Sample page: %s\n", title)
	}

	return nil
}

func getPageTitle(page notion.Page) string {
	if titleProp, ok := page.Properties["Title"]; ok && len(titleProp.Title) > 0 {
		return titleProp.Title[0].PlainText
	}
	if nameProp, ok := page.Properties["Name"]; ok && len(nameProp.Title) > 0 {
		return nameProp.Title[0].PlainText
	}
	return "Untitled"
}

func (t *Tester) PrintTroubleshootingTips(err error) {
	errMsg := err.Error()

	fmt.Println("\nTroubleshooting suggestions:")

	if contains(errMsg, "401") {
		fmt.Println("1. Check if NOTION_API_KEY is correct")
		fmt.Println("2. Ensure API key starts with \"secret_\"")
		fmt.Println("3. Verify API key is activated")
	}

	if contains(errMsg, "404") {
		fmt.Println("1. Check if NOTION_DATABASE_ID is correct")
		fmt.Println("2. Ensure database ID is 32 characters")
		fmt.Println("3. Verify Integration has access to the database")
	}

	if contains(errMsg, "403") {
		fmt.Println("1. Ensure Integration is added to the database")
		fmt.Println("2. Check database permission settings")
		fmt.Println("3. Verify workspace permissions")
	}

	fmt.Println("\nSetup steps:")
	fmt.Println("1. Visit https://www.notion.so/my-integrations")
	fmt.Println("2. Create a new Integration")
	fmt.Println("3. Copy the API key")
	fmt.Println("4. Add Integration to your Notion database page")
	fmt.Println("5. Set environment variables:")
	fmt.Println("   export NOTION_API_KEY=\"your-api-key\"")
	fmt.Println("   export NOTION_DATABASE_ID=\"your-database-id\"")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > len(substr) &&
		(s[:len(substr)] == substr || s[len(s)-len(substr):] == substr ||
			len(s) > len(substr)*2 && findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
