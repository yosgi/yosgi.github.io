#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "Unable to determine current git branch." >&2
  exit 1
fi

MESSAGE="${1:-Publish blog updates from iCloud on $(date '+%Y-%m-%d %H:%M:%S')}"

echo "Step 1/4: Sync iCloud vault into repo"
zsh scripts/sync-icloud-to-repo.sh

echo "Step 2/4: Build Hugo site"
hugo --minify

echo "Step 3/4: Stage and commit changes"
git add -A

if git diff --staged --quiet; then
  echo "No changes to publish."
  exit 0
fi

git commit -m "$MESSAGE"

echo "Step 4/4: Push to origin/$BRANCH"
git push origin "$BRANCH"

echo "Publish completed."
