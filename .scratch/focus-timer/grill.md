# Grill log: focus timer (dry run)

Idea: "A Pomodoro-style focus timer web page I can open anywhere."

Dry run: the user chose to accept every recommended answer (➡️) without edits.

## Round 1

❓ **Q1** - **Core loop**: Classic cycle (25 min focus, 5 min short break, 15 min long break after every 4th focus), or something custom?

➡️ Classic cycle, fixed durations.

---

❓ **Q2** - **Where it runs**: Static page with no backend and no accounts, or something with sync or login?

➡️ Static page, no backend, no accounts.

---

❓ **Q3** - **Tech stack**: Vanilla HTML/CSS/JS ES modules with no build step and `node:test` for tests, or a framework + bundler?

➡️ Vanilla, no build step, `node:test`. (Recorded as ADR-0001 together with the deploy target.)

---

❓ **Q4** - **Deploy target**: GitHub Pages via GitHub Actions, or another host (Netlify, Vercel, Cloudflare)?

➡️ GitHub Pages via Actions: the repo already lives on GitHub, so nothing new is needed.

## Round 2 (unblocked by Q1, Q2)

❓ **Q5** - **Phase end**: When a phase ends, should the next one start automatically or wait for the user?

➡️ Wait. The next phase is loaded and shown, and the user presses Start.

---

❓ **Q6** - **Controls**: Which controls ship in v1?

➡️ Start, Pause, Reset (restart the current phase), and Skip (end the current phase now, without counting a skipped focus as completed).

---

❓ **Q7** - **Background tabs**: Browsers throttle timers in background tabs. Should remaining time come from counting ticks or from wall-clock time?

➡️ Wall-clock time: remaining = end time − now. This stays correct under throttling.

---

❓ **Q8** - **Settings and persistence**: Configurable durations? Keep state across reload?

➡️ Neither in v1 (out of scope).

## Round 3 (unblocked by Q5, Q6)

❓ **Q9** - **Phase-end signal**: How does the user find out a phase ended?

➡️ A short beep (Web Audio) and a change to the tab title. No Notifications API permission prompt in v1.

---

❓ **Q10** - **Progress display**: What progress should be shown?

➡️ The current phase name, the remaining mm:ss (also in the tab title while running), and the number of focus sessions completed since the page was loaded.

---

❓ **Q11** - **UI language**: Which language for the UI?

➡️ Traditional Chinese labels; code and domain terms in English.

## Round 4

Frontier empty. Shared understanding confirmed (dry run).
