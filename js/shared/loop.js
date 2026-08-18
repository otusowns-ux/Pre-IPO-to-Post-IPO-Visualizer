export function createLoop({ speed = 0.105, onFrame } = {}) {
  let progress = 0;
  let playing = true;
  let lastTime = performance.now();
  let started = false;

  function getProgress() {
    return progress;
  }

  function setProgress(value) {
    progress = value;
  }

  function isPlaying() {
    return playing;
  }

  function play() {
    playing = true;
  }

  function pause() {
    playing = false;
  }

  function toggle() {
    playing = !playing;
    return playing;
  }

  function reset() {
    progress = 0;
    playing = true;
  }

  function tick(now) {
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (playing) {
      progress += delta * speed;
      if (progress > 1) progress = 1;
    }
    if (onFrame) onFrame(progress);
    requestAnimationFrame(tick);
  }

  function start() {
    if (started) return;
    started = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }

  return {
    getProgress,
    setProgress,
    isPlaying,
    play,
    pause,
    toggle,
    reset,
    start
  };
}
