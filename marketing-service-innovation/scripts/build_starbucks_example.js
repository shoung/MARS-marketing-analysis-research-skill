/* Editable Starbucks proposal. Requires PptxGenJS 4.x.
 * Usage: node build_starbucks_example.js [output.pptx]
 */
const pptxgen = require('pptxgenjs');
const path = require('path');
const notes = require('./starbucks-notes.json');
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = '服務創新提案小組';
pptx.company = '服務創新提案小組';
pptx.lang = 'zh-TW';
pptx.subject = '臺灣星巴克補奶收費公關危機';
pptx.title = '臺灣星巴克補奶收費危機與長期定價提案';
pptx.theme = {headFontFace: 'Heiti TC', bodyFontFace: 'Heiti TC', lang: 'zh-TW'};

const palette = {
  green: '123D33',
  ink: '203C33',
  paper: 'F7F4ED',
  soft: 'DDE9E0',
  white: 'FFFFFF',
  muted: '506258',
  line: 'CFD9CD',
  rust: '97431B',
  paleRust: 'EFC6AD',
  greenLine: '638579'
};
const width = 13.333;
const height = 7.5;
const left = .6;
const right = 12.73;
const column = right - left;
const shape = pptx.ShapeType;
const bounds = [];

function box(slide, x, y, w, h, fill) {
  slide.addShape(shape.rect, {x, y, w, h, fill: {color: fill}, line: {color: fill, transparency: 100}});
}
function line(slide, x, y, endX, color = palette.line, dashType) {
  slide.addShape(shape.line, {x, y, w: endX - x, h: 0, line: {color, width: 0.8, dashType}});
}
function copy(slide, value, x, y, w, h, fontSize = 20, color = palette.ink, options = {}) {
  bounds.push({slide: pptx._slides.length, x, y, w, h, value});
  slide.addText(value, {
    x, y, w, h, fontFace: 'Heiti TC', color, fontSize,
    margin: 0, valign: 'mid', paraSpaceAfterPt: 0,
    ...options,
  });
}
function page(number, label, title, source, {dark = false, titleSize = 33} = {}) {
  const slide = pptx.addSlide();
  slide.background = {color: dark ? palette.green : palette.paper};
  const ink = dark ? palette.white : palette.green;
  const secondary = dark ? palette.soft : palette.rust;
  const isOpening = number === 1;
  if (isOpening) {
    copy(slide, '六個步驟', left, .27, 4.0, .36, 21, ink, {bold: true});
    copy(slide, '臺灣星巴克｜補奶收費危機', right - 6.0, .29, 6.0, .32, 15, secondary, {align: 'right'});
  }
  copy(slide, label, left, isOpening ? .72 : .36, column, .35, 16, secondary, {bold: true});
  copy(slide, title, left, isOpening ? 1.12 : .85, column, .68, titleSize, ink, {bold: true});
  line(slide, left, 7.01, right, dark ? palette.greenLine : palette.line);
  copy(slide, source, left, 7.12, 11, .18, 9.7, dark ? palette.soft : palette.muted);
  copy(slide, String(number).padStart(2, '0') + ' / 08', right - .85, 7.09, .85, .23, 10.2, ink, {align: 'right'});
  slide.addNotes(notes[number]);
  return slide;
}
function dataTable(slide, {x = left, y, widths, headings, rows, rowH = .6, highlight = -1, size = 16.5, headerH = .53, align = []}) {
  let cellX = x;
  headings.forEach((heading, i) => {
    box(slide, cellX, y, widths[i], headerH, palette.green);
    copy(slide, heading, cellX + .12, y, widths[i] - .24, headerH, 15, palette.white, {align: align[i] || 'left', bold: true});
    cellX += widths[i];
  });
  rows.forEach((row, r) => {
    cellX = x;
    const top = y + headerH + r * rowH;
    row.forEach((cell, i) => {
      box(slide, cellX, top, widths[i], rowH, r === highlight ? palette.soft : r % 2 ? palette.paper : palette.white);
      copy(slide, cell, cellX + .12, top + .04, widths[i] - .24, rowH - .08, size,
        r === highlight ? palette.green : palette.ink, {align: align[i] || 'left', bold: r === highlight || i === 0});
      cellX += widths[i];
    });
    line(slide, x, top + rowH, x + widths.reduce((a, b) => a + b, 0));
  });
}

