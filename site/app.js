import { createTimer } from "./timer.js";

const PHASE_LABEL = { focus: "專注", shortBreak: "短休息", longBreak: "長休息" };
const timer = createTimer();
const $ = (id) => document.getElementById(id);

const format = (ms) => {
  const totalSec = Math.ceil(ms / 1000);
  return `${String(Math.floor(totalSec / 60)).padStart(2, "0")}:${String(totalSec % 60).padStart(2, "0")}`;
};

function render() {
  const s = timer.snapshot(Date.now());
  $("phase").textContent = PHASE_LABEL[s.phase];
  $("time").textContent = format(s.remainingMs);
  $("count").textContent = `已完成專注：${s.completedFocusSessions}`;
  document.title = s.running ? `${format(s.remainingMs)} ${PHASE_LABEL[s.phase]}` : "專注計時器";
}

$("start").addEventListener("click", () => { timer.start(Date.now()); render(); });
$("pause").addEventListener("click", () => { timer.pause(Date.now()); render(); });
$("reset").addEventListener("click", () => { timer.reset(); render(); });
$("skip").addEventListener("click", () => { timer.skip(); render(); });
setInterval(() => { timer.tick(Date.now()); render(); }, 250);
render();
