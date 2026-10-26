# 驗證與審查規則（貼進現有 CLAUDE.md，建議放在最前面）

> 來源：依 Anthropic〈How the Claude Code team does code review〉第 1 層（PR 前事前驗證）改寫為一人 + agent 環境。

## 1. 完成的定義：給證據，不給宣告

- 任何任務在回報「完成」之前，必須**實際執行**可驗證的檢查，並**貼出實際輸出**（至少最後 10–20 行，含 pass/fail 統計或 exit code）。
  - 程式碼變更：執行測試與 build（本 repo 的指令：`<make check / npm test / pytest ...>`）。
  - UI 或輸出格式變更：附上截圖或實際輸出樣本，與變更前比對。
  - 設定或排程變更：執行 dry-run 或列出實際生效的設定值。
- 禁止的回報方式：「已完成」「應該可以運作」「理論上沒問題」「已修正」而沒有附上執行結果。
- 若無法執行檢查（環境缺套件、需要權限、需要外部服務），**明確寫出「未驗證」與原因**，不得推測結果。未驗證的變更一律不得 commit 到 `main`。

## 2. Commit 前：fresh-context 審查

- 每次 commit 前，先 `git add`，然後呼叫 `diff-reviewer` subagent（定義在 `.claude/agents/diff-reviewer.md`）審查 `git diff --cached`。
- 與本 repo 既有 `/code-review` skill 的分工：`diff-reviewer` 以 **commit** 為單位，審會不會出錯、有沒有洩漏；`/code-review` 以 **branch / PR** 為單位，審是否符合 spec 與 coding standards。兩者都要跑：每次 commit 前跑 `diff-reviewer`，開 PR 前跑 `/code-review`。
- 只給 subagent 三樣東西：diff、原始任務說明、RISK.md。**不要**把你自己的推理過程、對話歷史或「我已經檢查過 X」的說法傳給它。
- subagent 回傳的每一條 finding 只能有兩種處置：
  1. 修正，然後重新執行第 1 節的驗證；
  2. 不修，但在 commit message 或 PR 說明中寫明理由（一句話即可）。
- 不得忽略 finding、不得只回「已知」。

## 3. 審查迴圈上限

- 同一個變更最多 **3 輪** 審查—修正。第 3 輪後仍有 blocker，停下來回報 Joseph，不要繼續修。
- 第 2 輪以後只審**新增的 diff**（相對於上一輪），不重審已看過的部分。
- 已在前一輪關閉（修正或寫理由）的 finding，不得重複提出。

## 4. Commit 粒度

- 一個任務一個 commit；commit 必須能用單一 `git revert <sha>` 乾淨回復。
- 不把無關的清理、重構、lint 修正混進同一個 commit。
- commit message 第一行說明「做了什麼」，第二段列出執行過的驗證（指令 + 結果摘要）與 fresh-context 審查的結論。
- **禁止使用 `git commit --no-verify`**。pre-commit hook 擋下時，不得繞過、不得改寫被擋的內容以躲過掃描；停下並回報 Joseph 被擋的原因，由 Joseph 決定是否手動略過。

## 5. 風險分級與是否可以自動合併

- commit 前依 `RISK.md` 判定本次變更的風險等級，並在回報中寫出等級與判定依據（命中了哪個路徑）。
- **低風險**：驗證通過且審查無 blocker → 可直接合併到 `main`。
- **中風險**：停下，貼出變更摘要、驗證輸出、審查結論，等 Joseph 回覆後才合併。
- **高風險**：停下，等 Joseph 逐行審閱並**明確**說 approve 才合併。agent（包含你自己與任何 reviewer agent）的 approve 不算數。approve 之後若有任何新 commit，approve 失效，需重新取得。
- 判定不確定時，往高一級歸類。


# idea_implement

## Workflow

Idea to launch: `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`.
Skills live in `.claude/skills/` (from mattpocock/skills, MIT).

## Agent skills

### Issue tracker

Specs and tickets are local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