function emphasis(slide, title, body, y, {fill = palette.soft, labelColor = palette.green} = {}) {
  box(slide, left, y, column, .72, fill);
  copy(slide, title, left + .18, y, 2.04, .72, 15.5, labelColor, {bold: true});
  copy(slide, body, left + 2.29, y + .06, column - 2.5, .60, 17, palette.ink);
}
function smallColumns(slide, entries, y, {gap = .29, dark = false, bodyH = .88} = {}) {
  const cellWidth = (column - gap * (entries.length - 1)) / entries.length;
  entries.forEach(({title, body}, index) => {
    const x = left + index * (cellWidth + gap);
    line(slide, x, y, x + cellWidth, dark ? palette.greenLine : palette.line);
    copy(slide, title, x, y + .20, cellWidth, .46, 21, dark ? palette.white : palette.green, {bold: true});
    copy(slide, body, x, y + .78, cellWidth, bodyH, 16.5, dark ? palette.soft : palette.ink, {valign: 'top'});
  });
}
async function save() {
  for (const item of bounds) {
    if (item.x < 0 || item.y < 0 || item.x + item.w > width + .01 || item.y + item.h > height + .01) {
      throw new Error('Text box outside slide: ' + JSON.stringify(item));
    }
  }
  const output = process.argv[2] || path.resolve(__dirname, '../referance/starbucks/starbucks-example.pptx');
  return pptx.writeFile({fileName: output});
}

function opening({title, label: kicker, source, policy, stats, actions, context}) {
  const s = page(1, kicker, title, source, {dark: true, titleSize: 39});
  copy(s, policy, left, 1.91, column, .55, 18.5, palette.soft);
  const statW = 5.91;
  stats.forEach(({value, explanation}, i) => {
    const x = left + i * (statW + .31);
    box(s, x, 2.66, statW, 1.57, palette.paper);
    copy(s, value, x + .23, 2.77, statW - .46, .65, 44, palette.green, {bold: true});
    copy(s, explanation, x + .23, 3.53, statW - .46, .57, 16.5, palette.ink);
  });
  smallColumns(s, actions, 4.76, {dark: true, bodyH: .66});
  copy(s, context, left, 6.43, column, .31, 15.5, palette.soft);
}

function customer({title, label: kicker, source, persona, facts, theory}) {
  const s = page(2, kicker, title, source, {titleSize: 33});
  box(s, left, 1.85, 4.2, 3.89, palette.green);
  copy(s, persona.label, .85, 2.18, 3.7, .31, 15, palette.soft);
  copy(s, persona.title, .85, 2.74, 3.7, .97, 29, palette.white, {bold: true});
  line(s, .85, 4.02, 4.52, palette.greenLine);
  copy(s, persona.body, .85, 4.3, 3.68, .99, 20, palette.white);
  facts.forEach(({title, body}, i) => {
    const y = 1.9 + i * 1.25;
    copy(s, title, 5.15, y, 7.53, .34, 17.5, palette.rust, {bold: true});
    copy(s, body, 5.15, y + .39, 7.53, .57, 20, palette.ink);
    line(s, 5.15, y + 1.09, right);
  });
  emphasis(s, theory.title, theory.body, 6.03);
}

function journey({title, label: kicker, source, headings, rows, theory}) {
  const s = page(3, kicker, title, source, {titleSize: 32});
  dataTable(s, {y: 1.88, headings, rows, widths: [2.84, 4.37, 4.92], rowH: .86, size: 17.5});
  emphasis(s, theory.title, theory.body, 6.18);
}

