#!/usr/bin/env python3
"""Check the generated site's domain, navigation, timestamps and local images."""
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'public')
ORIGIN = 'https://siqi-liu.com'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.meta, self.images, self.scripts = [], {}, [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link':
            self.links.append(attrs)
        elif tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name', ''))] = attrs.get('content', '')
        elif tag == 'img':
            self.images.append(attrs)
        elif tag == 'script':
            self.scripts.append(attrs.get('src', ''))


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def page(path):
    file = SITE / path
    check(file.is_file(), f'Missing generated page: {path}')
    return Page(file.read_text())


files = list(SITE.rglob('*.html'))
check(files, 'No generated HTML')
for file in files:
    parsed = Page(file.read_text())
    for link in parsed.links:
        if link.get('rel') == 'canonical' or link.get('hreflang'):
            check(link['href'].startswith(ORIGIN + '/'), f'Wrong primary domain in {file}: {link}')
    if parsed.meta.get('og:url'):
        check(parsed.meta['og:url'].startswith(ORIGIN + '/'), f'Wrong share URL in {file}')

for lang in ('en', 'zh'):
    for route in ('', 'post/', 'projects/', 'topics/', 'about/'):
        parsed = page(f'{lang}/{route}index.html')
        for image in parsed.images:
            path = urlsplit(image.get('src', '')).path
            if path.startswith('/'):
                check((SITE / unquote(path[1:])).is_file(), f'Missing local image: {path}')
    home = page(f'{lang}/index.html')
    check(not any('mermaid' in s or 'katex' in s or 'fuse' in s for s in home.scripts), 'Homepage eagerly loads optional libraries')
    rss = (SITE / lang / 'index.xml').read_text()
    check('https://yosgi.github.io/' not in rss, 'RSS uses the previous domain')

# Publishing an unrelated page must not make this unchanged article look updated.
relative = 'content/zh/post/working-like-a-cto-with-ai-agents.md'
expected = subprocess.check_output(['git', 'log', '-1', '--format=%aI', '--', relative], cwd=ROOT, text=True).strip()
actual = page('zh/post/working-like-a-cto-with-ai-agents/index.html').meta['article:modified_time']
check(datetime.fromisoformat(actual) == datetime.fromisoformat(expected), f'Article modification date changed: {actual} != {expected}')
check('https://yosgi.github.io/' not in (SITE / 'sitemap.xml').read_text(), 'Sitemap uses the previous domain')
print(f'PASS: {len(files)} HTML pages; primary domain, language routes, images, lazy libraries, RSS and real modification dates')
