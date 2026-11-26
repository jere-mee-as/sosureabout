import json,sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); from shell5 import page4
P=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sosureabout.json')))
tree=[];units=[]
for fi,f in enumerate(P):
    g={'n':f['n'],'i':f.get('sg',''),'items':[]}
    for ui,u in enumerate(f['u']):
        iid=f'{fi}.{ui}'; g['items'].append({'id':iid,'n':u['n']})
        for ti in u['t']:
            t=f['t'][ti]
            for k in t['k']:
                units.append({'it':iid,'g':t['t'],'k':t.get('g',''),'b':k['b'],'f':k['f'],'l':k.get('l',''),'s':k.get('src',''),'u':k.get('u','')})
    tree.append(g)
site={'tree':tree,'units':units,'noun':['fact','facts'],'by':'subject',
 'INTRO':'What people say, and what the evidence shows. Each fact comes with its warning and source.'}
theme=r'''
:root{--bg:#f6f5ef;--fg:#0d0d0d;--fg2:#1f1f1c;--dim:#5f5d57;--line:#d6d3c9;--line2:#e6e3da;--acc:#c4320a;--hov:#efede5;--sel:#fff;--hl:#ffd2c4;--panel:#fff;
--bar:#0d0d0d;--barfg:#fff;--bardim:#a3a097;--barline:#3a3a3a;--field:#1d1d1d;--sayacc:#ff6a3d;
--display:"Archivo Black",sans-serif;--text:Archivo,Helvetica,Arial,sans-serif;--label:"Archivo Narrow",Archivo,sans-serif;--displs:-.01em}
header{border-bottom:4px solid var(--acc)}
#say{text-transform:uppercase;font-size:23px}
.sub,.crumb .c,.d .lab,.hw h3{text-transform:uppercase;letter-spacing:.05em;font-weight:700}.gh{font-family:var(--text);font-weight:600}
.sub{border-bottom:2px solid var(--fg)}
.row .heard{display:block;font-size:13px;color:var(--dim);margin-bottom:3px}
.row .heard q{color:var(--fg2);font-weight:600}
.row .p1{font-size:15px;line-height:1.5}
.d h3{font:400 13.5px/1.4 var(--text);color:var(--dim)}.d h3 q{display:block;font:700 17px/1.35 var(--text);color:var(--fg);margin-top:2px}
.d .warn{font-size:15px;line-height:1.55}
.kinds{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:14px}.kinds b{font:500 12px var(--mono);color:var(--dim);margin-left:4px}
.fr .q{font-size:14.5px}.fr .src{font:700 12px var(--label);text-transform:uppercase;letter-spacing:.04em;color:var(--acc);white-space:nowrap}
'''
js=r'''
SITE.BLOB=u=>[u.g,u.b,u.f,u.l].join(' ');
SITE.SAY=(it,u,q)=>q?`So you’re sure about “${esc(q)}”?`:!it?'So you’re sure about…':`So you’re sure about <b>${esc(u?u.g:it.n)}</b>?`;
SITE.ROW=(u,Q)=>`<span class="heard">You’ve heard <q>${hl(u.b,Q)}</q></span><span class="p1">${hl(u.f,Q)}${cpb(u.f+(u.s?' ('+u.s+')':''))}</span>`;
SITE.DETAIL=(u,Q)=>`${u.l?lab('⚠ Warning')+`<p class="warn">${hl(u.l,Q)}</p>`:''}${u.s?lab('Source')+`<p class="src">${u.u?`<a href="${esc(u.u)}" target="_blank" rel="noopener">${esc(u.s)} ↗</a>`:esc(u.s)}</p>`:''}`;
SITE.FEATURE=()=>{const K={};SITE.units.forEach(u=>{if(u.k)K[u.k]=(K[u.k]||0)+1});
 const pool=SITE.units.slice(),pick=[];for(let i=0;i<5;i++)pick.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 return `<h3>A few to start with</h3><div class="feat">${pick.map(u=>`<button class="fr" data-jump="${u.ix}"><span class="q">${esc(u.f)}</span><span class="src">${esc(u.g)}</span></button>`).join('')}</div>`};
'''
page4('sosureabout','So you’re sure about…','family=Archivo+Black&family=Archivo+Narrow:wght@700&family=Archivo:wght@400;500;600;700',theme,site,js)