function comparison({title, label: kicker, source, headings, rows, scale, tradeoff, sensitivity}) {
  const s = page(4, kicker, title, source, {titleSize: 32});
  copy(s, scale, left, 1.72, column, .39, 17, palette.muted);
  dataTable(s, {
    y: 2.22, headings, rows, widths: [3.47, 1.69, 1.69, 1.89, 1.69, 1.70],
    rowH: .75, size: 18, highlight: 2, align: ['left', 'center', 'center', 'center', 'center', 'center'],
  });
  copy(s, tradeoff, left, 5.16, column, .72, 17.5);
  emphasis(s, sensitivity.title, sensitivity.body, 6.08);
}

function response({title, label: kicker, source, headings, rows, operational}) {
  const s = page(5, kicker, title, source, {titleSize: 34});
  dataTable(s, {y: 1.81, headings, rows, widths: [5.46, 6.67], rowH: 1.13, size: 17.5});
  copy(s, operational, left, 5.97, column, .82, 16.5, palette.ink);
}

function blueprint({title, label: kicker, source, headings, rows, eligibility, exception}) {
  const s = page(6, kicker, title, source, {titleSize: 33});
  const widths = [1.65, 2.62, 2.62, 2.62, 2.62];
  let x = left;
  headings.forEach((text, i) => {
    box(s, x, 1.76, widths[i], .52, palette.green);
    copy(s, text, x + .09, 1.76, widths[i] - .18, .52, 15.5, palette.white, {bold: true});
    x += widths[i];
  });
  let y = 2.28;
  rows.forEach((row, index) => {
    if (typeof row === 'string') {
      copy(s, row, left + .08, y, 1.48, .25, 11.5, palette.rust, {bold: true});
      line(s, left + widths[0], y + .13, right, palette.rust, 'dash');
      y += .26;
      return;
    }
    x = left;
    row.forEach((text, i) => {
      const fill = i === 0 || index === 1 ? palette.soft : palette.white;
      box(s, x, y, widths[i], .52, fill);
      copy(s, text, x + .08, y + .01, widths[i] - .16, .50, i === 0 ? 14.5 : 15.3,
        palette.ink, {bold: i === 0});
      x += widths[i];
    });
    line(s, left, y + .52, right);
    y += .52;
  });
  copy(s, eligibility, left, 5.86, column, .36, 16);
  copy(s, exception, left, 6.4, column, .39, 16.5, palette.green, {bold: true});
}

function transition({title, label: kicker, source, customerLabel, customerCopy, timeline, scope}) {
  const s = page(7, kicker, title, source, {titleSize: 33});
  box(s, left, 1.74, column, 2.08, palette.soft);
  copy(s, customerLabel, left + .21, 1.93, column - .42, .30, 15.5, palette.rust, {bold: true});
  copy(s, customerCopy, left + .21, 2.30, column - .42, 1.30, 20, palette.green,
    {bold: true, valign: 'top'});
  smallColumns(s, timeline, 4.12, {bodyH: 1.19});
  copy(s, scope, left, 6.42, column, .34, 15.5, palette.muted);
}

function economics({title, label: kicker, source, metrics, approvals, guardrail}) {
  const s = page(8, kicker, title, source, {dark: true, titleSize: 32});
  const gap = .21;
  const w = (column - gap * 2) / 3;
  metrics.forEach(({label, value, detail}, i) => {
    const x = left + i * (w + gap);
    box(s, x, 1.76, w, 1.62, palette.paper);
    copy(s, label, x + .16, 1.90, w - .32, .28, 15.3, palette.rust, {bold: true});
    copy(s, value, x + .16, 2.23, w - .32, .49, 25.5, palette.green, {bold: true});
    copy(s, detail, x + .16, 2.76, w - .32, .49, 15.1, palette.ink);
  });
  approvals.forEach(({title, body}, i) => {
    const y = 3.62 + i * .86;
    line(s, left, y, right, palette.greenLine);
    copy(s, title, left, y + .11, 2.36, .55, 18.5, palette.paleRust, {bold: true});
    copy(s, body, left + 2.52, y + .11, column - 2.52, .59, 17.4, palette.white);
  });
  line(s, left, 6.20, right, palette.greenLine);
  copy(s, guardrail, left, 6.34, column, .59, 15.8, palette.soft, {bold: true});
}


