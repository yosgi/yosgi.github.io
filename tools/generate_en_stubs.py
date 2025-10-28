#!/usr/bin/env python3
"""
Generate English stub files for posts under content/zh/post that don't have a counterpart in content/en/post.
- Copies YAML front matter (if present), ensures `draft: true` and `original: '<zh-path>'` are present.
- Copies the Chinese post body verbatim into the English file body (no commenting-out). This allows a downstream translation step to translate the full document in place.
- Does not modify the original Chinese files.
- Will not overwrite existing English files by default.
"""
from pathlib import Path
import re

ROOT = Path('.')
ZH_GLOB = list(ROOT.glob('content/zh/post/**/*.md')) + list(ROOT.glob('content/zh/post/*.md'))
EN_DIR = ROOT / 'content' / 'en' / 'post'
EN_DIR.mkdir(parents=True, exist_ok=True)

YAML_BOUNDARY = re.compile(r'^---\s*$')

created = 0
skipped = 0

for p in sorted(ZH_GLOB):
    if not p.is_file():
        continue
    en_path = EN_DIR / p.name
    if en_path.exists():
        skipped += 1
        continue

    txt = p.read_text(encoding='utf-8')
    # Extract YAML front matter if present
    front = ''
    body = txt
    if txt.startswith('---'):
        parts = txt.split('\n')
        # find second '---' line
        try:
            idx = 1
            while idx < len(parts) and parts[idx].strip() != '---':
                idx += 1
            # idx points to the closing '---' or end
            if idx < len(parts) and parts[idx].strip() == '---':
                front = '\n'.join(parts[:idx+1]) + '\n'
                body = '\n'.join(parts[idx+1:])
        except Exception:
            front = ''
            body = txt

    # Ensure front matter contains date/category etc, but add draft: true and original path
    if front:
        # insert draft and original info after the opening ---
        fm_lines = front.split('\n')
        # find insert position after first line (the '---')
        insert_at = 1
        # avoid duplicating draft
        has_draft = any(line.strip().startswith('draft:') for line in fm_lines)
        # avoid duplicating original
        has_original = any(line.strip().startswith('original:') for line in fm_lines)
        if not has_draft:
            fm_lines.insert(insert_at, 'draft: true')
            insert_at += 1
        if not has_original:
            fm_lines.insert(insert_at, "original: '{}'".format(p.as_posix()))
        new_front = '\n'.join(fm_lines).rstrip() + '\n\n'
    else:
        new_front = '---\n' + "draft: true\noriginal: '{}'\n---\n\n".format(p.as_posix())

    # Copy the Chinese body verbatim into the English file body. This allows a translation
    # script to translate the whole document in-place later.
    stub_body = body.lstrip('\n')

    content = new_front + stub_body

    # backup if en_path exists (conservative) — should not happen because of exists() check
    if en_path.exists():
        bak = en_path.with_suffix(en_path.suffix + '.bak')
        bak.write_bytes(en_path.read_bytes())

    en_path.write_text(content, encoding='utf-8')
    print(f'Created: {en_path}')
    created += 1

print(f'DONE. Created {created} en stubs, skipped {skipped} existing.')
