# REVIEW-WORKFLOW.md — 本 repo 的七層審查流程（一頁版）

依 Anthropic〈How the Claude Code team does code review〉改寫為「一個人 + Hermes / Claude Code / Codex」環境。
原則：不是每個變更都靠人逐行看，而是**多層自動驗證 + 依風險決定 Joseph 要不要看**，並用 revert 率檢驗流程改動是否真的有效。

## 各層對應到哪個檔案

| 層 | 做什麼 | 檔案 / 機制 |
|---|---|---|
| 1 事前驗證 | 給證據不給宣告；fresh-context 審查 diff | `CLAUDE.md` 驗證規則、`.claude/agents/diff-reviewer.md` |
| 2 AI Review 降噪 | 第二位 agent 驗證 findings，丟掉 false positive 與風格意見；輪數上限 3 | `.claude/agents/finding-verifier.md`、`CLAUDE.md` 第 3 節 |
| 3 Security | 憑證與 PHI 掃描，命中即不得 commit | `.githooks/pre-commit`（gitleaks + 身分證／病歷號 regex） |
| 4 CI Gate | lint + type check + tests 一個指令 | `Makefile` 的 `check`、`.githooks/pre-commit` |
| 5 風險分級 | 低：agent 自動合併；中：Joseph 看摘要；高：Joseph 逐行 approve | `RISK.md` |
| 6 合併與發布 | 合併前 rebase、新行為先 shadow 一週、env-var flag | 本檔「第 6 層規則」 |
| 7 偵測與回滾 | 一任務一 commit 可 revert；revert 率週報；incident → eval | `scripts/revert-rate.sh`、`scripts/add-eval-case.sh`、`scripts/run-reviewer-eval.sh` |

## 一次任務的實際順序

1. agent 實作 → 執行 `make check`，貼出輸出（第 1 層）。
2. `git add` → 呼叫 `diff-reviewer`（第 1 層）。
3. 若有 finding 且風險為中／高 → 呼叫 `finding-verifier`（第 2 層）；只處理「保留」區塊：修正或寫理由關閉。最多 3 輪。
4. 依 `RISK.md` 判定等級並寫進回報（第 5 層）。
5. `git commit` → pre-commit hook 自動跑 `make check` + 憑證 + PHI 掃描（第 3、4 層）。
6. 合併前 `git rebase main` 並重跑 `make check`（第 6 層）。
7. 低風險 → 合併；中風險 → 貼摘要等 Joseph 回覆；高風險 → 等 Joseph 逐行 approve。
8. 出事 → `git revert` → `scripts/add-eval-case.sh <sha> "<原因>"` → 填 `expected.md`（第 7 層）。

## 第 6 層規則（純流程，無檔案）

- 合併到 `main` 之前一律 `git rebase main` 再重跑 `make check`；rebase 後有衝突或 check 失敗，視為新變更，重新走第 1 層。
- 任何改變 agent **無人值守行為**的變更（排程、自動合併規則、通知邏輯、cost cap），先以 dry-run / shadow 模式跑至少一週：只記錄「本來會做什麼」，不實際執行；對照一週的紀錄沒有意外才切 live。
- Feature flag 用環境變數即可（例如 `AUTO_MERGE_LOW_RISK=0/1`），不另建系統。切 live 時只改 flag，不改程式碼，出事時改回 flag 就是回滾。

## 第 7 層：護欄指標

- 每週一執行 `LOG=1 scripts/revert-rate.sh 7`，把結果貼到 Kanban。
- 看兩個數字：**agent revert 率**（agent 寫的 commit 被 revert 的比例）與 **revert 總數**。
- 任何流程改動（加 Codex 批評、改 reviewer prompt、換模型、調整 RISK.md）都以「改動前後四週的 agent revert 率」判斷有沒有效，沒有變好就撤回。
- 每次 revert 都要有對應的 `evals/reviewer-cases/` 案例；累積到十幾個後，`run-reviewer-eval.sh` 的分數才有統計意義。

## 安裝清單（每個 repo 一次）

```
chmod +x .githooks/pre-commit scripts/*.sh
git config core.hooksPath .githooks
brew install gitleaks                     # 沒有的話 hook 會退回簡易 grep 並警告
```

然後填佔位符：

- `Makefile`：三個 TODO 換成實際 lint / typecheck / test 指令。
- `RISK.md`：所有 `<...>` 路徑與 `# TODO`。
- `.githooks/pre-commit`：病歷號 regex。
- `scripts/revert-rate.sh`：`AGENT_MARKER` 對齊你實際的 commit trailer。
- `CLAUDE.md`：第 1 節的檢查指令；另加一行「禁止使用 `git commit --no-verify`」。

## 刻意不做的

- 不做 ML 風險分類器——path glob 夠用，出錯就改 RISK.md。
- 不做 merge queue——一個人沒有 PR 互相衝突的問題。
- 不做獨立的 feature flag 服務——環境變數即可。
- 不要求每個 commit 都跑 finding-verifier——低風險不跑，省成本。
