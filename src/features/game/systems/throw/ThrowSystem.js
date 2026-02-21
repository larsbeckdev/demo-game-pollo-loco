import ThrowInputSystem from "./ThrowInputSystem.js";
import BottleSpawnSystem from "./BottleSpawnSystem.js";
import BottleUpdateSystem from "./BottleUpdateSystem.js";

export default class ThrowSystem {
  constructor(world) {
    this.world = world;

    this.input = new ThrowInputSystem(world);
    this.spawn = new BottleSpawnSystem(world);
    this.bottleUpdate = new BottleUpdateSystem(world);
  }

  update(dt) {
    // 1) Detect "just pressed" → spawn bottle
    if (this.input.justPressed()) {
      this.spawn.spawn();
    }

    // 2) Update + cleanup bottles
    this.bottleUpdate.update(dt);
  }
}
