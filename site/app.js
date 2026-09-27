import { createTimer } from "./timer.js";

const PHASE_LABEL = { focus: "專注" };
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
  document.title = s.running ? `${format(s.remainingMs)} ${PHASE_LABEL[s.phase]}` : "專注計時器";
}

$("start").addEventListener("click", () => { timer.start(Date.now()); render(); });
$("pause").addEventListener("click", () => { timer.pause(Date.now()); render(); });
setInterval(render, 250);
render();
