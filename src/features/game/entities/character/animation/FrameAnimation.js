export default class FrameAnimation {
  constructor(framePaths, framesPerSecond = 12) {
    this.framePaths = framePaths;
    this.framesPerSecond = framesPerSecond;

    this.images = framePaths.map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  update(deltaTime) {
    const framesPerSecondAt60Fps = 60 / this.framesPerSecond;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= framesPerSecondAt60Fps) {
      this.accumulatedTime -= framesPerSecondAt60Fps;

      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.images.length;
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
