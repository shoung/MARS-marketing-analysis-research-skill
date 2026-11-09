# -*- coding: utf-8 -*-
"""Build the owner-facing report. Production records stay in internal/."""
from pathlib import Path
from markdown_it import MarkdownIt
from bs4 import BeautifulSoup, NavigableString
import re, hashlib, json
SCRIPT_DIR=Path(__file__).resolve().parent
ROOT=SCRIPT_DIR.parent
REF=ROOT/'referance'/'starbucks'
INTERNAL=ROOT/'internal'/'starbucks'
md=MarkdownIt('commonmark').enable('table')
research=REF/'starbucks-research.md'
review=SCRIPT_DIR/'starbucks-review.md'
labels=['顧客為何反彈','優先照顧的顧客','顧客旅程','長期價格怎麼定','門市與客服怎麼做','核准與期滿銜接']
def raw(path):
 return BeautifulSoup(md.render(path.read_text()),'html.parser')
def render(path,kind):
 soup=raw(path)
 if soup.h1:soup.h1.decompose()
 for i,h in enumerate(soup.find_all('h2')):
  h['id']=('step-'+str(i+1) if i<6 else 'sources') if kind=='research' else 'review'
 for i,h in enumerate(soup.find_all('h3')):
  h['id']='kotler' if 'Kotler' in h.text else 'parasuraman' if 'Parasuraman' in h.text else kind+'-sub-'+str(i)
 for node in list(soup.find_all(string=True)):
  if node.parent.name in ['a','code','script','style']:continue
  parts=re.split(r'(https?://[^\s<>；。]+|\[\d+\])',str(node))
  if len(parts)==1:continue
  for part in parts:
   if part.startswith('http'):
    a=soup.new_tag('a',href=part,attrs={'class':'bare-url'});a.string=part;node.insert_before(a)
   elif re.fullmatch(r'\[\d+\]',part):
    a=soup.new_tag('a',href='#source-'+part[1:-1],attrs={'class':'cite'});a.string=part;node.insert_before(a)
   else:node.insert_before(NavigableString(part))
  node.extract()
 for i,t in enumerate(soup.find_all('table')):
  near=t.find_previous(['h2','h3']);title=near.get_text()
  cap=soup.new_tag('caption');cap.string='四項評分與改善重點' if kind=='review' else title;t.insert(0,cap)
  t['class']=['columns-'+str(len(t.select('thead th')))]
  heads=[th.get_text() for th in t.select('thead th')]
  for th in t.select('thead th'):th['scope']='col'
  is_sources=near.get('id')=='sources'
  for row in t.select('tbody tr'):
   for j,td in enumerate(row.find_all('td',recursive=False)):
    td['data-label']=heads[j] if j<len(heads) else ''
    if is_sources and j==0:td['id']='source-'+str(len(t.select('[id]'))+1)
  wrap=soup.new_tag('div',attrs={'id':f'{kind}-table-{i+1}','class':'table-scroll reference-table' if is_sources else 'table-scroll','tabindex':'0','role':'region','aria-label':title})
  t.wrap(wrap)
 for h in list(soup.find_all('h2')):
  section=soup.new_tag('section',attrs={'class':'chapter','aria-labelledby':h['id']});h.insert_before(section)
  current=h
  while current:
   nxt=current.next_sibling;section.append(current)
   if nxt and getattr(nxt,'name',None)=='h2':break
   current=nxt
 return soup
s=render(research,'research')
sources=s.find(id='sources').parent.extract()
back=s.new_tag('p',attrs={'class':'screen-only source-return'});back.string='回到正文　'
for i,label in enumerate(labels,1):
 a=s.new_tag('a',href='#step-'+str(i));a.string=label;back.append(a);back.append('　')
sources.h2.insert_after(back)
# The initial recommendation is the executive summary, not production preamble.
intro=[]
for child in list(s.children):
 if getattr(child,'name',None)=='section':break
 intro.append(str(child.extract()))
review_html=render(review,'review')
css=(SCRIPT_DIR/'starbucks_report.css').read_text()
nav=''.join(f'<a href="#step-{i}"><span>{i:02}</span>{label}</a>' for i,label in enumerate(labels,1))
nav+='<a href="#review"><span>審</span>策略審閱</a><a href="#sources"><span>源</span>資料來源</a>'
out=f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>臺灣星巴克｜補奶定價與信任修復</title><style>{css}</style></head><body>
<a class="skip" href="#main">跳至完整報告</a><header class="cover" id="top"><div class="cover-inner"><div class="masthead"><span>補奶定價與信任修復</span><span>完整分析報告</span></div><div class="cover-grid"><div><p class="brand">臺灣星巴克</p><h1>第 31 天起，<br><em>原價含一份標準補奶</em></h1><p class="cover-deck">臺灣門市與官方行動預點的標準冰那堤，少冰或去冰依杯型補一份原配方牛奶，各杯型現行基礎價不變。前 30 天按同一規格供應，並受理符合條件的退費。</p></div><div class="cover-aside"><p class="edition">建議長期做法</p><p class="pilot-number">0<span>元額外補奶費</span></p><p class="pilot-number">第 31<span>天起接續</span></p><div class="cover-line"></div><p>少冰或去冰的標準冰那堤</p></div></div><div class="cover-bottom"><span>定價規則 · 顧客公告 · 核准條件</span><a href="#main">閱讀完整提案 ↓</a></div></div></header>
<div class="layout"><aside class="sidebar"><nav aria-label="報告目錄"><p class="nav-title">六個步驟</p>{nav}</nav><a class="to-top" href="#top">回到封面 ↑</a></aside><main id="main" tabindex="-1"><div class="research-content"><section class="opening" aria-labelledby="summary"><h2 id="summary">提案摘要</h2>{''.join(intro)}</section><h2 id="six-steps" class="steps-title">六個步驟</h2>{s}</div><div class="expert-content">{review_html}</div><div class="source-content">{sources}</div><footer><p>臺灣星巴克｜補奶定價與信任修復</p><a href="#top">回到封面 ↑</a></footer></main></div><script>
document.querySelectorAll('.table-scroll').forEach(el=>el.addEventListener('keydown',e=>{{if(e.target!==el||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||el.scrollWidth<=el.clientWidth)return;e.preventDefault();el.scrollLeft=e.key==='Home'?0:e.key==='End'?el.scrollWidth:el.scrollLeft+(e.key==='ArrowRight'?100:-100);}}));
</script></body></html>'''
final=BeautifulSoup(out,'html.parser')
visible=final.body.get_text()
for term in ['W-v1','H-v1','Gate','SHA-256','starbucks-formal','先讀這份報告的邊界','修訂結果與後續責任','輸入版本','非品牌委託','未背書']:
 assert term not in visible,term
checks=[]
for path in [research,review]:
 orig=raw(path)
 if orig.h1:orig.h1.decompose()
 got=re.sub(r'\s+','',visible)
 blocks=[re.sub(r'\s+','',x.get_text()) for x in orig.select('p,li,th,td,h2,h3')]
 missing=[b[:100] for b in blocks if b not in got]
 checks.append({'source':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'blocks':len(blocks),'missing':missing})
assert not any(c['missing'] for c in checks),checks
(REF/'starbucks-analysis-report.html').write_text(out)
INTERNAL.mkdir(parents=True,exist_ok=True)
(INTERNAL/'content-preservation.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('HTML built; full content preserved',[(c['blocks'],len(c['missing'])) for c in checks])
