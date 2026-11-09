# MARS · 行銷分析與研究 Skill

以公開資料、行銷理論與可驗證的商業假設，完成六步提案。適用於跨產業的品牌定位、服務創新、定價、危機回應與成長規劃。

## 開始使用

### 安裝到 Codex

在 Codex 對話中貼上這一行：

```text
$skill-installer 請從 https://github.com/shoung/MARS-marketing-analysis-research-skill/tree/main/marketing-service-innovation 安裝這個 Skill。
```

也可以在已安裝 Codex CLI 的終端機執行：

```sh
codex '$skill-installer 請從 https://github.com/shoung/MARS-marketing-analysis-research-skill/tree/main/marketing-service-innovation 安裝這個 Skill。'
```

安裝完成後開啟新的 Codex 對話。如果技能清單還沒顯示它，重新啟動 Codex。詳見 [Codex Skill 官方文件](https://learn.chatgpt.com/docs/build-skills#install-curated-skills-for-local-use)。

### 呼叫範例

在 Codex 對話中貼上：

```text
$marketing-service-innovation 請以臺灣 World Gym 為例，提出提升既有會員續約意願的行銷方案。假設先在臺北兩間門市試行 8 週，預算上限新臺幣 30 萬元。依六步流程使用可追溯的公開資料，區分已知事實和待驗證假設，並說明續約率、增量貢獻與擴大試行的門檻。請以繁體中文交付簡報、完整報告與三分鐘講稿。
```

流程與交付規格見 [SKILL.md](marketing-service-innovation/SKILL.md)。

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
