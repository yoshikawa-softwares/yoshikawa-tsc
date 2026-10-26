"""Validação estática sem dependências: python3 scripts/check_site.py."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess

root = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.refs, self.h1 = set(), [], 0
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f"ID duplicado: {a['id']}"
            self.ids.add(a['id'])
        self.h1 += tag == 'h1'
        for key in ('href', 'src'):
            if key in a:
                self.refs.append(a[key])
        if a.get('target') == '_blank':
            assert 'noopener' in a.get('rel', ''), 'Link externo sem noopener'

pages = {p.name: Page(p) for p in root.glob('*.html')}
for name, page in pages.items():
    assert page.h1 == 1, f'{name}: deve ter um h1'
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = unquote(url.path) or name
        if target.endswith('/'):
            target += 'index.html'
        target = str(Path(target))
        assert (root / target).is_file(), f'{name}: destino ausente {ref}'
        if url.fragment:
            assert url.fragment in pages[target].ids, f'{name}: âncora ausente {ref}'
assert (root / 'assets/social.png').is_file()
subprocess.run(['node', '--check', str(root / 'assets/site.js')], check=True)
print(f'OK: {len(pages)} páginas; arquivos, âncoras, IDs, hierarquia h1, links externos e sintaxe JS.')
