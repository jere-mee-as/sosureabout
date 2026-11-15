/* =================== CARDS: one deck, named by one sentence. Change a word and the deck reshuffles; tap the top card to turn it over =================== */
const CD = (() => {
  const S = $('cards'), H = $('kh'), B = $('kb');
  const SIDES = [['any', 'anyone'], ['L', 'the left'], ['R', 'the right'], ['fair', 'both sides, in turn'], ['N', 'neither side']];
  const TAG = {L: 'stings the left', R: 'stings the right', N: 'stings neither side'};
  let side = 'any', scope = [null, null, null], deck = [], at = 0, flipped = false, busy = false, spread = false, io = null;
  const rnd = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const raw = () => $('find').value.trim(), wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
  /* every card inside a scope, for a side, narrowed by the search */
  function pool(sc, sd){ const out = []; if(QRY && !totalHits()) return out;
    P.forEach((s, si) => { if(sc[0] != null && si !== sc[0]) return;
      s.u.forEach((u, gi) => { if(sc[1] != null && gi !== sc[1]) return; u.t.forEach(ti => { if(sc[2] != null && ti !== sc[2]) return; if(QRY && !tHit(si, ti)) return;
          shownFacts(s.t[ti]).forEach(k => { const c = k.c || 'N'; if(sd === 'any' || (sd === 'fair' ? c !== 'N' : c === sd)) out.push({k, si, gi, ti}); }); }); }); });
    return out; }
  function shuffled(list){ if(side !== 'fair') return rnd(list); const l = rnd(list.filter(c => c.k.c === 'L')), r = rnd(list.filter(c => c.k.c === 'R')), out = [];
    for(let i = 0; i < Math.max(l.length, r.length); i++){ if(l[i]) out.push(l[i]); if(r[i]) out.push(r[i]); } return out; }
  /* ---------- the sentence: every word in it is a picker ---------- */
  function pick(label, items, cur, set, foot){ const w = el('span', 'kpick'); const b = el('button', 'kw', label); w.appendChild(b);
    b.onclick = e => { e.stopPropagation(); const open = S.querySelector('.kmenu'); if(open){ const same = open.parentNode === w; open.remove(); if(same) return; }
      const m = el('div', 'kmenu');
      items.forEach(([n, v, c]) => { const x = el('button', 'kmi' + (v === cur ? ' on' : '')); x.append(el('span', null, n), el('span', 'kc', String(c))); x.onclick = () => { m.remove(); set(v); }; m.appendChild(x); });
      if(foot) m.appendChild(el('div', 'kmf', foot)); w.appendChild(m); SND.tick(1.1); };
    return w; }
  function heading(){ H.innerHTML = '';
    const sides = SIDES.map(([k, n]) => [n, k, pool(scope, k).length]).filter(x => x[2] || x[1] === side);
    H.append('Facts that sting ', pick(SIDES.find(x => x[0] === side)[1], sides, side, v => { side = v; reshuffle(); }, 'Which side a fact stings was tagged by reading the line it answers. Treat the tags as rough.'), ', about ');
    const subs = [['everything', null, pool([null, null, null], side).length]].concat(P.map((s, si) => [s.n, si, pool([si, null, null], side).length]).filter(x => x[2] || x[1] === scope[0]));
    H.append(pick(scope[0] == null ? 'everything' : P[scope[0]].n, subs, scope[0], v => { scope = [v, null, null]; reshuffle(); }));
    if(scope[0] != null){ const s = P[scope[0]];
      const parts = [['every part', null, pool([scope[0], null, null], side).length]].concat(s.u.map((u, gi) => [u.n, gi, pool([scope[0], gi, null], side).length]).filter(x => x[2] || x[1] === scope[1]));
      H.append(': ', pick(scope[1] == null ? 'every part' : s.u[scope[1]].n, parts, scope[1], v => { scope = [scope[0], v, null]; reshuffle(); }));
      if(scope[1] != null){ const tops = [['every topic', null, pool([scope[0], scope[1], null], side).length]].concat(s.u[scope[1]].t.map(ti => [s.t[ti].t, ti, pool([scope[0], scope[1], ti], side).length]).filter(x => x[2] || x[1] === scope[2]));
        H.append(', ', pick(scope[2] == null ? 'every topic' : s.t[scope[2]].t, tops, scope[2], v => { scope[2] = v; reshuffle(); })); } }
    if(QRY){ H.append(el('span', 'kmention', ' that mention “' + raw() + '”')); const g = el('button', 'goback', '← go back'); g.onclick = () => { SND.tick(.8); setQ(''); }; H.append(g); }
    else H.append('.'); }
  /* ---------- the deck: the top card on a pile as thick as what's left ---------- */
  function render(enter){ S.classList.toggle('spr', spread && deck.length > 0); heading(); B.innerHTML = ''; if(io){ io.disconnect(); io = null; }
    if(!deck.length){ B.appendChild(el('div', 'lay', QRY && !totalHits() ? 'Nothing mentions “' + raw() + '”.' : 'No cards here.')); return; }
    if(spread) return renderSpread();
    const c = deck[at], k = c.k, t = P[c.si].t[c.ti], st = el('div', 'kstack'), left = deck.length - at - 1, n = Math.min(6, Math.ceil(left/8));
    for(let i = n; i >= 1; i--){ const l = el('div', 'kl kback'); l.style.transform = `translate(${i*3}px,${i*4}px)`; st.appendChild(l); }
    const box = el('div', 'kcard' + (enter ? ' in' : '') + (flipped ? ' flip' : '')); box.tabIndex = 0; box.setAttribute('role', 'button'); box.setAttribute('aria-label', flipped ? 'Turn back' : 'Turn over');
    const fr = el('div', 'kface kfront'); fr.append(el('span', 'kpath', t.t)); const big = el('span', 'kbig'), bq = el('span', 'kq'); bq.append(el('span', 'ksay', 'They say…')); const ln = el('span', 'kline'); ln.append('“', gmark(k.b), '”'); bq.append(ln); big.append(bq); fr.append(big, el('span', 'kfoot', 'tap to turn over'));
    const bk = el('div', 'kface kback2'); const top = el('span', 'kpath'); if(side !== 'any' && k.c) top.append(el('span', 'ktag', TAG[k.c])); top.append(t.t); bk.append(top);
    const f = factEl(k, 0); f.classList.add('open'); markFact(f); f.onclick = null; bk.append(f); box.append(fr, bk); st.appendChild(box);
    const flip = () => { flipped = !flipped; box.classList.toggle('flip', flipped); box.setAttribute('aria-label', flipped ? 'Turn back' : 'Turn over'); SND.tick(flipped ? 1.2 : .9); };
    let x0 = null, swiped = false; box.addEventListener('pointerdown', e => { x0 = e.clientX; swiped = false; });
    box.addEventListener('pointerup', e => { if(x0 == null) return; const dx = e.clientX - x0; x0 = null; if(Math.abs(dx) > 60){ swiped = true; step(dx < 0 ? 1 : -1); } });
    box.onclick = e => { if(e.target.closest('a,.cp') || swiped) return; flip(); }; box.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } };
    const nav = el('div', 'knav'); const pv = el('button', null, '‹'), nx = el('button', null, '›'); pv.setAttribute('aria-label', 'Previous card'); nx.setAttribute('aria-label', 'Next card'); pv.onclick = () => step(-1); nx.onclick = () => step(1);
    const re = el('button', 'kord', 'shuffle'); re.onclick = () => reshuffle();
    const sp = el('button', 'kord', 'see the spread'); sp.onclick = () => { spread = true; SND.tick(1.1); render(); };
    nav.append(pv, el('span', 'kcount', (at + 1) + ' of ' + deck.length), nx, re, sp); if(changed()) nav.append(startOver()); B.append(st, nav); }
  const changed = () => side !== 'any' || scope[0] != null || !!QRY || at > 0;
  function startOver(){ const b = el('button', 'kord', 'start over'); b.onclick = () => { side = 'any'; scope = [null, null, null]; spread = false; SND.tick(.8); if(QRY) setQ(''); else reshuffle(); }; return b; }
  /* ---------- the spread: the whole deck laid out face up, dealt a handful at a time as you scroll ---------- */
  function renderSpread(){ const bar = el('div', 'knav kspbar'); const g = el('button', 'kord', 'gather them up'); g.onclick = gather;
    const re = el('button', 'kord', 'shuffle'); re.onclick = () => { deck = shuffled(deck); SND.play('riffle'); render(); };
    bar.append(el('span', 'kcount', plural(deck.length, 'card')), re, g); if(changed()) bar.append(startOver()); const grid = el('div', 'kspread'); B.append(bar, grid);
    let shown = 0; const more = () => { const end = Math.min(deck.length, shown + 48);
      for(let i = shown; i < end; i++){ const c = deck[i], t = P[c.si].t[c.ti], m = el('button', 'kmini');
        m.style.setProperty('--r', ((i*37 % 9) - 4)*.28 + 'deg'); m.style.animationDelay = Math.min(i - shown, 24)*18 + 'ms';
        const top = el('span', 'kpath'); if(side !== 'any' && c.k.c) top.append(el('span', 'ktag', TAG[c.k.c])); top.append(t.t);
        const q = el('span', 'kline'); q.append('“', gmark(c.k.b), '”'); m.append(top, el('span', 'ksay', 'They say…'), q);
        m.onclick = () => { at = i; flipped = true; spread = false; SND.tick(1.2); render(true); }; grid.appendChild(m); }
      if(end - shown) SND.tick(1 + Math.random()*.1); shown = end;
      if(shown < deck.length){ const sen = el('div', 'ksen'); grid.appendChild(sen); io = new IntersectionObserver(es => { if(es[0].isIntersecting){ io.disconnect(); sen.remove(); more(); } }, {root: S, rootMargin: '400px'}); io.observe(sen); } };
    more(); }
  function gather(){ if(!spread) return; spread = false; at = 0; flipped = false; SND.tick(.8); render(true); }
  /* changing any word, or the search, riffles the pile and deals a fresh top card */
  async function reshuffle(){ if(busy) return; busy = true; deck = shuffled(pool(scope, side)); at = 0; flipped = false;
    const st = B.querySelector('.kstack, .kspread');
    if(st && !reduced){ heading(); st.classList.add('riff'); SND.play('riffle'); await wait(570); }
    busy = false; render(true); }
  function step(n){ if(!deck.length || busy) return; at = (at + n + deck.length) % deck.length; flipped = false; SND.tick(n > 0 ? 1.05 : .95);
    const old = B.querySelector('.kcard'); if(old && !reduced){ old.classList.remove('in'); old.classList.add(n > 0 ? 'outL' : 'outR'); setTimeout(() => render(true), 150); } else render(true); }
  addEventListener('keydown', e => { if(!S.classList.contains('on') || e.target.tagName === 'INPUT') return;
    if(spread){ if(e.key === 'Escape') gather(); return; }
    if(e.key === 'ArrowRight'){ e.preventDefault(); step(1); } if(e.key === 'ArrowLeft'){ e.preventDefault(); step(-1); }
    if(e.key === 'Escape'){ const m = S.querySelector('.kmenu'); if(m) m.remove(); }
    if(e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown'){ const c = B.querySelector('.kcard'); if(c && document.activeElement !== c){ e.preventDefault(); c.click(); } } });
  addEventListener('pointerdown', e => { if(!e.target.closest('.kpick')){ const m = S.querySelector('.kmenu'); if(m) m.remove(); } });
  /* a search narrows the deck; if the subject you were on has nothing, widen back to everything */
  function filter(q){ QRY = q; if(scope[0] != null && !pool(scope, side).length) scope = [null, null, null]; busy = false; reshuffle(); }
  return {start(){ deck = shuffled(pool(scope, side)); render(false); }, open(p){ scope = [p[0], p[1], p[2]]; reshuffle(); }, filter,
    enter(){ const c = B.querySelector('.kcard, .kmini'); if(c) c.click(); }, shown(){ ph('search…'); }};
})();
