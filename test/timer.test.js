import { test } from "node:test";
import assert from "node:assert/strict";
import { createTimer } from "../site/timer.js";

const MIN = 60_000;

test("a new timer is a paused 25-minute Focus Session", () => {
  const timer = createTimer();
  assert.deepEqual(timer.snapshot(0), {
    phase: "focus",
    remainingMs: 25 * MIN,
    running: false,
    completedFocusSessions: 0,
  });
});

test("start counts down from wall-clock time", () => {
  const timer = createTimer();
  timer.start(1_000);
  const s = timer.snapshot(1_000 + 90_000);
  assert.equal(s.running, true);
  assert.equal(s.remainingMs, 25 * MIN - 90_000);
});

test("pause holds the remaining time and start resumes from it", () => {
  const timer = createTimer();
  timer.start(0);
  timer.pause(10 * MIN);
  assert.deepEqual(
    [timer.snapshot(20 * MIN).remainingMs, timer.snapshot(20 * MIN).running],
    [15 * MIN, false],
  );
  timer.start(30 * MIN);
  assert.equal(timer.snapshot(31 * MIN).remainingMs, 14 * MIN);
});
