#!/usr/bin/env bash
# 第 7 層：用歷史 incident 案例檢驗 diff-reviewer。
# 改 reviewer prompt、換模型、調 CLAUDE.md 之前先跑一次、之後再跑一次；分數掉就不採用。
#
# 用法：
#   scripts/run-reviewer-eval.sh                   # 跑所有案例
#   scripts/run-reviewer-eval.sh 2026-10-24-ab12cd3 # 只跑一個
#
# 預設用 Claude Code headless（claude -p）當 reviewer。
# 要改用 Hermes / Codex：設定 REVIEW_CMD，它會收到 $PROMPT 環境變數（完整提示）與 stdin（diff），
# 把審查結果印到 stdout 即可。例如：REVIEW_CMD='codex exec "$PROMPT"'
set -uo pipefail

PROMPT_FILE=".claude/agents/diff-reviewer.md"
body=$(sed '1,/^---$/d' "$PROMPT_FILE")   # 去掉 YAML frontmatter，只留提示本文

if [ -n "${1:-}" ]; then
  cases="evals/reviewer-cases/$1"
else
  cases=$(ls -d evals/reviewer-cases/*/ 2>/dev/null)
fi
[ -z "$cases" ] && { echo "沒有案例。先用 scripts/add-eval-case.sh 建立。"; exit 1; }

pass=0; total=0
for c in $cases; do
  c=${c%/}
  [ -f "$c/diff.patch" ] || continue
  total=$((total+1))

  PROMPT="$body

原始任務說明：
$(cat "$c/task.md")

以下 stdin 是 staged diff，請依上述格式審查。"
  export PROMPT

  if [ -n "${REVIEW_CMD:-}" ]; then
    eval "$REVIEW_CMD" < "$c/diff.patch" > "$c/actual.md" 2> "$c/actual.err"
  else
    claude -p "$PROMPT" --allowedTools Read,Grep,Glob < "$c/diff.patch" > "$c/actual.md" 2> "$c/actual.err"
  fi

  missed=()
  while IFS= read -r line; do
    kw=$(echo "${line#MUST_CATCH:}" | xargs)
    { [ -z "$kw" ] || [ "$kw" = "<TODO>" ]; } && continue
    grep -qi -- "$kw" "$c/actual.md" || missed+=("$kw")
  done < <(grep '^MUST_CATCH:' "$c/expected.md")

  if [ ${#missed[@]} -eq 0 ]; then
    pass=$((pass+1)); echo "PASS  $c"
  else
    echo "FAIL  $c  未抓到：${missed[*]}"
  fi
done

echo "----"
echo "通過 $pass / $total"
mkdir -p metrics
echo "$(date +%FT%H:%M),$pass,$total" >> metrics/reviewer-eval.csv
