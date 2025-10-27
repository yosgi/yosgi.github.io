.PHONY: test sync build clean install help

# Default target
help:
	@echo "Available commands:"
	@echo "  make test    - Test Notion API connection"
	@echo "  make sync    - Sync content from Notion to Hugo"
	@echo "  make build   - Build binaries"
	@echo "  make clean   - Remove built binaries"
	@echo "  make install - Build and install to ../bin/"

# Test Notion API connection
test:
	@go run cmd/test/main.go

# Sync content from Notion
sync:
	@go run cmd/sync/main.go

# Build binaries
build:
	@mkdir -p bin
	@echo "Building notion-sync..."
	@go build -o bin/notion-sync cmd/sync/main.go
	@echo "Building notion-test..."
	@go build -o bin/notion-test cmd/test/main.go
	@echo "Build complete! Binaries in bin/"

# Clean built binaries
clean:
	@rm -rf bin/
	@echo "Cleaned build artifacts"

# Install to parent bin directory
install: build
	@mkdir -p ../bin
	@cp bin/notion-sync ../bin/
	@cp bin/notion-test ../bin/
	@echo "Installed to ../bin/"
