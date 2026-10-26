# reviewer-cases — 把 incident 變成 reviewer 的考題

對應 Anthropic 作法的第 7 點：曾經出事或被 revert 的變更，整理成評測集，之後任何對 reviewer 的改動都用同一組題目驗證。

## 流程

1. 出事 → `git revert <sha>`。
2. **立刻**執行 `scripts/add-eval-case.sh <sha> "<一句話出了什麼事>"`。
3. 打開新建的 `expected.md`，填 `MUST_CATCH:` 關鍵字（reviewer 輸出裡應該出現的概念，不分大小寫）。
4. 順手檢查 `RISK.md`：這個路徑當時是否被分得太低。

## 跑評測

```
scripts/run-reviewer-eval.sh
```

每個案例會把 reviewer 的實際輸出寫到 `actual.md`，結果附在 `metrics/reviewer-eval.csv`。

## 什麼時候跑

- 修改 `.claude/agents/diff-reviewer.md` 之前與之後。
- 換 reviewer 模型之前與之後。
- 修改 `CLAUDE.md` 審查相關規則之後。

分數下降就不採用該改動——這是唯一的規則。

## 目錄結構

```
evals/reviewer-cases/
  2026-10-24-ab12cd3/
    diff.patch     被 revert 的變更（自動產生）
    task.md        原 commit message（自動產生）
    expected.md    MUST_CATCH 關鍵字 + 事後檢討（手填）
    actual.md      最近一次 reviewer 輸出（跑評測時產生，可 gitignore）
```

案例少的時候（< 5 個）分數起伏會很大，當作 smoke test 看就好；累積到十幾個以後才有統計意義。
