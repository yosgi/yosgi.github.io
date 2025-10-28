#!/usr/bin/env python3
"""
Translate a single generated English stub by extracting the ORIGINAL CHINESE CONTENT in the
English file (the HTML comment), translating text segments (preserving fenced code blocks),
and writing the translated content back into the English file. Creates a .bak backup.

Usage:
  python3 tools/translate_with_google.py content/en/post/Iterator.md

Notes:
- Reads GOOGLE_API_KEY from .env in the repo root.
- Uses Google Translate v2 REST API (requires API key to have Translation API enabled).
- This script is conservative: it preserves fenced code blocks (```...```) unchanged.
"""

import os
import re
import sys
import json
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = REPO_ROOT / '.env'


def load_api_key():
    if not ENV_PATH.exists():
        raise SystemExit(f".env not found at {ENV_PATH}")
    for line in ENV_PATH.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            k, v = line.split('=', 1)
            if k.strip() == 'GOOGLE_API_KEY':
                return v.strip()
    raise SystemExit('GOOGLE_API_KEY not found in .env')


def extract_original_comment(content):
    start = '<!-- ORIGINAL CHINESE CONTENT STARTS -->'
    end = '<!-- ORIGINAL CHINESE CONTENT ENDS -->'
    si = content.find(start)
    ei = content.find(end)
    if si == -1 or ei == -1:
        return None
    return content[si + len(start):ei].strip()


def replace_comment_with_translated(content, translated_text):
    start = '<!-- ORIGINAL CHINESE CONTENT STARTS -->'
    end = '<!-- ORIGINAL CHINESE CONTENT ENDS -->'
    si = content.find(start)
    ei = content.find(end)
    if si == -1 or ei == -1:
        raise RuntimeError('Original comment markers not found')
    before = content[:si + len(start)]
    after = content[ei:]
    # keep markers and insert translated text between them
    return before + "\n" + translated_text.strip() + "\n" + after


CODE_FENCE_RE = re.compile(r'(```[\s\S]*?```)', re.MULTILINE)


def split_preserve_code_blocks(text):
    parts = CODE_FENCE_RE.split(text)
    # parts: segments where odd indices are code blocks
    return parts


def translate_text(api_key, text, source='zh', target='en'):
    # Call Google Translate v2 REST API
    url = f'https://translation.googleapis.com/language/translate/v2?key={api_key}'
    data = {
        'q': text,
        'source': source,
        'target': target,
        'format': 'text'
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        # res should contain data.translations[0].translatedText
        return res['data']['translations'][0]['translatedText']


def main():
    if len(sys.argv) < 2:
        print('Usage: translate_with_google.py <path-to-en-md>')
        sys.exit(1)
    target_path = Path(sys.argv[1])
    if not target_path.exists():
        raise SystemExit(f'{target_path} not found')

    api_key = load_api_key()

    content = target_path.read_text(encoding='utf-8')
    original = extract_original_comment(content)
    if not original:
        print('No original Chinese comment block found; aborting')
        sys.exit(0)

    # Extract the inner original content and split into code/non-code parts
    parts = split_preserve_code_blocks(original)
    translated_parts = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            # code block -> keep as-is
            translated_parts.append(part)
        else:
            text = part.strip()
            if not text:
                translated_parts.append('')
                continue
            # Translate chunk. For long texts, do in smaller paragraphs
            paragraphs = [p for p in re.split(r'\n{2,}', text) if p.strip()]
            translated_pars = []
            for p in paragraphs:
                # Keep very short paragraphs as-is if they look like code-like
                try:
                    translated = translate_text(api_key, p)
                except Exception as e:
                    raise SystemExit(f'Translation API error: {e}')
                translated_pars.append(translated)
            translated_parts.append('\n\n'.join(translated_pars))

    translated_combined = ''.join(translated_parts)

    # Replace the comment block with translated content
    new_content = replace_comment_with_translated(content, translated_combined)

    # Also replace the ENGLISH TRANSLATION NEEDED placeholder if present
    new_content = new_content.replace('# ENGLISH TRANSLATION NEEDED', '')

    # Update front-matter: set draft: false if present in the top-level YAML block
    new_content = re.sub(r'^(---\n[\s\S]*?draft:)\s*true', lambda m: m.group(1) + ' false', new_content, flags=re.MULTILINE)

    # Backup and write
    bak = target_path.with_suffix(target_path.suffix + '.bak')
    if not bak.exists():
        target_path.rename(bak)
        bak.write_text(bak.read_text(encoding='utf-8'), encoding='utf-8')
        # Actually because we renamed, re-create target file by writing new_content
    else:
        # if bak already exists, just make a numbered backup
        i = 1
        while True:
            nb = target_path.with_suffix(target_path.suffix + f'.bak{i}')
            if not nb.exists():
                bak = nb
                target_path.rename(bak)
                break
            i += 1

    target_path.write_text(new_content, encoding='utf-8')
    print(f'Translated and updated {target_path} (backup saved as {bak.name})')


if __name__ == '__main__':
    main()
