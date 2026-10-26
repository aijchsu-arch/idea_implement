#!/usr/bin/env bash
# 第 7 層：Incident → Evaluation Dataset。
# 每次 revert 之後立刻執行，把「被 revert 的那個 commit」存成 reviewer 的測試案例。
# 不在 revert 當下存，之後就會忘記當初為什麼出事。
#
# 用法：
#   scripts/add-eval-case.sh <被 revert 的 commit sha> "<一句話：出了什麼事>"
set -euo pipefail

sha=${1:?用法: add-eval-case.sh <sha> \"<出了什麼事>\"}
why=${2:-"(TODO 填寫)"}
short=$(git rev-parse --short "$sha")
dir="evals/reviewer-cases/$(date +%F)-$short"
mkdir -p "$dir"

git show "$sha" --format= --patch > "$dir/diff.patch"
git show -s --format=%B "$sha" > "$dir/task.md"

cat > "$dir/expected.md" <<EOF
# 案例 $short

## 發生了什麼
$why

## reviewer 應該抓到什麼
<!-- 每行一個 MUST_CATCH: 關鍵字。run-reviewer-eval.sh 會在 reviewer 輸出中以不分大小寫的方式 grep 這些關鍵字，全部命中才算 PASS。 -->
<!-- 關鍵字選「問題的本質」，不要選檔名或變數名：例如 MUST_CATCH: null、MUST_CATCH: timeout、MUST_CATCH: credential -->
MUST_CATCH: <TODO>

## 當時的風險等級判定是否正確
<!-- 若分太低，回 RISK.md 升級該路徑 -->
<TODO>
EOF

echo "已建立 $dir/"
echo "  diff.patch    被 revert 的變更"
echo "  task.md       原 commit message"
echo "  expected.md   ← 請現在就填 MUST_CATCH 關鍵字"
