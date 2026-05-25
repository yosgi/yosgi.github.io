#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICLOUD_VAULT_DIR="${ICLOUD_VAULT_DIR:-$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/yosgi-blog-vault}"

DRY_RUN_ARGS=()
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN_ARGS=(--dry-run)
fi

require_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    echo "Missing directory: $dir" >&2
    exit 1
  fi
}

require_dir "$ICLOUD_VAULT_DIR/content/zh/post"
require_dir "$ICLOUD_VAULT_DIR/content/en/post"
require_dir "$ICLOUD_VAULT_DIR/static/images"

echo "Syncing from iCloud vault:"
echo "  $ICLOUD_VAULT_DIR"

rsync -a --delete "${DRY_RUN_ARGS[@]}" \
  "$ICLOUD_VAULT_DIR/content/zh/post/" \
  "$ROOT_DIR/content/zh/post/"

rsync -a --delete "${DRY_RUN_ARGS[@]}" \
  "$ICLOUD_VAULT_DIR/content/en/post/" \
  "$ROOT_DIR/content/en/post/"

rsync -a --delete "${DRY_RUN_ARGS[@]}" \
  "$ICLOUD_VAULT_DIR/static/images/" \
  "$ROOT_DIR/static/images/"

echo "iCloud sync completed${DRY_RUN_ARGS:+ (dry-run)}."
