export default class ThrowInput {
  constructor() {
    this.wasDown = false;
  }

  justPressed(keyboard) {
    const down = !!keyboard.THROW;
    const pressed = down && !this.wasDown;
    this.wasDown = down;
    return pressed;
  }
}
