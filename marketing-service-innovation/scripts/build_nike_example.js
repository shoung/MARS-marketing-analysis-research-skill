/* Editable Nike proposal. Requires PptxGenJS 4.x.
 * Usage: node build_nike_example.js [output.pptx]
 */
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const notes = require('./nike-notes.json');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.lang = 'zh-TW';
pptx.author = '企業行銷提案';
pptx.subject = 'Nike 品牌與通路復甦';
pptx.title = 'Nike 品牌與通路復甦提案';
pptx.theme = {headFontFace: 'Heiti TC', bodyFontFace: 'Heiti TC', lang: 'zh-TW'};

const palette = {
  dark: '181C1A',
  ink: '212623',
  paper: 'F7F8F2',
  white: 'FFFFFF',
  muted: '505950',
  light: 'E4E9DD',
  border: 'CBD3C5',
  darkBorder: '657161',
  lime: 'DCF865',
  pale: 'EBF2CC',
  moss: '405715',
};
const width = 13.333;
const height = 7.5;
const left = .60;
const right = 12.73;
const contentWidth = right - left;
const shape = pptx.ShapeType;
const bounds = [];

function box(slide, x, y, w, h, color) {
  slide.addShape(shape.rect, {x, y, w, h, fill: {color}, line: {color, transparency: 100}});
}
function line(slide, x, y, endX, color = palette.border, dashType) {
  slide.addShape(shape.line, {x, y, w: endX - x, h: 0, line: {color, width: .85, dashType}});
}
function text(slide, value, x, y, w, h, fontSize = 20, color = palette.ink, options = {}) {
  bounds.push({slide: pptx._slides.length, x, y, w, h, value});
  slide.addText(value, {
    x, y, w, h, fontFace: 'Heiti TC', color, fontSize, margin: 0,
    valign: 'mid', paraSpaceAfterPt: 0, ...options,
  });
}
function bodyPage(number, step, title, source, {dark = false, titleSize = 32} = {}) {
  const slide = pptx.addSlide();
  const opening = number === 1;
  const color = dark ? palette.white : palette.ink;
  const accent = dark ? palette.lime : palette.moss;
  slide.background = {color: dark ? palette.dark : palette.paper};
  if (opening) {
    text(slide, '六個步驟', left, .26, 5, .34, 20, color, {bold: true});
    text(slide, 'Nike｜品牌與通路復甦', right - 4, .27, 4, .34, 14, accent, {align: 'right'});
  }
  text(slide, step, left, opening ? .68 : .36, contentWidth, .35, 15.4, accent, {bold: true});
  text(slide, title, left, opening ? 1.12 : .88, contentWidth, .67, titleSize, color, {bold: true});
  line(slide, left, 7.01, right, dark ? palette.darkBorder : palette.border);
  text(slide, source, left, 7.12, 11.1, .20, 9.8, dark ? palette.light : palette.muted);
  text(slide, String(number).padStart(2, '0') + ' / 08', right - .84, 7.09, .84, .24, 10.3, color, {align: 'right'});
  slide.addNotes(notes[number]);
  return slide;
}
function callout(slide, label, value, y, {dark = false, height = .72} = {}) {
  const fill = dark ? palette.lime : palette.pale;
  box(slide, left, y, contentWidth, height, fill);
  text(slide, label, left + .17, y, 2.0, height, 15.7, palette.moss, {bold: true});
  text(slide, value, left + 2.26, y + .05, contentWidth - 2.47, height - .10, 16.1);
}
function table(slide, {y, widths, headings, rows, rowH, fontSize = 16.5, headH = .55, highlight = -1, align = []}) {
  let cellX = left;
  headings.forEach((heading, i) => {
    box(slide, cellX, y, widths[i], headH, palette.dark);
    text(slide, heading, cellX + .11, y, widths[i] - .22, headH, 14.8, palette.white, {bold: true, align: align[i] || 'left'});
    cellX += widths[i];
  });
  rows.forEach((row, r) => {
    cellX = left;
    const top = y + headH + r * rowH;
    row.forEach((cell, i) => {
      box(slide, cellX, top, widths[i], rowH, r === highlight ? palette.pale : r % 2 ? palette.paper : palette.white);
      text(slide, cell, cellX + .11, top + .03, widths[i] - .22, rowH - .06, fontSize,
        palette.ink, {align: align[i] || 'left', bold: r === highlight || i === 0});
      cellX += widths[i];
    });
    line(slide, left, top + rowH, right);
  });
}
function metricRow(slide, metrics, y, {dark = false} = {}) {
  const gap = .17;
  const w = (contentWidth - gap * (metrics.length - 1)) / metrics.length;
  metrics.forEach(({label, value, detail}, i) => {
    const x = left + i * (w + gap);
    box(slide, x, y, w, 1.62, dark ? palette.paper : palette.white);
    box(slide, x, y, w, .05, palette.lime);
    text(slide, label, x + .16, y + .13, w - .32, .33, 13.9, palette.moss, {bold: true});
    text(slide, value, x + .16, y + .49, w - .32, .52, 28, palette.ink, {bold: true});
    text(slide, detail, x + .16, y + 1.07, w - .32, .45, 14.0, palette.muted);
  });
}

