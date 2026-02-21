export default class CameraFollowSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { camera, character, canvas, worldWidth } = this.world;

    const followOffset = 200;
    const targetX = character.x - followOffset;

    const maxCamX = Math.max(0, worldWidth - canvas.width);

    camera.x = Math.min(Math.max(0, targetX), maxCamX);
  }
}
