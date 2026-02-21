/**
 * Simple asset preloader for images (extendable for audio later)
 */
export default class Preloader {
  constructor(manifest = []) {
    this.manifest = manifest;      // Array of asset URLs
    this.assets = new Map();       // Loaded assets
    this.loaded = 0;
    this.total = manifest.length;
  }

  /**
   * Load all assets sequentially (stable progress tracking)
   * @param {(progress:number, url:string)=>void} onProgress
   */
  async load(onProgress = () => {}) {
    for (const url of this.manifest) {
      const asset = await this.loadImage(url);
      this.assets.set(url, asset);

      this.loaded++;
      onProgress(this.loaded / this.total, url);
    }

    return {
      images: this.assets,
    };
  }

  /**
   * Load single image
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    });
  }
}