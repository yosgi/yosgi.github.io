.PHONY: notion-test notion-sync notion-build help

help:
	@echo "Available commands:"
	@echo "  make notion-test  - Test Notion API connection"
	@echo "  make notion-sync  - Sync content from Notion to Hugo"
	@echo "  make notion-build - Build Notion sync binaries"

# Test Notion API connection
notion-test:
	@cd notion-sync && go run cmd/test/main.go

# Sync content from Notion
notion-sync:
	@cd notion-sync && go run cmd/sync/main.go

# Build binaries
notion-build:
	@cd notion-sync && make build
