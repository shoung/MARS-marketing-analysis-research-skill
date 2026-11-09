# -*- coding: utf-8 -*-
"""Build the owner-facing report. Production records stay in internal/."""
from pathlib import Path
from markdown_it import MarkdownIt
from bs4 import BeautifulSoup, NavigableString
import re, hashlib, json
SCRIPT_DIR=Path(__file__).resolve().parent
ROOT=SCRIPT_DIR.parent
REF=ROOT/'referance'/'nike'
INTERNAL=ROOT/'internal'/'nike'
md=MarkdownIt('commonmark').enable('table')
research=REF/'nike-research.md'
review=SCRIPT_DIR/'nike-review.md'
labels=['發現問題','認識客戶','設計客戶體驗','AI 服務創新運用','服務藍圖','行銷提案']
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
 source_row=0
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
    if is_sources and j==0:
     source_row+=1
     td['id']=f'source-{source_row}'
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
css=(SCRIPT_DIR/'nike_report.css').read_text()
nav=''.join(f'<a href="#step-{i}"><span>{i:02}</span>{label}</a>' for i,label in enumerate(labels,1))
nav+='<a href="#review"><span>審</span>策略審閱</a><a href="#sources"><span>源</span>資料來源</a>'
out=f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>Nike 如何重回跑者的選擇？</title><style>{css}</style></head><body>
<a class="skip" href="#main">跳至完整報告</a><header class="cover" id="top"><div class="cover-inner"><div class="masthead"><span>跑步品類行銷提案</span><span>美國市場｜完整分析報告</span></div><div class="cover-grid"><div><p class="brand">NIKE 跑步品類</p><h1>Nike 如何重回<br><em>跑者的選擇？</em></h1><p class="cover-deck">2026 財年營收比 2024 財年高點低 9.7%，淨利比 2022 財年高點低 48.6%。先從已回升的跑步做起，為開始或恢復日常路跑的美國成年女性提供跑店試穿與試跑，驗證能否帶來新增成交與獲利。</p></div><div class="cover-aside"><p class="edition">以 Nike 自身高點為準</p><p class="cover-focus">2024 財年<br>營收規模</p><div class="cover-line"></div><p class="cover-focus">2022 財年<br>獲利水準</p></div></div><div class="cover-bottom"><span>顧客洞察 · 通路體驗 · 投資驗證</span><a href="#main">閱讀完整提案 ↓</a></div></header>
<div class="layout"><aside class="sidebar"><nav aria-label="報告目錄"><p class="nav-title">六個步驟</p>{nav}</nav><a class="to-top" href="#top">回到封面 ↑</a></aside><main id="main" tabindex="-1"><div class="research-content"><section class="opening" aria-labelledby="summary"><h2 id="summary">提案摘要</h2>{''.join(intro)}</section><h2 id="six-steps" class="steps-title">六個步驟</h2>{s}</div><div class="expert-content">{review_html}</div><div class="source-content">{sources}</div><footer><p>Nike 如何重回跑者的選擇？</p><a href="#top">回到封面 ↑</a></footer></main></div><script>
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
(REF/'nike-analysis-report.html').write_text(out)
INTERNAL.mkdir(parents=True,exist_ok=True)
(INTERNAL/'content-preservation.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
print('HTML built; full content preserved',[(c['blocks'],len(c['missing'])) for c in checks])
