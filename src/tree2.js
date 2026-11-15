/* =================== OUTLINE: one column, branches open in place, several at once =================== */
const OL = (() => {
  const S = $('outl'), H = $('oh'), B = $('ob'); const open = new Set(); let fresh = null;
  const key = (...a) => a.join('.');
  function head(){ H.innerHTML = ''; const raw = $('find').value.trim();
    if(QRY){ H.append('Searching for “' + raw + '”'); const g = el('button', 'goback', '← go back'); g.onclick = () => { SND.tick(.8); setQ(''); }; H.append(g); }
    else H.append('So you’re sure about…'); }
  const mark = txt => { const f = document.createDocumentFragment(), i = QRY ? nrm(txt).indexOf(QRY) : -1; if(i < 0){ f.append(txt); return f; } f.append(txt.slice(0, i), el('mark', null, txt.slice(i, i + QRY.length)), txt.slice(i + QRY.length)); return f; };
  function row(label, count, k, depth, onOpen){ const isOpen = searching() && depth < 2 ? !open.has('x' + k) : open.has(k);
    const b = el('button', 'orow d' + depth + (isOpen ? ' open' : '')); b.append(el('span', 'car', isOpen ? '−' : '+')); const t = el('span', 'ot'); t.append(mark(label)); b.append(t); if(count) b.append(el('span', 'oc', count));
    b.onclick = () => { SND.tick(isOpen ? .85 : 1.15); const kk = searching() && depth < 2 ? 'x' + k : k; open.has(kk) ? open.delete(kk) : open.add(kk); fresh = isOpen ? null : k; render(); };
    return [b, isOpen]; }
  const searching = () => !!(QRY && totalHits());
  /* while searching, subjects and parts start open so every matching branch shows at once; topics stay closed until you open them */
  function render(){ head(); B.innerHTML = ''; const q = searching(); const list = el('div', 'otree');
    if(QRY && !q) list.appendChild(el('div', 'lay', 'nothing mentions “' + $('find').value.trim() + '”'));
    P.forEach((s, si) => { const sh = q ? sHits(si) : null; if(q && !sh.length) return; const k0 = key(si);
      const [b0, o0] = row(s.n, q ? plural(sh.length, 'topic') : plural(s.u.length, 'part'), k0, 0); const w0 = el('div', 'onode'); w0.appendChild(b0);
      if(o0){ const kids = el('div', 'okids' + (fresh === k0 ? ' fresh' : ''));
        s.u.forEach((u, gi) => { const gh = q ? gHits(si, gi) : null; if(q && !gh.length) return; const k1 = key(si, gi);
          const [b1, o1] = row(u.n, q ? plural(gh.length, 'topic') : plural(u.t.length, 'topic'), k1, 1); const w1 = el('div', 'onode'); w1.appendChild(b1);
          if(o1){ const kid1 = el('div', 'okids' + (fresh === k1 ? ' fresh' : ''));
            u.t.forEach(ti => { if(q && !tHit(si, ti)) return; const t = s.t[ti], k2 = key(si, gi, ti), ks = shownFacts(t);
              const [b2, o2] = row(t.t, q && ks.length < t.k.length ? ks.length + ' of ' + plural(t.k.length, 'fact') : plural(t.k.length, 'fact'), k2, 2); b2.dataset.k = k2; const w2 = el('div', 'onode'); w2.appendChild(b2);
              if(o2){ const kid2 = el('div', 'okids ofacts' + (fresh === k2 ? ' fresh' : '')); ks.forEach((kf, n) => { const x = factEl(kf, n); x.style.setProperty('--d', '0s');
                  if(q) x.querySelectorAll('.say').forEach(e => { const tx = e.textContent; e.textContent = ''; e.append(mark(tx)); }); kid2.appendChild(x); }); w2.appendChild(kid2); }
              kid1.appendChild(w2); }); w1.appendChild(kid1); }
          kids.appendChild(w1); }); w0.appendChild(kids); }
      list.appendChild(w0); });
    /* once something is open, its closed siblings go grey */
    [list, ...list.querySelectorAll('.okids:not(.ofacts)')].forEach(c => c.classList.toggle('has', [...c.children].some(n => n.querySelector(':scope > .orow.open'))));
    B.appendChild(list); fresh = null; }
  const ctl = () => { const c = el('button', 'ocollapse', 'close all'); c.onclick = () => { open.clear(); SND.tick(.8); render(); }; return c; };
  function filter(q){ QRY = q; [...open].filter(k => k[0] === 'x').forEach(k => open.delete(k)); render(); if(!reduced && q) SND.tick(1.6); }
  function openPath(p){ open.add(key(p[0])); open.add(key(p[0], p[1])); open.add(key(p[0], p[1], p[2])); open.delete('x' + key(p[0])); open.delete('x' + key(p[0], p[1])); render();
    const b = B.querySelector(`[data-k="${key(p[0], p[1], p[2])}"]`); if(b) b.scrollIntoView({block: 'center', behavior: reduced ? 'auto' : 'smooth'}); }
  return {start(){ render(); S.querySelector('.wrap').insertBefore(ctl(), B); }, open: openPath, filter, enter(){}, shown(){ ph('search…'); }};
})();