function cover({kicker, title, subtitle}) {
  const slide = pptx.addSlide();
  slide.background = {color: palette.dark};
  box(slide, 8.62, 0, width - 8.62, height, palette.lime);
  // Editable track outline and course markers, with no logos or borrowed artwork.
  [0, .28, .56, .84].forEach((inset) => {
    slide.addShape(shape.roundRect, {
      x: 9.47 + inset / 2, y: 1.02 + inset / 2, w: 3.05 - inset,
      h: 5.36 - inset, rotate: 13, radius: .70,
      fill: {color: palette.lime, transparency: 100},
      line: {color: palette.dark, width: 1.05},
    });
  });
  [[10.14, 2.06], [11.76, 4.93]].forEach(([x, y], index) => {
    slide.addShape(shape.ellipse, {
      x, y, w: .22, h: .22, fill: {color: index ? palette.paper : palette.dark},
      line: {color: palette.dark, width: .85},
    });
  });
  text(slide, kicker, .76, .74, 7.55, .40, 17, palette.lime, {bold: true});
  box(slide, .76, 1.43, .72, .07, palette.lime);
  text(slide, title, .76, 1.88, 7.56, 1.92, 43, palette.white, {bold: true});
  text(slide, subtitle, .76, 4.21, 7.45, 1.07, 23, palette.light);
  slide.addNotes(notes[0]);
}

function diagnosis({step, title, source, period, metrics, observations, decision}) {
  const slide = bodyPage(1, step, title, source, {titleSize: 32});
  text(slide, period, left, 1.87, contentWidth, .29, 14.6, palette.muted);
  metricRow(slide, metrics, 2.24);
  observations.forEach(({label, value}, i) => {
    const y = 4.04 + i * .67;
    line(slide, left, y, right);
    text(slide, label, left, y + .07, 2.43, .52, 16.8, palette.moss, {bold: true});
    text(slide, value, left + 2.58, y + .07, contentWidth - 2.58, .52, 17.1);
  });
  callout(slide, decision.label, decision.value, 6.18);
}

function persona({step, title, source, portrait, insights, theory}) {
  const slide = bodyPage(2, step, title, source, {titleSize: 32});
  box(slide, left, 1.90, 4.11, 3.90, palette.dark);
  text(slide, portrait.label, .84, 2.18, 3.63, .33, 15, palette.lime, {bold: true});
  text(slide, portrait.title, .84, 2.72, 3.63, 1.05, 28, palette.white, {bold: true});
  line(slide, .84, 4.07, 4.46, palette.darkBorder);
  text(slide, portrait.body, .84, 4.26, 3.63, 1.22, 19.2, palette.light);
  insights.forEach(({label, value}, i) => {
    const y = 1.90 + i * 1.25;
    text(slide, label, 5.04, y, 7.69, .34, 16.8, palette.moss, {bold: true});
    text(slide, value, 5.04, y + .42, 7.69, .65, 18.5);
    line(slide, 5.04, y + 1.13, right);
  });
  callout(slide, theory.label, theory.value, 6.12);
}

