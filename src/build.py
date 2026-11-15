"""Rebuild ../index.html from the template and its parts: python3 src/build.py"""
import os
h = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(h, f), encoding='utf-8').read()
s = r('template.html').replace('@@SENTCSS@@', r('sentence_css.css')).replace('@@SENTJS@@', r('sent2.js')).replace('@@TREEJS@@', r('tree2.js')).replace('@@CARDJS@@', r('cards.js')).replace('@@JERE@@', r('jere.txt').strip()).replace('@@DATA@@', r('lay_data.json'))
open(os.path.join(h, '..', 'index.html'), 'w', encoding='utf-8').write(s)
print('built index.html', len(s))