function cover() {
  const slide = pptx.addSlide();
  slide.background = {color: palette.paper};
  box(slide, 8.36, 0, width - 8.36, height, palette.green);

  // Abstract iced latte drawn in editable PowerPoint shapes.
  const circleCenter = {x: 10.85, y: 3.76};
  [4.04, 3.54, 3.04].forEach((diameter) => {
    slide.addShape(shape.ellipse, {
      x: circleCenter.x - diameter / 2, y: circleCenter.y - diameter / 2,
      w: diameter, h: diameter,
      line: {color: palette.greenLine, width: .65},
      fill: {color: palette.green, transparency: 100},
    });
  });
  slide.addShape(shape.rect, {
    x: 11.08, y: 2.02, w: .13, h: 1.47, rotate: 16,
    fill: {color: palette.soft}, line: {transparency: 100},
  });
  slide.addShape(shape.trapezoid, {
    x: 9.96, y: 2.83, w: 1.8, h: 2.35, rotate: 180,
    fill: {color: palette.paleRust}, line: {transparency: 100},
  });
  slide.addShape(shape.ellipse, {
    x: 9.96, y: 2.70, w: 1.8, h: .30,
    fill: {color: palette.paper}, line: {transparency: 100},
  });
  [{x: 10.33, y: 3.12, rotate: 17}, {x: 10.85, y: 3.28, rotate: 347}].forEach((ice) => {
    slide.addShape(shape.roundRect, {
      ...ice, w: .42, h: .44,
      fill: {color: palette.paper, transparency: 18}, line: {transparency: 100},
    });
  });
  line(slide, 10.34, 4.52, 11.36, palette.rust);

  const textLeft = .77;
  copy(slide, '臺灣星巴克｜公關危機與定價提案', textLeft, .76, 7.08, .46, 17, palette.rust, {bold: true});
  box(slide, textLeft, 1.48, .73, .065, palette.rust);
  copy(slide, '補奶收費爭議，\n如何修復常客信任？', textLeft, 1.95, 7.12, 1.84, 45, palette.green, {bold: true});
  copy(slide, '先致歉與核實退費，\n第 31 天起原價含一份標準補奶', textLeft, 4.21, 7.08, 1.05, 24, palette.muted);
  slide.addNotes(notes[0]);
}

cover();

opening({
  label: 'Step 1 | 發現問題- 客戶為何反彈',
  title: '把一份標準補奶納入冰那堤原價',
  source: '臺灣星巴克客製介紹・QSearch 社群監測・鏡週刊刊載 11 月 6 日品牌回覆',
  policy: '2026 年 10 月 12 日起，適用飲品少冰或去冰後另補奶類或飲料，加收 15 元。',
  stats: [
    {value: '553 篇', explanation: '上路日客製收費相關貼文\n公告前平均每日 13.7 篇'},
    {value: '66.3%', explanation: '這波客製收費爭議的網友貼文\n提到加錢或變相漲價'},
  ],
  actions: [
    {title: '先致歉與退費', body: '由品牌承擔責任，核實每杯退 15 元'},
    {title: '前 30 天暫免', body: '標準冰那堤先按長期配方供應'},
    {title: '第 31 天銜接', body: '原價接續含一份標準補奶'},
  ],
  context: '11 月 6 日品牌已表示願意傾聽。下一步是讓顧客看見價格與退費措施。',
});

