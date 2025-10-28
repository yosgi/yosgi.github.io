#!/usr/bin/env python3
"""
Translate a single generated English stub (or any post) by translating the full document body
(excluding YAML front matter and fenced code blocks). Creates a .bak backup and appends the original
Chinese body inside an HTML comment at the end of the translated file for reference.

Usage:
  python3 tools/translate_with_google.py content/en/post/SomePost.md

Notes:
- Reads GOOGLE_API_KEY from .env in the repo root.
- Uses Google Translate v2 REST API (requires API key to have Cloud Translation enabled).
- Preserves fenced code blocks (```...```) unchanged.
"""

import os
import re
import sys
import json
import urllib.request
import ssl
import yaml
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


CODE_FENCE_RE = re.compile(r'(```[\s\S]*?```)', re.MULTILINE)
COMMENT_RE = re.compile(r'(//[^\n]*|/\*[\s\S]*?\*/)')


def split_preserve_code_blocks(text):
    parts = CODE_FENCE_RE.split(text)
    # parts: segments where odd indices are code blocks
    return parts


def translate_code_comments(api_key, code_block):
    """Translate Chinese comments in a code block while preserving code."""
    # Extract language if present (e.g., ```javascript)
    lines = code_block.split('\n')
    if not lines:
        return code_block

    first_line = lines[0]
    if first_line.startswith('```'):
        lang = first_line[3:].strip()
        code_content = '\n'.join(lines[1:-1])  # Remove ``` markers
        closing = lines[-1] if lines[-1].strip() == '```' else ''
    else:
        return code_block

    # Find and translate comments
    def translate_comment(match):
        comment = match.group(0)
        # Check if comment contains Chinese
        if re.search(r'[\u4e00-\u9fff]', comment):
            try:
                # Preserve comment delimiters
                if comment.startswith('//'):
                    chinese_text = comment[2:].strip()
                    translated = translate_text(api_key, chinese_text)
                    return f'// {translated}'
                elif comment.startswith('/*'):
                    chinese_text = comment[2:-2].strip()
                    translated = translate_text(api_key, chinese_text)
                    return f'/* {translated} */'
            except Exception as e:
                print(f"Warning: Failed to translate comment: {e}")
                return comment
        return comment

    translated_code = COMMENT_RE.sub(translate_comment, code_content)

    # Reconstruct the code block
    result = f'```{lang}\n{translated_code}\n{closing}'
    return result


def get_ssl_context():
    try:
        import certifi
    except Exception:
        return None
    ctx = ssl.create_default_context(cafile=certifi.where())
    return ctx


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
    ctx = get_ssl_context()
    if ctx is None:
        raise SystemExit("SSL certificate verification can't find a CA bundle. Please install certifi:\n  python3 -m pip install --user certifi\nAlternatively, run the 'Install Certificates.command' that comes with python.org installers.")
    with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        return res['data']['translations'][0]['translatedText']


def parse_front_matter(front):
    """Parse YAML front-matter block into dict and return dict and original raw block."""
    try:
        # Remove --- markers for YAML parsing
        yaml_content = front.strip()
        if yaml_content.startswith('---'):
            lines = yaml_content.split('\n')
            # Find the closing ---
            end_idx = -1
            for i in range(1, len(lines)):
                if lines[i].strip() == '---':
                    end_idx = i
                    break
            if end_idx > 0:
                yaml_content = '\n'.join(lines[1:end_idx])
        data = yaml.safe_load(yaml_content) or {}
    except Exception as e:
        # Fallback: return empty dict
        print(f"Warning: Failed to parse YAML front matter: {e}")
        return {}, front
    return data, front


def dump_front_matter(data):
    # Dump YAML preserving simple formatting
    # Use safe_dump with default_flow_style=False
    raw = yaml.safe_dump(data, sort_keys=False, allow_unicode=True)
    return '---\n' + raw + '---\n\n'


def translate_front_fields(api_key, front_text):
    if not front_text:
        return front_text
    data, raw = parse_front_matter(front_text)
    changed = False
    for key in ('title', 'description', 'summary'):
        val = data.get(key)
        if isinstance(val, str) and re.search(r'[\u4e00-\u9fff]', val):
            # translate val
            try:
                translated = translate_text(api_key, val, source='zh', target='en')
            except Exception as e:
                raise
            data[key] = translated
            changed = True
    if changed:
        return dump_front_matter(data)
    return front_text


def extract_front_and_body(content):
    if content.startswith('---'):
        parts = content.split('\n')
        idx = 1
        while idx < len(parts) and parts[idx].strip() != '---':
            idx += 1
        if idx < len(parts) and parts[idx].strip() == '---':
            front = '\n'.join(parts[:idx+1]) + '\n\n'
            body = '\n'.join(parts[idx+1:])
            return front, body
    return '', content


def replace_front_draft_false(front):
    if not front:
        return front
    # replace 'draft: true' with 'draft: false' if present
    new = re.sub(r'^(draft:)\s*true', r'\1 false', front, flags=re.MULTILINE)
    # if draft not present, insert draft: false after opening ---
    if 'draft:' not in new:
        lines = new.split('\n')
        if len(lines) > 0 and lines[0].strip() == '---':
            lines.insert(1, 'draft: false')
            new = '\n'.join(lines)
    return new


def main():
    if len(sys.argv) < 2:
        print('Usage: translate_with_google.py <path-to-en-md>')
        sys.exit(1)
    target_path = Path(sys.argv[1])
    if not target_path.exists():
        raise SystemExit(f'{target_path} not found')

    api_key = load_api_key()

    content = target_path.read_text(encoding='utf-8')
    front, body = extract_front_and_body(content)

    # Translate front-matter title/description/summary if they contain Chinese
    new_front = translate_front_fields(api_key, front)

    if not body or not body.strip():
        print('No body content found to translate; aborting')
        sys.exit(0)

    # Keep original Chinese body for backup; but user wants originals removed, so we'll not append later
    original_body = body

    parts = split_preserve_code_blocks(body)
    translated_parts = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            # code block -> translate comments inside
            translated_parts.append(translate_code_comments(api_key, part))
        else:
            text = part.strip()
            if not text:
                translated_parts.append('')
                continue
            paragraphs = [p for p in re.split(r'\n{2,}', text) if p.strip()]
            translated_pars = []
            for p in paragraphs:
                try:
                    translated = translate_text(api_key, p)
                except Exception as e:
                    raise SystemExit(f'Translation API error: {e}')
                translated_pars.append(translated)
            translated_parts.append('\n\n'.join(translated_pars))

    translated_body = ''.join(translated_parts)

    # Build new content: new_front (with draft:false), translated body only (no original appended)
    new_front = replace_front_draft_false(new_front)

    new_content = new_front + translated_body.strip() + '\n'

    # Backup original file
    bak = target_path.with_suffix(target_path.suffix + '.bak')
    if not bak.exists():
        bak.write_bytes(target_path.read_bytes())
    else:
        i = 1
        while True:
            nb = target_path.with_suffix(target_path.suffix + f'.bak{i}')
            if not nb.exists():
                nb.write_bytes(target_path.read_bytes())
                bak = nb
                break
            i += 1

    target_path.write_text(new_content, encoding='utf-8')
    print(f'Translated full document and updated {target_path} (backup saved as {bak.name})')


if __name__ == '__main__':
    main()
