#!/usr/bin/env bash
# 第 7 層護欄指標：過去 N 天的 commit 數、agent commit 數、revert 數、revert 率。
#
# 用法：
#   scripts/revert-rate.sh            # 最近 7 天
#   scripts/revert-rate.sh 14         # 最近 14 天
#   LOG=1 scripts/revert-rate.sh      # 同時 append 一行到 metrics/revert-rate.csv（給 Kanban / 週報用）
#
# agent commit 的辨識：commit message 內是否命中 AGENT_MARKER（regex）。
# TODO: 依你實際的 commit trailer 調整，例如 Hermes 若用 "Agent: hermes" 就加進去。
set -uo pipefail

DAYS=${1:-7}
AGENT_MARKER=${AGENT_MARKER:-'Co-Authored-By: (Claude|Codex|Hermes)|^Agent: '}
SINCE="$DAYS days ago"

total=0; agent=0; reverts=0; reverts_of_agent=0; reverts_of_human=0

is_agent() { git show -s --format=%B "$1" | grep -Eq "$AGENT_MARKER"; }

for h in $(git log --since="$SINCE" --no-merges --format=%H); do
  reverted=$(git show -s --format=%B "$h" | grep -oE 'reverts commit [0-9a-f]{7,40}' | awk '{print $3}' | head -n1)
  if [ -n "$reverted" ]; then
    # revert commit 本身不計入「總數」，只計入 revert 數
    reverts=$((reverts+1))
    if git cat-file -e "$reverted^{commit}" 2>/dev/null && is_agent "$reverted"; then
      reverts_of_agent=$((reverts_of_agent+1))
    else
      reverts_of_human=$((reverts_of_human+1))
    fi
    continue
  fi

  total=$((total+1))
  is_agent "$h" && agent=$((agent+1))
done

human=$((total-agent))
pct() { [ "$2" -eq 0 ] && echo "n/a" || awk -v a="$1" -v b="$2" 'BEGIN{printf "%.1f%%", a*100/b}'; }

echo "期間：最近 $DAYS 天（$(git log --since="$SINCE" --no-merges --format=%cs | tail -n1 2>/dev/null || echo -) ~ $(date +%F)）"
echo "commit 總數：$total（agent $agent / 人 $human）"
echo "revert 數：$reverts（被 revert 的是 agent commit：$reverts_of_agent，人：$reverts_of_human）"
echo "整體 revert 率：$(pct "$reverts" "$total")"
echo "agent revert 率：$(pct "$reverts_of_agent" "$agent")"

if [ "${LOG:-0}" = "1" ]; then
  mkdir -p metrics
  f=metrics/revert-rate.csv
  [ -f "$f" ] || echo "date,days,total,agent,human,reverts,reverts_of_agent,reverts_of_human" > "$f"
  echo "$(date +%F),$DAYS,$total,$agent,$human,$reverts,$reverts_of_agent,$reverts_of_human" >> "$f"
  echo "已記錄到 $f"
fi