customer({
  label: 'Step 2 | 認識客戶- 優先照顧的客戶',
  title: '先照顧習慣少冰補奶的常客',
  source: 'Xia、Monroe、Cox（2004）價格公平・聯合新聞網顧客個案',
  persona: {
    label: '顧客輪廓（研究假設）',
    title: '習慣少冰或去冰\n並補奶的冰那堤常客',
    body: '希望熟悉點法的風味、\n份量與總價都可預期。',
  },
  facts: [
    {title: '為何反彈', body: '即使知道要多付 15 元，仍覺得原本的服務變貴。'},
    {title: '期待品牌怎麼做', body: '下次同一杯仍是原價，已付費者能直接申請退費。'},
    {title: '同時照顧其他顧客', body: '記錄其他品項申訴，留意一般顧客的等候時間。'},
  ],
  theory: {title: '價格公平', body: '顧客會用過去的相似交易衡量這次價格是否合理。'},
});

journey({
  label: 'Step 3 | 設計客戶體驗- 客戶旅程',
  title: '顧客在每一站都能看見品牌怎麼改',
  source: 'Lemon、Verhoef（2016）顧客旅程',
  headings: ['顧客旅程', '顧客遇到的問題', '建議的改善'],
  rows: [
    ['購買前\n看社群、考慮去不去', '熟悉的點法變貴，質疑是否值得', '公開道歉，說清楚暫停與退費'],
    ['購買中\n到店或行動預點', '原點法要加價，或換點法', '原價含一份標準補奶，收銀與吧台同步'],
    ['購買後\n想申請退費', '怕回原店、重複說明或再消費', '任一門市可登錄，客服接手'],
    ['下次購買\n想知道會不會再漲', '短期措施一過，規則又可能變', '第 31 天延續原價，期滿前公告'],
  ],
  theory: {title: '跨通路體驗', body: '顧客從社群到門市與客服的經驗會累積，公告要能在每一站兌現。'},
});

comparison({
  label: 'Step 4 | AI 服務創新運用- 比較三條定價路徑',
  title: '暫免後接回原價，避免再一次漲價感',
  source: '提案方案比較・Xia、Monroe、Cox（2004）價格公平',
  headings: ['方案', '修復信任\n40%', '執行速度\n25%', '財務承受度\n20%', '長期效果\n15%', '加權總分'],
  rows: [
    ['維持另收 15 元', '1', '5', '5', '2', '2.95'],
    ['暫免後恢復收費', '3', '4', '4', '1', '3.15'],
    ['暫免接續納入原價', '5', '3', '3', '5', '4.10'],
  ],
  scale: '提案評估用 1 至 5 分，5 分最符合標準。',
  tradeoff: '暫免 30 天會形成新的價格期待。期滿恢復 15 元，顧客可能再次感到被漲價。\n原價內含延續同一點法，核准前先驗證持續成本與每杯貢獻。',
  sensitivity: {title: '財務優先時', body: '財務權重升至 40%，維持收費 3.75，略高於原價內含 3.70。'},
});

response({
  label: 'Step 4 | AI 服務創新運用- 比較三條定價路徑',
  title: '道歉、暫停收費，退還已付費用',
  source: 'Coombs（2007）・Xia、Monroe、Cox（2004）・Tax、Brown、Chandrashekaran（1998）',
  headings: ['建議行動', '為何對顧客有用'],
  rows: [
    ['主管公開致歉\n承認收費影響原本習慣', '收費是品牌決定，由品牌承擔責任。\n情境危機溝通｜Coombs（2007）'],
    ['前 30 天｜標準冰那堤少冰或去冰\n原價含一份依杯型的原配方牛奶', '讓熟悉的點法回到顧客預期的價格。\n價格公平｜Xia 等人（2004）'],
    ['退還已付費用\n符合條件的交易每杯核實退 15 元，無須再消費', '讓顧客拿回已付費用，也讓申請更容易。\n服務補救｜Tax 等人（1998）'],
  ],
  operational: '適用臺灣門市及官方行動預點，第三方外送維持原規則。\n生成式 AI 協助演練與分類，公開回應與退款由人員核定。',
});

