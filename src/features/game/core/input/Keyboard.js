export default class Keyboard {
  constructor() {
    this.A = false;
    this.D = false;
    this.SPACE = false;
    this.SHIFT = false;
    this.E = false; // add

    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup", (e) => this.onKey(e, false));
  }

  onKey(e, pressed) {
    switch (e.code) {
      case "KeyA":
        this.A = pressed;
        break;

      case "KeyD":
        this.D = pressed;
        break;

      case "Space":
        e.preventDefault();
        this.SPACE = pressed;
        break;

      case "ShiftLeft":
      case "ShiftRight":
        this.SHIFT = pressed;
        break;

      case "KeyE": // add
        this.E = pressed; // add
        break; // add
    }
  }

  // Movement
  get LEFT() {
    return this.A;
  }

  get RIGHT() {
    return this.D;
  }

  get JUMP() {
    return this.SPACE;
  }

  get THROW() {
    return this.SHIFT;
  }

  get INTERACT() {
    // add
    return this.E; // add
  }
}
