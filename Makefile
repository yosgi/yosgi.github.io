.PHONY: dev build sync-icloud publish-icloud new-zh new-en help

help:
	@echo "Available commands:"
	@echo "  make dev          - Start local Hugo server"
	@echo "  make build        - Build the Hugo site"
	@echo "  make sync-icloud  - Sync posts and images from iCloud vault"
	@echo "  make publish-icloud - Sync, build, commit, and push current branch"
	@echo "  make new-zh TITLE='文章标题' - Create a new Chinese post"
	@echo "  make new-en TITLE='Post Title' - Create a new English post"

dev:
	@hugo server -D

build:
	@hugo --minify

sync-icloud:
	@zsh scripts/sync-icloud-to-repo.sh

publish-icloud:
	@zsh scripts/publish-icloud.sh "$(MESSAGE)"

new-zh:
	@node scripts/new-post.js --lang zh "$(TITLE)"

new-en:
	@node scripts/new-post.js --lang en "$(TITLE)"
