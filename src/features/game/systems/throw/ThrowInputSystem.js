export default class ThrowInputSystem {
  constructor(world) {
    this.world = world;
    this.wasDown = false;
  }

  justPressed() {
    const down = !!this.world.keyboard.THROW;
    const pressed = down && !this.wasDown;
    this.wasDown = down;
    return pressed;
  }
}
