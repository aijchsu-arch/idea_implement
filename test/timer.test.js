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

// Runs the current Phase to the end and returns what tick reported.
function runOut(timer, from) {
  timer.start(from);
  const end = from + timer.snapshot(from).remainingMs;
  return { ended: timer.tick(end), at: end };
}

test("a Focus Session that runs out loads a paused Short Break and counts as completed", () => {
  const timer = createTimer();
  const { ended, at } = runOut(timer, 0);
  assert.equal(ended, true);
  assert.deepEqual(timer.snapshot(at + MIN), {
    phase: "shortBreak",
    remainingMs: 5 * MIN,
    running: false,
    completedFocusSessions: 1,
  });
});

test("tick before the end changes nothing", () => {
  const timer = createTimer();
  timer.start(0);
  assert.equal(timer.tick(24 * MIN), false);
  assert.equal(timer.snapshot(24 * MIN).phase, "focus");
});

test("the fourth Completed Focus Session loads a Long Break, then a Focus Session", () => {
  const timer = createTimer();
  const phases = [];
  let t = 0;
  for (let i = 0; i < 8; i++) {
    t = runOut(timer, t).at;
    phases.push(timer.snapshot(t).phase);
  }
  assert.deepEqual(phases, [
    "shortBreak", "focus", "shortBreak", "focus",
    "shortBreak", "focus", "longBreak", "focus",
  ]);
  assert.equal(timer.snapshot(t).completedFocusSessions, 4);
  assert.equal(timer.snapshot(t).remainingMs, 25 * MIN);
});

test("skip loads the next Phase without counting the Focus Session", () => {
  const timer = createTimer();
  timer.start(0);
  timer.skip();
  assert.deepEqual(timer.snapshot(MIN), {
    phase: "shortBreak",
    remainingMs: 5 * MIN,
    running: false,
    completedFocusSessions: 0,
  });
  timer.skip();
  assert.equal(timer.snapshot(MIN).phase, "focus");
});

test("reset restores the current Phase to full length, paused", () => {
  const timer = createTimer();
  timer.skip();
  timer.start(0);
  timer.reset();
  assert.deepEqual(timer.snapshot(3 * MIN), {
    phase: "shortBreak",
    remainingMs: 5 * MIN,
    running: false,
    completedFocusSessions: 0,
  });
});

test("skipping the Focus Session after a Long Break loads a Short Break, not another Long Break", () => {
  const timer = createTimer();
  let t = 0;
  for (let i = 0; i < 8; i++) t = runOut(timer, t).at; // 4 completions, Long Break done
  timer.skip();
  assert.equal(timer.snapshot(t).phase, "shortBreak");
  assert.equal(timer.snapshot(t).completedFocusSessions, 4);
});
