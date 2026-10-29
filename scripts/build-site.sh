#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
hugo --minify --cleanDestinationDir
# GitHub Pages looks for a root 404; multilingual Hugo puts it under /en/.
cp public/en/404.html public/404.html
python3 tools/check_site.py public
