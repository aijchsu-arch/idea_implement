const MIN = 60_000;
const DURATION = { focus: 25 * MIN };

// Remaining time comes from the wall clock (endsAt - now), so throttled background tabs stay accurate.
export function createTimer() {
  let phase = "focus";
  let pausedRemainingMs = DURATION[phase];
  let endsAt = null; // set while running

  const remaining = (now) => (endsAt === null ? pausedRemainingMs : Math.max(0, endsAt - now));

  return {
    start(now) {
      if (endsAt === null) endsAt = now + pausedRemainingMs;
    },
    pause(now) {
      if (endsAt === null) return;
      pausedRemainingMs = remaining(now);
      endsAt = null;
    },
    snapshot(now) {
      return {
        phase,
        remainingMs: remaining(now),
        running: endsAt !== null,
        completedFocusSessions: 0,
      };
    },
  };
}
