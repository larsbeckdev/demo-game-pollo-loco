export default class Keyboard {
  constructor() {
    this.A = false;
    this.D = false;
    this.SPACE = false;
    this.ENTER = false;
    this.E = false;

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

      // ✅ ENTER statt SHIFT
      case "Enter":
        this.ENTER = pressed;
        break;

      case "KeyE":
        this.E = pressed;
        break;
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

  // ✅ THROW via Enter ODER Mouse
  get THROW() {
    return this.ENTER || this.MOUSE;
  }

  get INTERACT() {
    return this.E;
  }
}