function journey({step, title, source, headings, rows, takeaway}) {
  const slide = bodyPage(3, step, title, source);
  const widths = headings.length === 4 ? [2.20, 3.20, 3.75, 2.98] : [2.86, 4.27, 5];
  table(slide, {y: 1.89, widths, headings, rows, rowH: .86, fontSize: 16.7});
  callout(slide, takeaway.label, takeaway.value, 6.16);
}

function comparison({step, title, source, headings, rows, recommended, scale, tradeoff, sensitivity}) {
  const slide = bodyPage(4, step, title, source);
  text(slide, scale, left, 1.69, contentWidth, .36, 16.6, palette.muted);
  const nameWidth = 3.56;
  const scoreWidth = (contentWidth - nameWidth) / (headings.length - 1);
  table(slide, {
    y: 2.18, widths: [nameWidth, ...headings.slice(1).map(() => scoreWidth)], headings, rows,
    rowH: .79, fontSize: 17.5, headH: .62, highlight: recommended,
    align: ['left', ...headings.slice(1).map(() => 'center')],
  });
  text(slide, tradeoff, left, 5.30, contentWidth, .62, 17);
  callout(slide, sensitivity.label, sensitivity.value, 6.16);
}

function playbook({step, title, source, products, actions, takeaway}) {
  const slide = bodyPage(5, step, title, source);
  const gap = .18;
  const w = (contentWidth - gap * (products.length - 1)) / products.length;
  products.forEach(({label, value}, i) => {
    const x = left + i * (w + gap);
    box(slide, x, 1.84, w, 1.35, palette.dark);
    text(slide, label, x + .17, 1.99, w - .34, .37, 18, palette.lime, {bold: true});
    text(slide, value, x + .17, 2.46, w - .34, .50, 25, palette.white, {bold: true});
  });
  actions.forEach(({label, value}, i) => {
    const y = 3.49 + i * .82;
    line(slide, left, y, right);
    text(slide, label, left, y + .11, 2.40, .58, 16.9, palette.moss, {bold: true});
    text(slide, value, left + 2.54, y + .09, contentWidth - 2.54, .63, 17.2);
  });
  callout(slide, takeaway.label, takeaway.value, 6.16);
}

function blueprint({step, title, source, headings, rows, takeaway}) {
  const slide = bodyPage(6, step, title, source);
  const titleW = 1.65;
  const colW = (contentWidth - titleW) / (headings.length - 1);
  const widths = [titleW, ...headings.slice(1).map(() => colW)];
  let x = left;
  headings.forEach((heading, i) => {
    box(slide, x, 1.83, widths[i], .52, palette.dark);
    text(slide, heading, x + .09, 1.83, widths[i] - .18, .52, 15.2, palette.white, {bold: true});
    x += widths[i];
  });
  let y = 2.35;
  rows.forEach((row, r) => {
    if (typeof row === 'string') {
      text(slide, row, left + .08, y, titleW - .17, .25, 11.8, palette.moss, {bold: true});
      line(slide, left + titleW, y + .13, right, palette.moss, 'dash');
      y += .27;
      return;
    }
    x = left;
    row.forEach((cell, i) => {
      const fill = i === 0 || r === 1 ? palette.pale : palette.white;
      box(slide, x, y, widths[i], .61, fill);
      text(slide, cell, x + .09, y + .015, widths[i] - .18, .58,
        i === 0 ? 14.4 : 15.0, palette.ink, {bold: i === 0});
      x += widths[i];
    });
    line(slide, left, y + .61, right);
    y += .61;
  });
  callout(slide, takeaway.label, takeaway.value, 6.33, {height: .55});
}

