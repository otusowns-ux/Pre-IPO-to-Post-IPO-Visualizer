export function bindControls(controls, onInput) {
  Object.values(controls).forEach((control) => {
    if (!control) return;
    control.addEventListener("input", onInput);
  });
}

export function bindPlayReset({ playButton, resetButton, loop, onReset }) {
  if (playButton) {
    playButton.textContent = loop.isPlaying() ? "Pause" : "Play";
    playButton.addEventListener("click", () => {
      const playing = loop.toggle();
      playButton.textContent = playing ? "Pause" : "Play";
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      loop.reset();
      if (playButton) playButton.textContent = "Pause";
      if (onReset) onReset();
    });
  }
}

export function resizeCanvas(canvas, ctx, onResize) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (onResize) onResize();
}

export function mapControls(ids) {
  const controls = {};
  Object.entries(ids).forEach(([key, id]) => {
    controls[key] = document.querySelector(id);
  });
  return controls;
}

export function mapOutputs(ids) {
  const outputs = {};
  Object.entries(ids).forEach(([key, id]) => {
    outputs[key] = document.querySelector(id);
  });
  return outputs;
}
