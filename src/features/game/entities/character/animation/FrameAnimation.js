export default class FrameAnimation {
  constructor(framePaths, framesPerSecond = 12, options = {}) {
    this.framePaths = framePaths;
    this.framesPerSecond = framesPerSecond;

    this.shouldLoop = options.shouldLoop ?? true;
    this.shouldHoldLastFrame = options.shouldHoldLastFrame ?? false;

    this.images = framePaths.map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
    this.isFinished = false;
  }

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
    this.isFinished = false;
  }

  update(deltaTime) {
    if (this.isFinished) return;

    const frameDurationInDeltaUnits = 60 / this.framesPerSecond;
    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= frameDurationInDeltaUnits) {
      this.accumulatedTime -= frameDurationInDeltaUnits;

      const lastFrameIndex = this.images.length - 1;

      if (this.currentFrameIndex >= lastFrameIndex) {
        if (this.shouldLoop) {
          this.currentFrameIndex = 0;
        } else if (this.shouldHoldLastFrame) {
          this.currentFrameIndex = lastFrameIndex;
          this.isFinished = true;
        } else {
          this.currentFrameIndex = lastFrameIndex;
          this.isFinished = true;
        }
      } else {
        this.currentFrameIndex += 1;
      }
    }
  }

  getCurrentImage() {
    return this.images[this.currentFrameIndex];
  }

  isReady() {
    const image = this.getCurrentImage();
    return image && image.complete && image.naturalWidth > 0;
  }
}
