"""Rebuild ../index.html from the template and its parts: python3 src/build.py"""
import os, json
h = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(h, f), encoding='utf-8').read()

# sigils.txt: subject (no indent), part (2 spaces), topic (4 spaces), each "glyph name", in data order
P = json.loads(r('lay_data.json'))
rows = [(len(l) - len(l.lstrip(' ')), l.strip().split(' ', 1)) for l in r('sigils.txt').splitlines() if l.strip() and not l.startswith('#')]
it = iter(rows)
def nxt(depth, name):
    d, (g, n) = next(it)
    assert d == depth and n == name, f'sigils.txt is out of step at "{name}" (found "{n}")'
    return g
for s in P:
    s['sg'] = nxt(0, s['n'])
    for u in s['u']:
        u['sg'] = nxt(2, u['n'])
        for ti in u['t']: s['t'][ti]['sg'] = nxt(4, s['t'][ti]['t'])
assert next(it, None) is None, 'sigils.txt has extra lines'

s = r('template.html').replace('@@SENTCSS@@', r('sentence_css.css')).replace('@@SENTJS@@', r('sent2.js')).replace('@@TREEJS@@', r('tree2.js')).replace('@@JERE@@', r('jere.txt').strip()).replace('@@DATA@@', json.dumps(P, ensure_ascii=False, separators=(',', ':')))
open(os.path.join(h, '..', 'index.html'), 'w', encoding='utf-8').write(s)
print('built index.html', len(s))
