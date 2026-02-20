export default class Camera {
  constructor() {
    this.x = 0;
  }

  move(dx) {
    this.x += dx;
    if (this.x < 0) this.x = 0;
  }
}
