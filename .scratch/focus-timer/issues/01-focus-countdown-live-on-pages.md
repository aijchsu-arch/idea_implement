# 01: Focus Session countdown, live on GitHub Pages

**What to build:** Opening the site shows a paused 25:00 Focus Session. Start counts down in mm:ss (wall-clock based, correct in background tabs), and Pause freezes it and resumes from the same point. The tab title shows the remaining time while running. The tests run in CI on every PR/push, and a push to main deploys the page to GitHub Pages.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A fresh page shows "專注" and 25:00, paused
- [ ] Start counts down; Pause holds the remaining time; Start resumes it
- [ ] Remaining time is derived from the end time, not from counting ticks (tested with an injected clock)
- [ ] The tab title shows the remaining time while running
- [ ] A CI workflow runs `npm test` on PRs and pushes; on main it deploys the site to Pages