/* =================== STEMS: the old left-to-right tree, columns joined by smooth curves =================== */
const SM = (() => {
  const S = $('stem'), box = $('scols'), svg = $('ssvg'), say = $('ssay'); const NSs = 'http://www.w3.org/2000/svg';
  let sel = [null, null, null], ki = null, drawn = '';
  const cols = () => [...box.querySelectorAll('.scol')];
  function items(d){ const q = QRY && totalHits();
    if(d === 0) return P.map((s, si) => ({t: s.n, i: si})).filter(x => !q || sHits(x.i).length);
    if(d === 1) return sel[0] == null ? [] : P[sel[0]].u.map((u, gi) => ({t: u.n, i: gi})).filter(x => !q || gHits(sel[0], x.i).length);
    if(d === 2) return sel[1] == null ? [] : P[sel[0]].u[sel[1]].t.map(ti => ({t: P[sel[0]].t[ti].t, i: ti})).filter(x => !q || tHit(sel[0], x.i));
    return sel[2] == null ? [] : shownFacts(P[sel[0]].t[sel[2]]).map((k, n) => ({k, i: n})); }
  const mark = txt => { const f = document.createDocumentFragment(), i = QRY ? nrm(txt).indexOf(QRY) : -1; if(i < 0){ f.append(txt); return f; } f.append(txt.slice(0, i), el('mark', null, txt.slice(i, i + QRY.length)), txt.slice(i + QRY.length)); return f; };
  function render(){ const key = sel.join('/') + '|' + QRY, was = drawn.split('|')[0].split('/'), grewAt = was.findIndex((v, i) => v !== String(sel[i])); drawn = key;
    box.querySelectorAll('.scol').forEach(c => c.remove());
    for(let d = 0; d < 4; d++){ const its = items(d); const c = el('div', 'scol c' + d); if(!its.length){ box.appendChild(c); continue; }
      its.forEach((x, n) => { if(d < 3){ const b = el('button', 'sit'); b.style.setProperty('--n', n); const t = el('span', 'st'); t.append(mark(x.t)); b.append(t);
          b.dataset.i = x.i; if(sel[d] === x.i) b.classList.add('on'); if(sel[d] != null && sel[d] !== x.i) b.classList.add('off');
          b.onclick = () => { SND.tick([.85, 1, 1.15][d]); if(sel[d] === x.i){ sel[d] = null; } else sel[d] = x.i; for(let k = d + 1; k < 3; k++) sel[k] = null; ki = null; render(); }; c.appendChild(b); }
        else { const f = factEl(x.k, n); f.style.setProperty('--d', '0s'); if(QRY) f.querySelectorAll('.say').forEach(e => { const tx = e.textContent; e.textContent = ''; e.append(mark(tx)); }); c.appendChild(f); } });
      if(d > 0 && (grewAt < 0 ? false : d > grewAt)) c.classList.add('grow'); box.appendChild(c); }
    place(); wire(grewAt); talk();
    const last = cols().filter(c => c.children.length).pop(); if(last && grewAt >= 0) setTimeout(() => { const r = last.getBoundingClientRect(); if(r.right > innerWidth - 20) S.scrollTo({left: S.scrollLeft + r.right - innerWidth + 40, behavior: reduced ? 'auto' : 'smooth'}); }, 40); }
  /* each column sits centred on the word it grew from */
  function place(){ const cs = cols(), top = box.getBoundingClientRect().top; cs.forEach(c => c.style.marginTop = '0px');
    for(let d = 1; d < cs.length; d++){ const src = cs[d - 1].querySelector('.on'); if(!src || !cs[d].children.length) continue; const r = src.getBoundingClientRect();
      cs[d].style.marginTop = Math.max(0, r.top - top + r.height/2 - cs[d].offsetHeight/2) + 'px'; } }
  function wire(grewAt){ svg.innerHTML = ''; const B = box.getBoundingClientRect(), cs = cols(); svg.style.width = box.scrollWidth + 'px'; svg.style.height = box.scrollHeight + 'px';
    for(let d = 1; d < cs.length; d++){ const src = cs[d - 1].querySelector('.on'); if(!src) break; const st = src.querySelector('.st') || src, rs = st.getBoundingClientRect();
      const x0 = rs.right - B.left + 10, y0 = rs.top - B.top + rs.height/2; const kids = [...cs[d].children]; const selKid = cs[d].querySelector('.on');
      kids.forEach((k, n) => { const r = (k.querySelector('.say') || k).getBoundingClientRect(), x1 = r.left - B.left - 10, y1 = (d === 3 ? r.top + 11 : r.top + r.height/2) - B.top, mx = (x0 + x1)/2;
        const p = document.createElementNS(NSs, 'path'); p.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} C${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
        if(selKid && k !== selKid) p.classList.add('off'); svg.appendChild(p);
        if(!reduced && grewAt >= 0 && d > grewAt){ const L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 4); p.style.strokeDashoffset = L + 2; p.getBoundingClientRect();
          p.style.transition = `stroke-dashoffset .38s cubic-bezier(.5,0,.2,1) ${n*.02}s, opacity .3s`; p.style.strokeDashoffset = 0; } }); } }
  function talk(){ say.innerHTML = ''; const w = []; if(sel[0] != null) w.push(P[sel[0]].n); if(sel[1] != null) w.push(P[sel[0]].u[sel[1]].n); if(sel[2] != null) w.push(P[sel[0]].t[sel[2]].t);
    if(QRY){ say.append('Searching for “' + $('find').value.trim() + '”' + (w.length ? ' in ' + w.join(', ') : '')); return; }
    say.append('So you’re sure about' + (w.length ? ' ' : '…')); w.forEach((x, i) => { say.append(el('b', null, x), i === w.length - 1 ? '?' : ', '); }); }
  function filter(q){ QRY = q; for(let d = 0; d < 3; d++){ if(sel[d] != null && !items(d).some(x => x.i === sel[d])) for(let k = d; k < 3; k++) sel[k] = null; } drawn = ''; render(); }
  addEventListener('resize', () => { if(S.classList.contains('on')){ place(); wire(-1); } });
  return {start(){ render(); }, open(p){ sel = [p[0], p[1], p[2]]; drawn = ''; render(); }, filter, enter(){}, shown(){ ph('search…'); place(); wire(-1); }};
})();
