# RISK.md — 變更風險分級與人工審查規則（idea_implement）

> 依 Anthropic〈How the Claude Code team does code review〉第 5 層（依風險決定人工審查）改寫。
> 這裡的「人工」只有一個人：Joseph。目的不是審完每一行，而是把 Joseph 的注意力只花在出錯代價高的地方。

## 判定規則

1. 取 diff 中**所有**被改動檔案各自的等級，以**最高**者為本次變更的等級。
2. 新增且未命中任何規則的檔案，預設為 **中風險**。
3. 不論路徑為何，只要 diff 內容命中「內容規則」（見下），直接升為 **高風險**。
4. 不確定時往高一級歸類。
5. agent 必須在回報中寫出等級與命中的規則。

## 等級與對應動作

| 等級 | 誰看 | 合併條件 |
|---|---|---|
| 低 | 0 人 | 驗證通過（`make check` 輸出已貼）+ diff-reviewer 無 BLOCKER → agent 可自行 merge 自己的 PR |
| 中 | Joseph 看摘要 | agent 開 PR 後停下，在 PR 說明貼：變更摘要、驗證輸出、diff-reviewer 結論。Joseph 回覆後才 merge |
| 高 | Joseph 逐行看 | agent 開 PR 後停下，等 Joseph 在 GitHub 逐行審閱並**明確** approve。agent 的 approve 不算數。approve 後若有新 commit，approve 失效 |

## 路徑規則

### 低風險（純文字、不影響執行結果）

```
docs/**
README.md
CONTEXT.md
.scratch/**                  # spec 與 tickets
evals/**                     # reviewer 評測案例
metrics/**                   # revert 率紀錄
```

### 中風險（應用程式碼與測試；出錯會被測試或使用時發現）

```
site/**                      # 會被部署到 GitHub Pages 的內容
test/**
scripts/**
package.json
.claude/skills/**            # 改了會改變 agent 的工作流程
```

### 高風險（無人值守執行、或改變閘門與 agent 自身規則）

```
.github/workflows/**         # push 到 main 就自動部署到 Pages
.githooks/**                 # commit 閘門
Makefile                     # 定義 make check 內容
.claude/agents/**            # reviewer subagent
CLAUDE.md
RISK.md
```

## 內容規則（命中即高風險，不看路徑）

- diff 中出現疑似憑證：`api[_-]?key`、`token`、`password`、`secret`、`BEGIN .* PRIVATE KEY`、長度 ≥ 32 的 base64／hex 字串。
- 新增對外網路呼叫（新的 host、新的 `fetch`/`curl` 目標）。
- 刪除檔案、`rm -rf`、覆寫既有設定檔、改動部署目標。

## 永遠不得自動合併（即使驗證全過）

- 任何高風險變更。
- 任何「未驗證」的變更（見 CLAUDE.md 第 1 節）。
- diff-reviewer 回報的 BLOCKER 尚未修正或關閉。

## 維護

- 每次 `git revert` 之後，檢查被 revert 的路徑是否被分得太低；是的話在此升級，並用 `scripts/add-eval-case.sh` 把該 diff 存進 reviewer 的測試案例。
- 本檔案的修改本身是高風險，需 Joseph 逐行 approve。