function fieldTrial({step, title, source, stages, measures, stop}) {
  const slide = bodyPage(7, step, title, source);
  const gap = .23;
  const w = (contentWidth - gap * (stages.length - 1)) / stages.length;
  stages.forEach(({label, value}, i) => {
    const x = left + i * (w + gap);
    box(slide, x, 1.84, w, 1.61, palette.white);
    box(slide, x, 1.84, w, .052, palette.lime);
    text(slide, label, x + .14, 2.02, w - .28, .36, 17, palette.moss, {bold: true});
    text(slide, value, x + .14, 2.46, w - .28, .79, 15.7);
  });
  measures.forEach(({label, value}, i) => {
    const y = 3.66 + i * .72;
    line(slide, left, y, right);
    text(slide, label, left, y + .08, 2.43, .55, 16.2, palette.moss, {bold: true});
    text(slide, value, left + 2.56, y + .08, contentWidth - 2.56, .55, 17);
  });
  callout(slide, stop.label, stop.value, 6.16);
}

function roadmap({step, title, source, ask, lanes, guardrail}) {
  const slide = bodyPage(8, step, title, source, {dark: true, titleSize: 31});
  box(slide, left, 1.82, contentWidth, .96, palette.lime);
  text(slide, ask.label, left + .18, 1.92, 3.45, .76, 24, palette.ink, {bold: true});
  text(slide, ask.value, left + 3.82, 1.94, contentWidth - 4.02, .72, 16.8, palette.ink);
  lanes.forEach(({label, value}, i) => {
    const y = 3.02 + i * .77;
    line(slide, left, y, right, palette.darkBorder);
    text(slide, label, left, y + .09, 2.41, .57, 17.4, palette.lime, {bold: true});
    text(slide, value, left + 2.54, y + .08, contentWidth - 2.54, .61, 16.7, palette.white);
  });
  line(slide, left, 6.18, right, palette.darkBorder);
  text(slide, guardrail, left, 6.27, contentWidth, .60, 15.6, palette.light, {bold: true});
}

async function save() {
  if (notes.length !== pptx._slides.length) {
    throw new Error('Speaker notes count must match the slide count.');
  }
  for (const item of bounds) {
    if (item.x < 0 || item.y < 0 || item.x + item.w > width + .01 || item.y + item.h > height + .01) {
      throw new Error('Text box outside slide: ' + JSON.stringify(item));
    }
  }
  const output = process.argv[2] || path.resolve(__dirname, '../referance/nike/nike-example.pptx');
  await pptx.writeFile({fileName: output});
}

cover({
  kicker: 'Nike｜品牌與通路復甦提案',
  title: 'Nike 如何重回\n跑者的選擇？',
  subtitle: '從 Nike 自己的高點找差距，\n先用跑店把產品優勢變成新增成交。',
});

diagnosis({
  step: 'Step 1 | 發現問題- Nike 離自己的高點有多遠',
  title: 'Nike 的復甦，要先追回自己的營收與獲利動能',
  source: 'Nike FY2022、FY2026 年報・FY2027 第一季財報與法說・Nike Breaking2',
  period: '2024 財年（近期營收高點）→ 2026 財年｜申報口徑，金額為億美元',
  metrics: [
    {label: '集團營收', value: '−9.7%', detail: '513.62 → 463.98 億美元'},
    {label: '集團淨利', value: '−45.5%', detail: '57.00 → 31.08 億美元'},
    {label: 'Nike 自營通路營收', value: '−17.7%', detail: '215.19 → 177.20 億美元'},
  ],
  observations: [
    {label: '2022 財年獲利基準', value: '集團淨利 60.46 → 31.08 億美元（2026 財年，−48.6%）。'},
    {label: '跑步是切入點', value: '2027 財年第一季集團營收年減 4%，管理層稱 Running 仍雙位數成長。'},
    {label: '延續 Breaking2', value: '理解跑者需求，做出產品差異，再讓顧客親自感受到。'},
  ],
  decision: {label: '提案方向', value: '先用美國專業跑店，驗證跑鞋的產品進展能否帶來更多留存成交。'},
});

