# Spec: Focus Timer web page

Status: ready-for-agent

## Problem Statement

I want to work in focused blocks with regular breaks, but I keep losing track of time, and the timer apps I've tried need installs, accounts, or permission prompts. I want to open a URL on any machine and start a Focus Session straight away.

## Solution

A single static web page, served from GitHub Pages, that runs the classic rhythm: Focus Session (25 min), Short Break (5 min), and a Long Break (15 min) after every fourth Completed Focus Session. The user starts, pauses, resets, or skips the current Phase. When a Phase ends, the page beeps, updates the tab title, and loads the next Phase paused.

## User Stories

1. As a user, I want to open one URL and see a ready-to-start 25:00 Focus Session, so that I can begin without any setup.
2. As a user, I want to press Start and watch the remaining time count down in mm:ss, so that I know how long is left.
3. As a user, I want to Pause and resume, so that I can handle an interruption without losing my place.
4. As a user, I want to Reset the current Phase, so that I can restart it at full length.
5. As a user, I want to Skip the current Phase, so that I can move on when a break isn't needed.
6. As a user, I want a skipped Focus Session not to count as completed, so that my count stays honest.
7. As a user, I want a Short Break loaded after each Completed Focus Session, so that I rest briefly.
8. As a user, I want a Long Break loaded after every fourth Completed Focus Session, so that I rest longer after sustained work.
9. As a user, I want a Focus Session loaded after any break ends or is skipped, so that the rhythm continues.
10. As a user, I want the next Phase to wait for me to press Start, so that I'm not rushed back into work.
11. As a user, I want a short beep when a Phase runs out, so that I notice even when I'm looking elsewhere.
12. As a user, I want the tab title to show the remaining time while running and announce when a Phase ends, so that I can check from another tab.
13. As a user, I want the countdown to stay correct when the tab is in the background, so that browser throttling doesn't stretch my Phases.
14. As a user, I want to see how many Focus Sessions I've completed since opening the page, so that I can see my progress.
15. As a user, I want the current Phase name shown clearly, so that I know whether I should be working or resting.
16. As a Traditional Chinese speaker, I want the UI labels in Traditional Chinese, so that the page feels natural.
17. As a user on a phone, I want the page to be usable at narrow widths, so that I can use it anywhere.
18. As the maintainer, I want every push to main to be tested and deployed to GitHub Pages automatically, so that shipping takes no manual steps.

## Implementation Decisions

- **Timer module (the deep module)**: a pure state machine with no DOM, no real clock, and no timers. Its interface:
  - create a timer, which starts as a paused Focus Session at full length with 0 Completed Focus Sessions
  - `start(now)`, `pause(now)`, `reset()`, and `skip()` commands
  - `tick(now)`, which advances to the next Phase (paused) when time has run out and reports whether a Phase just ended
  - a snapshot read of the current Phase, the remaining milliseconds, whether it is running, and the Completed Focus Session count
- Remaining time is derived from a stored end time (`endsAt − now`) while running and a stored remaining duration while paused, never from counting ticks (grill Q7).
- Phase order: after a Completed Focus Session, if the count is a multiple of 4, load a Long Break, otherwise a Short Break. After any break, load a Focus Session. Skip applies the same order but never increments the count.
- **UI adapter**: a thin module that owns the DOM, calls `tick(Date.now())` on an interval, renders the snapshot, updates `document.title`, and plays a beep through Web Audio when a Phase ends. It holds no rhythm logic.
- Durations are fixed constants (25/5/15 minutes). No settings and no persistence.
- Deployment: a GitHub Actions workflow runs the tests on every PR and push. On push to main it also publishes the static site directory to GitHub Pages (ADR-0001).

## Testing Decisions

- Good tests exercise the Timer module only through its interface, with an injected `now`, and assert on snapshots. They never inspect internal fields.
- Seam under test: the Timer module (one seam). Expected values come from the spec's rhythm (e.g. "after 4 completions → Long Break"), written as literals.
- The UI adapter gets no unit tests. It is verified by a browser smoke check (page loads, Start counts down, title updates).
- Prior art: none (greenfield). Use `node:test` + `node:assert/strict`.

## Out of Scope

- Configurable durations or rhythm
- Persistence across reloads, history, or statistics beyond the in-page count
- Accounts, sync, or a backend
- The Notifications API or permission prompts
- Auto-starting the next Phase
- i18n beyond Traditional Chinese labels

## Further Notes

Glossary: `CONTEXT.md`. Decisions: `docs/adr/0001-static-vanilla-site-on-github-pages.md`. Grill transcript: `.scratch/focus-timer/grill.md`.
