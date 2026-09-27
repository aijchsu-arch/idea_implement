# 02: Phase rhythm with Skip and Reset

**What to build:** When a Phase runs out, the next one loads paused: a Short Break after a Completed Focus Session, a Long Break after every fourth, and a Focus Session after any break. Skip ends the current Phase early without counting it, and Reset restarts the current Phase at full length. The page shows the Completed Focus Session count.

**Blocked by:** 01

**Status:** done

- [x] Focus Session runs out → Short Break (5:00) loaded, paused; count +1
- [x] The 4th Completed Focus Session → Long Break (15:00)
- [x] Any break ends or is skipped → Focus Session (25:00)
- [x] Skip on a Focus Session loads the next break but does not increment the count
- [x] Reset restores the current Phase to full length, paused
- [x] The page shows the phase name and the "已完成專注" count
