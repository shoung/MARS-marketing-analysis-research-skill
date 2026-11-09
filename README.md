# MARS · 行銷分析與研究 Skill

以公開資料、行銷理論與可驗證的商業假設，完成六步提案。適用於跨產業的品牌定位、服務創新、定價、危機回應與成長規劃。

## 開始使用

將 [marketing-service-innovation](marketing-service-innovation/) 資料夾複製到本機的 Codex Skills 目錄，保留資料夾結構，再以 `$marketing-service-innovation` 搭配公司、情境與提案目標呼叫。流程與交付規格見 [SKILL.md](marketing-service-innovation/SKILL.md)。

## 案例

| 案例 | 完整報告 | 簡報 |
| --- | --- | --- |
| 臺灣星巴克 · 收費爭議與長期定價 | [HTML](marketing-service-innovation/referance/starbucks/starbucks-analysis-report.html) | [PPTX](marketing-service-innovation/referance/starbucks/starbucks-example.pptx) · [PDF](marketing-service-innovation/referance/starbucks/starbucks-example.pdf) |
| Nike · 品牌與通路復甦 | [HTML](marketing-service-innovation/referance/nike/nike-analysis-report.html) | [PPTX](marketing-service-innovation/referance/nike/nike-example.pptx) · [PDF](marketing-service-innovation/referance/nike/nike-example.pdf) |

HTML 可下載後用瀏覽器開啟。各案例資料夾另有研究來源、講稿及 AI 使用記錄。

## 重建範例

在 `marketing-service-innovation/` 下執行。HTML 需要 Python 的 `markdown-it-py` 和 `beautifulsoup4`。PPTX 需要 Node.js 與 `pptxgenjs`。

```sh
python3 scripts/build_starbucks_html.py
python3 scripts/build_nike_html.py
node scripts/build_starbucks_example.js
node scripts/build_nike_example.js
```
