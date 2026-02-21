/* ============================================================================
  FrameAnimation
  - Handles sprite animation timing and frame switching
  - Delta time is frame-based (1 = one frame at 60 FPS)
============================================================================ */

export default class FrameAnimation {
  constructor(imagePaths, framesPerSecond = 12) {
    this.imagePaths = imagePaths;
    this.framesPerSecond = framesPerSecond;

    this.loadedImages = imagePaths.map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.currentFrameIndex = 0;
    this.accumulatedFrameTime = 0;
  }

  reset() {
    this.currentFrameIndex = 0;
    this.accumulatedFrameTime = 0;
  }

  update(deltaTimeInFrames = 1) {
    const framesPerAnimationStep = 60 / this.framesPerSecond;

    this.accumulatedFrameTime += deltaTimeInFrames;

    while (this.accumulatedFrameTime >= framesPerAnimationStep) {
      this.accumulatedFrameTime -= framesPerAnimationStep;

      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.loadedImages.length;
    }
  }

  get currentImage() {
    return this.loadedImages[this.currentFrameIndex];
  }

  get isReady() {
    const image = this.currentImage;
    return image && image.complete && image.naturalWidth > 0;
  }
}
