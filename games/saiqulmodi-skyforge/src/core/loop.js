export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTime = performance.now();
    this.fpsAccumulator = 0;
    this.frameCount = 0;
    this.fps = 60;
    this.running = false;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    const frame = (time) => {
      if (!this.running) return;
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.fpsAccumulator += dt;
      this.frameCount++;
      if (this.fpsAccumulator >= 0.5) {
        this.fps = Math.round((this.frameCount / this.fpsAccumulator));
        this.frameCount = 0;
        this.fpsAccumulator = 0;
      }

      this.updateFn(dt);
      this.renderFn();

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
  }
}
