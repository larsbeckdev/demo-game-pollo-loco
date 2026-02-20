// Draws a frame
export default class GameRenderer {
  constructor({ canvas, ctx, background, camera, world }) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.background = background;
    this.camera = camera;
    this.world = world;
  }

  render() {
    const { ctx, canvas } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.background.draw(ctx, canvas.width, canvas.height, this.camera.x);
    this.world.draw(ctx);
  }
}
