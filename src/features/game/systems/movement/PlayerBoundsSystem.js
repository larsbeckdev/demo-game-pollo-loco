export default class PlayerBoundsSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const { character, worldWidth } = this.world;

    // Left clamp
    if (character.x < 0) character.x = 0;

    // Right clamp
    const maxX = worldWidth - character.w;
    if (character.x > maxX) character.x = maxX;
  }
}
