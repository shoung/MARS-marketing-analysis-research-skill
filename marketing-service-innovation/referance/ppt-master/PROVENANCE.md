# PPT Master 來源與適配範圍

上游：[hugohe3/ppt-master](https://github.com/hugohe3/ppt-master)，正式 Skill 名稱 `ppt-master`（PPT Master）。
查閱日期：2026-11-09（Asia/Taipei）。
固定版本：6.9.0；commit `ce92fb43e4ade9c701f4c869e286f13fce743c72`，2026-11-08。
授權：MIT；Copyright (c) 2025-2026 Hugo He。完整授權保留於 LICENSE.txt。

## 本地留存的原文

以下均按固定 commit 讀取；原文未作為此 Skill 的自動可執行指令載入。
- SKILL.source.md ← skills/ppt-master/SKILL.md
- consulting-decision.source.md ← skills/ppt-master/templates/styles/consulting-decision/templates/design_spec.md
- visual-review.source.md ← skills/ppt-master/references/visual-review.md

固定來源連結：
- https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/skills/ppt-master/SKILL.md
- https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/skills/ppt-master/templates/styles/consulting-decision/templates/design_spec.md
- https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/skills/ppt-master/references/visual-review.md
- https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/LICENSE

## 另已查閱的流程（適配摘要）

原流程：
https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/skills/ppt-master/workflows/profiles/beautify-pptx.md

上游 Beautify 以既有簡報為輸入，保留每頁文字、數值、頁數與順序，先盤點再美化，輸出後讀回驗證。此 Skill 的首次提案是新建簡報，不冒稱執行 Beautify profile；後續僅美化時採其內容凍結與讀回對照原則。若要重寫內容，回到文字評審，不能以美化名義改變結論。

原流程：
https://github.com/hugohe3/ppt-master/blob/ce92fb43e4ade9c701f4c869e286f13fce743c72/skills/ppt-master/workflows/stages/visual-review.md

上游先靜態檢查再渲染，分配子代理檢查PNG，彙總逐頁發現並修復；原生流程使用SVG及專屬工具。本 Skill 適配為原生PPTX結構檢查 → LibreOffice/PowerPoint渲染 → 子代理逐頁檢查 → 修正 → 重渲染，保留品質責任分工，沒有執行上游SVG checker或attribution guard，故不宣稱通過上游完整工具鏈。

此資料夾只有來源文件與授權，不含上游可執行程式，也不是完整可安裝的 ppt-master Skill。

