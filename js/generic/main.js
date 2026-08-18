import { createDraw } from "../shared/canvas.js";
import { createLoop } from "../shared/loop.js";
import { bindControls, bindPlayReset, resizeCanvas, mapControls, mapOutputs } from "../shared/dom.js";
import { metricsFor } from "./model.js";
import { createGenericDraw } from "./draw.js";

const canvas = document.querySelector("#stage");
const ctx = canvas.getContext("2d");
const drawApi = createDraw(ctx, {
  fontFamily: "Inter, system-ui, sans-serif",
  ink: "#17212b"
});
const scene = createGenericDraw(drawApi);

const controls = mapControls({
  rounds: "#rounds",
  capital: "#capital",
  selloff: "#selloff",
  demand: "#demand",
  float: "#float",
  lockup: "#lockup"
});

const output = mapOutputs({
  rounds: "#rounds-out",
  capital: "#capital-out",
  selloff: "#selloff-out",
  demand: "#demand-out",
  float: "#float-out",
  lockup: "#lockup-out",
  value: "#value",
  pressure: "#pressure",
  price: "#price",
  phase: "#phase",
  ownership: "#ownership",
  floatMetric: "#float-metric",
  calloutTitle: "#callout-title",
  calloutCopy: "#callout-copy"
});

function values() {
  return {
    rounds: Number(controls.rounds.value),
    capital: Number(controls.capital.value),
    selloff: Number(controls.selloff.value),
    demand: Number(controls.demand.value),
    float: Number(controls.float.value),
    lockup: Number(controls.lockup.value)
  };
}

function updateLabels(state, progress) {
  output.rounds.value = state.rounds;
  output.capital.value = `$${state.capital}M`;
  output.selloff.value = `${state.selloff}%`;
  output.demand.value = `${state.demand}%`;
  output.float.value = `${state.float}%`;
  output.lockup.value = `${state.lockup} days`;

  const metrics = metricsFor(state, progress);
  output.value.textContent = `$${metrics.cashRaised}M`;
  output.pressure.textContent = `$${metrics.exitCash}M`;
  output.price.textContent = `$${metrics.price.toFixed(2)}`;
  output.phase.textContent = metrics.phase.label;
  output.ownership.textContent = `${Math.round(metrics.ownership.founders * 100)}%`;
  output.floatMetric.textContent = `${state.float}%`;
  output.calloutTitle.textContent = metrics.phase.title;
  output.calloutCopy.textContent = metrics.phase.copy;
}

function frame(progress) {
  const rect = canvas.getBoundingClientRect();
  const state = values();
  scene.render(state, progress, rect.width, rect.height);
  updateLabels(state, progress);
}

const loop = createLoop({
  speed: 0.105,
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
