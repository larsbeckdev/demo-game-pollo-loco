import ThrowInput from "./ThrowInput.js";
import spawnBottle from "./spawnBottle.js";
import updateBottles from "./updateBottles.js";

export default class ThrowSystem {
  constructor(world) {
    this.world = world;
    this.input = new ThrowInput();
  }

  update(dt) {
    const w = this.world;

    // 1) detect "just pressed"
    if (this.input.justPressed(w.keyboard)) {
      spawnBottle(w);
    }

    // 2) update + cleanup bottles
    updateBottles(w, dt);
  }
}
