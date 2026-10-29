#!/usr/bin/env python3
"""Check the generated site's domain, navigation, timestamps and local images."""
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'public').resolve()
ORIGIN = 'https://siqi-liu.com'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.meta, self.images, self.scripts = [], {}, [], []
        self.ids, self.refs = set(), []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            check(attrs['id'] not in self.ids, f'Duplicate HTML ID: {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag in ('a', 'link') and attrs.get('href'):
            self.refs.append(attrs['href'])
        if tag in ('img', 'script', 'source') and attrs.get('src'):
            self.refs.append(attrs['src'])
        if tag in ('img', 'source') and attrs.get('srcset') and not attrs['srcset'].startswith('data:'):
            self.refs.extend(part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip())
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
pages = {file: Page(file.read_text()) for file in files}
for file, parsed in pages.items():
    for link in parsed.links:
        if link.get('rel') == 'canonical' or link.get('hreflang'):
            check(link['href'].startswith(ORIGIN + '/'), f'Wrong primary domain in {file}: {link}')
    if parsed.meta.get('og:url'):
        check(parsed.meta['og:url'].startswith(ORIGIN + '/'), f'Wrong share URL in {file}')
    route = '/' + file.relative_to(SITE).as_posix()
    if route.endswith('/index.html'):
        route = route[:-len('index.html')]
    for ref in parsed.refs:
        url = urlsplit(urljoin(ORIGIN + route, ref))
        if url.scheme not in ('http', 'https') or url.netloc != urlsplit(ORIGIN).netloc:
            continue
        target = SITE / unquote(url.path).lstrip('/')
        if target.is_dir():
            target = target / 'index.html'
        check(target.is_file(), f'Missing local link or asset in {file}: {ref}')
        if url.fragment and target in pages:
            check(unquote(url.fragment) in pages[target].ids, f'Missing heading fragment in {file}: {ref}')

for path in ('404.html', 'en/404.html', 'zh/404.html'):
    not_found = page(path)
    check('main-content' in not_found.ids, f'404 page lacks its navigation target: {path}')
    check('noindex' in not_found.meta.get('robots', ''), f'404 page should not be indexed: {path}')
    check(any('/js/search.js' in script for script in not_found.scripts), f'404 page search is inactive: {path}')
legacy = page('post/index.html')
check(any(link.get('rel') == 'canonical' and link.get('href') == ORIGIN + '/en/post/' for link in legacy.links), 'Legacy /post/ does not redirect to the articles')

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
print(f'PASS: {len(files)} HTML pages; local links/assets/fragments, IDs, 404 recovery, legacy route, domain, language routes, lazy libraries, RSS and real modification dates')
