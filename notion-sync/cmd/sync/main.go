package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/yosgi/notion-sync/sync"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	config := &sync.Config{
		NotionAPIKey:     os.Getenv("NOTION_API_KEY"),
		NotionDatabaseID: os.Getenv("NOTION_DATABASE_ID"),
		HugoContentDir:   getEnvOrDefault("HUGO_CONTENT_DIR", "./content"),
		ImageDir:         getEnvOrDefault("IMAGE_DIR", "./static/images"),
	}

	syncer := sync.NewSyncer(config)

	if err := syncer.SyncAll(); err != nil {
		fmt.Printf("Sync failed: %v\n", err)
		os.Exit(1)
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