persona({
  step: 'Step 2 | 認識客戶- 誰最需要重新認識 Nike 跑鞋',
  title: '先服務準備開始或回來跑的女性',
  source: 'Circana 美國鞋類追蹤・L.E.K. 2026 美國品牌熱度研究・Nike 官方路跑系列',
  portrait: {
    label: '顧客輪廓（研究假設）',
    title: '美國女性\n日常路跑者',
    body: '準備開始或恢復日常路跑。\n近期想找合腳、跑感與價格\n都合適的鞋。',
  },
  insights: [
    {label: '她在意', value: '合腳、跑感與價格，能在跑店實際比較。'},
    {label: '她猶豫', value: '型號多、不好比較，合適尺碼不一定有。'},
    {label: '她期待與如何驗證', value: '希望能試跑、有售後窗口。\n先訪談 12 位顧客及 6 位店員，比較不同年齡和跑步動機。'},
  ],
  theory: {label: '競爭線索', value: '美國 2026 年第三季跑鞋零售金額年增 10%。\n女性運動鞋熱度：Nike 100、HOKA 92、On 91。女性 Z 世代 Nike 與 On 並列第一。'},
});

journey({
  step: 'Step 3 | 設計客戶體驗- 從比較到第一次跑',
  title: '從第一眼到第一次跑，減少選錯的疑慮',
  source: 'Lemon、Verhoef（2016）顧客旅程',
  headings: ['階段', '顧客可能卡住', '改善'],
  rows: [
    ['購買前\n看評測和門市資訊', '系列名多，不知道差在哪', '用跑感分三類，顯示可試時段'],
    ['購買中\n到店比較兩雙', '想要的尺碼不一定有', '確認可試尺碼，安排短距試穿'],
    ['購買後\n第一次穿去跑', '不確定如何開始或退換', '提供初跑指引，原通路接手'],
    ['下次選擇\n回店或推薦', '上一次感受沒回到門市', '自願回饋鞋感，改善下次建議'],
  ],
  takeaway: {label: '接起每一步', value: '門市說明、實際試穿與跑後支援都指向同一個選鞋承諾。'},
});

comparison({
  step: 'Step 4 | AI 服務創新運用- 先驗證跑店服務',
  title: '先驗證跑店服務，再談全國投放',
  source: '提案方案評估',
  headings: ['方案', '顧客適配\n35%', '可驗證性\n25%', '成本可控\n20%', '啟動速度\n20%', '加權分'],
  rows: [
    ['全國形象投放', '4', '2', '2', '5', '3.30'],
    ['跑店試穿與帶跑', '5', '5', '4', '3', '4.40'],
    ['廣泛折扣拉新', '3', '4', '1', '5', '3.25'],
  ],
  recommended: 1,
  scale: '1–5 分為提案判斷，5 分最符合標準。',
  tradeoff: '全國投放曝光快，廣泛折扣可能壓縮毛利。跑店方案直接檢驗選鞋與留存成交。',
  sensitivity: {label: '速度優先時', value: '速度權重升至 45%，跑店仍以 3.90 領先。準備延誤時，先小規模修流程。'},
});

playbook({
  step: 'Step 4 | AI 服務創新運用- 先驗證跑店服務',
  title: '三種跑感選擇，一次真實試穿',
  source: 'Nike 路跑鞋及 Nike Run Club・Keller（1993）顧客基礎品牌權益',
  products: [
    {label: 'Pegasus', value: '回彈'},
    {label: 'Vomero', value: '厚緩震'},
    {label: 'Structure', value: '支撐'},
  ],
  actions: [
    {label: '實際比較', value: '店員問跑步情境、協助比較兩雙。短跑為自選，無場地則改為店內試穿。'},
    {label: '買後還能問', value: '提供紙本或選用 Nike Run Club 語音指引。原通路接手退換。'},
    {label: 'AI 支援', value: '協助活動文案與整理去識別回饋。教練及店員核對建議。'},
  ],
  takeaway: {label: '品牌權益', value: '親自試到合腳，Nike 更容易和「適合我的日常跑鞋」連在一起。'},
});