blueprint({
  label: 'Step 5 | 服務藍圖- 讓門市兌現承諾',
  title: '門市接手，客服查單，財務完成退款',
  source: 'Bitner、Ostrom、Morgan（2008）服務藍圖',
  headings: ['服務層次', '得知措施', '再次點餐', '申請退費', '收到結果'],
  rows: [
    ['顧客看得見', '官網、社群公告', '訂單、杯標', '申請回執', '退款確認'],
    ['顧客行動', '查適用品項', '選冰量與補奶', '提供可核對交易資料', '查收款項'],
    '互動線',
    ['前台', '依同一份公告回答', '收銀按原價、吧台定量', '門市登錄、客服接手', '主動通知結果'],
    '可視線',
    ['後台', '營運驗證配方與標價', '收銀傳訂單給吧台', '核對費項及退款紀錄', '財務對帳'],
    '內部互動線',
    ['支援', '品牌、產品與公關', '收銀、預點與配方', '主管權限、查單工具', '案件與財務系統'],
  ],
  eligibility: '10 月 12 日起至暫停生效前已付費者，可在措施生效後 30 天內申請。',
  exception: '主管更正誤收。客服 24 小時內首次回覆、3 個工作日內更新。財務核實後 5 個工作日內送出退款。',
});

transition({
  label: 'Step 6 | 行銷提案- 第 31 天定價與業主核准',
  title: '第 31 天起，原價含一份標準補奶',
  source: '提案定價與公告文案・Xia、Monroe、Cox（2004）價格公平',
  customerLabel: '顧客公告與門市說法',
  customerCopy: '「從［生效日］起，標準冰那堤少冰或去冰，原價就含依杯型的一份原配方牛奶。\n您可在門市或官方行動預點選擇。換植物奶或加料，按菜單計費。」',
  timeline: [
    {title: '前 30 天', body: '按長期配方供應一份。\n各杯型維持現行基礎價。'},
    {title: '第 31 天', body: '延續同一點法與價格。\n期滿前公布配方與生效日。'},
    {title: '最多延長 14 天', body: '同價同配方銜接。\n最晚第 42 天公布所採配方。\n第 45 天採主配方或備用配方，\n原價均含一份。'},
  ],
  scope: '適用臺灣門市與官方行動預點。其他品項及第三方外送依原規則。',
});

economics({
  label: 'Step 6 | 行銷提案- 第 31 天定價與業主核准',
  title: '先核准有上限的修復，再核准長期定價',
  source: '規劃試算・實際上限由財務依合格退款、用量與工時簽核',
  metrics: [
    {label: '前 30 天規劃試算', value: '24 萬元', detail: '一次性 7 萬＋當期 17 萬'},
    {label: '每 30 天持續影響', value: '17 萬元', detail: '不利情境每 30 天 21 萬'},
    {label: '長期打平所需新增交易', value: '2,125 筆／30 天', detail: '每筆新增淨貢獻 80 元'},
  ],
  approvals: [
    {title: '先核准修復', body: '試行不利情境 28 萬＋銜接 9.8 萬＝37.8 萬元上限算例。\n簽核實際上限與主、備配方，指派營運負責人。'},
    {title: '再核准長期', body: '公平認同率升 10 個百分點，前 14 天回購至少達對照期。\n每杯貢獻至少達同杯型與通路組合歷史基準的 90%。'},
    {title: '未達門檻', body: '上線前先致歉並辦核准退費。試行後按已核准的銜接與備用配方，履行顧客承諾。'},
  ],
  guardrail: '第 21 天重估，第 29 天決策。上線前另簽常態上限，備用配方須在零新增交易時守住上限。',
});

save().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
