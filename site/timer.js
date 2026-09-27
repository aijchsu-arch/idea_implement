const MIN = 60_000;
const DURATION = { focus: 25 * MIN, shortBreak: 5 * MIN, longBreak: 15 * MIN };

// Remaining time comes from the wall clock (endsAt - now), so throttled background tabs stay accurate.
export function createTimer() {
  let phase = "focus";
  let pausedRemainingMs = DURATION[phase];
  let endsAt = null; // set while running
  let completedFocusSessions = 0;

  const remaining = (now) => (endsAt === null ? pausedRemainingMs : Math.max(0, endsAt - now));

  function load(next) {
    phase = next;
    pausedRemainingMs = DURATION[next];
    endsAt = null;
  }

  function nextPhase() {
    if (phase !== "focus") return "focus";
    return completedFocusSessions % 4 === 0 ? "longBreak" : "shortBreak";
  }

  return {
    start(now) {
      if (endsAt === null) endsAt = now + pausedRemainingMs;
    },
    pause(now) {
      if (endsAt === null) return;
      pausedRemainingMs = remaining(now);
      endsAt = null;
    },
    reset() {
      load(phase);
    },
    skip() {
      // A skipped Focus Session isn't completed, so it only ever earns a Short Break.
      load(phase === "focus" ? "shortBreak" : "focus");
    },
    // Returns true when the running Phase just ran out and the next one was loaded.
    tick(now) {
      if (endsAt === null || remaining(now) > 0) return false;
      if (phase === "focus") completedFocusSessions++;
      load(nextPhase());
      return true;
    },
    snapshot(now) {
      return { phase, remainingMs: remaining(now), running: endsAt !== null, completedFocusSessions };
    },
  };
}