blueprint({
  step: 'Step 5 | 服務藍圖- 讓門市、教練和 Nike 接上',
  title: '跑店、教練和 Nike 接好每一步',
  source: 'Bitner、Ostrom、Morgan（2008）服務藍圖',
  headings: ['服務層次', '找店與預約', '比較兩雙鞋', '第一次跑', '售後與回店'],
  rows: [
    ['顧客可見', '門市頁、可試時段', '三種跑感卡', '紙本、語音指引', '收據、退換規則'],
    ['顧客行動', '找店或到店', '比較後自行選', '自選跟跑或略過', '回原購買通路'],
    '互動線',
    ['前台', '店員確認場次', '量尺、試穿、交接教練', '教練帶跑、店員給指引', '原店接手退換'],
    '可視線',
    ['後台', '排班與核對尺碼', '登記缺碼、啟動補貨', '檢查天候，必要時改室內', '核對退貨與實銷'],
    '內部互動線',
    ['支援', '預約與排班', '商品、配送', '跑步團隊、店長', '通路與 Nike 財務'],
  ],
  takeaway: {label: '權責與選擇', value: 'Nike 通路與店長處理缺碼。買鞋、下載 App 或提供聯絡資料由顧客自行決定。'},
});

fieldTrial({
  step: 'Step 6 | 行銷提案- 用新增貢獻決定是否擴大',
  title: '用 48 家店驗證，最多投入 12 萬美元',
  source: '提案成本與試點算例・財務依實際通路成本結算',
  stages: [
    {label: '先準備｜3 萬美元', value: '確認可試尺碼與門市容量。\n核對資料與測量精度。'},
    {label: '12 週｜追加 9 萬', value: '用前 8 週資料配對，成對隨機。\n24 家試驗店、24 家對照店。'},
    {label: '退貨期滿再結算', value: 'Nike 同類換款不計新增。\n另扣退貨和通路轉單。\nNike 與跑店分開算貢獻。'},
  ],
  measures: [
    {label: '基準打平', value: '每雙新增淨貢獻 40 美元，需 3,000 雙，約每店每週新增留存 10.4 雙。'},
    {label: '不利情境', value: '每雙 30 美元，需 4,000 雙，約每店每週 13.9 雙。零新增則承擔已核准支出。'},
    {label: '擴大門檻', value: 'Nike 及跑店貢獻、尺碼供應及售後均須過關。合作跑店自行決定價格。'},
  ],
  stop: {label: '查核與停損', value: '第 4、8 週檢查供貨、工時、資料與預算。必要時停止新增活動。'},
});

roadmap({
  step: 'Step 6 | 行銷提案- 用新增貢獻決定是否擴大',
  title: '跑步先驗證，其他三條復甦線各自推進',
  source: 'Nike FY2027 第一季官方法說、10-Q・2022、2026 財年 10-K',
  ask: {label: '今天先核准 3 萬美元', value: '指定北美 Running、合作通路與財務負責人。\n9 萬美元試點款待準備過關再放行。'},
  lanes: [
    {label: '美國跑步', value: '第 1 月準備、第 2–4 月試點、第 5–6 月結算。第 7–12 月達標再擴。'},
    {label: 'Sportswear', value: '全球商品團隊測試有清楚穿搭用途的新款，按原價售罄、庫齡與貢獻重配貨架。'},
    {label: 'Jordan', value: 'Jordan 團隊縮減特定經典復刻的供給與頻率，追原價實銷、剩貨及取得機會。'},
    {label: '大中華', value: '大中華團隊按城市測本地商品與門市，追同城實銷、庫齡與淨貢獻，獨立核准擴大。'},
  ],
  guardrail: '規模每季對照 2024 財年集團營收及 Nike 自營收入。\n獲利每季對照 2022 財年淨利 60.46 億美元及淨利率約 12.9%。',
});

save().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
