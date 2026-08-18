import { createDraw } from "../shared/canvas.js";
import { createLoop } from "../shared/loop.js";
import { bindControls, bindPlayReset, resizeCanvas, mapControls, mapOutputs } from "../shared/dom.js";
import {
  postIpoDay,
  cumulativeSecondary,
  latestPressure,
  nextUnlockInfo,
  illustrativePrice,
  currentPhase,
  muskLockLabel
} from "./model.js";
import { createSpacexDraw } from "./draw.js";

const canvas = document.querySelector("#stage");
const ctx = canvas.getContext("2d");
const drawApi = createDraw(ctx, {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  ink: "#0f1720",
  strokeDefault: "rgba(15,23,32,.2)",
  rectStroke: "rgba(15,23,32,.15)"
});
const scene = createSpacexDraw(drawApi);

const controls = mapControls({
  float: "#float",
  demand: "#demand",
  muskSell: "#musk-sell"
});

const output = mapOutputs({
  float: "#float-out",
  demand: "#demand-out",
  muskSell: "#musk-sell-out",
  day: "#day-metric",
  secondary: "#secondary",
  nextUnlock: "#next-unlock",
  pressure: "#pressure",
  price: "#price",
  muskLock: "#musk-lock",
  calloutTitle: "#callout-title",
  calloutCopy: "#callout-copy"
});

function values() {
  return {
    float: Number(controls.float.value),
    demand: Number(controls.demand.value),
    muskSell: Number(controls.muskSell.value)
  };
}

function updateLabels(state, progress) {
  output.float.value = `${state.float}%`;
  output.demand.value = `${state.demand}%`;
  output.muskSell.value = `${state.muskSell}%`;

  const day = postIpoDay(progress);
  const secondary = cumulativeSecondary(day, state, progress);
  const pressure = latestPressure(day, state);
  const price = illustrativePrice(day, state, progress);
  const phase = currentPhase(progress);

  output.day.textContent = day < 0 ? "Pre-IPO" : `Day ${day}`;
  output.secondary.textContent = secondary >= 10 ? `$${secondary.toFixed(0)}B` : `$${secondary.toFixed(1)}B`;
  output.nextUnlock.textContent = nextUnlockInfo(day);
  output.pressure.textContent = `${Math.round(pressure)}%`;
  output.price.textContent = price == null ? "—" : `$${price.toFixed(0)}`;
  output.muskLock.textContent = muskLockLabel(day, state);
  output.calloutTitle.textContent = phase.title;
  output.calloutCopy.textContent = phase.copy;
}

function frame(progress) {
  const rect = canvas.getBoundingClientRect();
  const state = values();
  scene.render(state, progress, rect.width, rect.height);
  updateLabels(state, progress);
}

const loop = createLoop({
  speed: 0.085,
  onFrame: frame
});

function resize() {
  resizeCanvas(canvas, ctx, () => frame(loop.getProgress()));
}

bindControls(controls, () => frame(loop.getProgress()));
bindPlayReset({
  playButton: document.querySelector("#play"),
  resetButton: document.querySelector("#reset"),
  loop,
  onReset: () => frame(0)
});

window.addEventListener("resize", resize);
resize();
loop.start();
