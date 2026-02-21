/* ============================================================================
  FrameAnimation
  - Handles sprite animation timing and frame switching
  - Uses a 60 FPS reference for delta time (dt: 1 ≈ one frame at 60 FPS)
============================================================================ */

export default class FrameAnimation {
  constructor(paths, framesPerSecond = 12) {
    this.paths = paths;
    this.framesPerSecond = framesPerSecond;

    // Preload images
    this.images = paths.map((sourcePath) => {
      const image = new Image();
      image.src = sourcePath;
      return image;
    });

    // Animation state
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedTime = 0;
  }

  update(deltaTimeInFrames = 1) {
    const frameDuration = 60 / this.framesPerSecond;

    this.accumulatedTime += deltaTimeInFrames;

    while (this.accumulatedTime >= frameDuration) {
      this.accumulatedTime -= frameDuration;
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.images.length;
    }
  }

  get image() {
    return this.images[this.currentFrameIndex];
  }

  get ready() {
    const image = this.image;
    return image && image.complete && image.naturalWidth > 0;
  }
}
