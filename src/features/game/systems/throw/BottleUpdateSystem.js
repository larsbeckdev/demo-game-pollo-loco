export default class BottleUpdateSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const w = this.world;

    for (const bottle of w.bottles) {
      bottle.update(dt);
    }

    // Cleanup dead bottles
    w.bottles = w.bottles.filter((b) => b.alive);
  }
}
