function aabb(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export default class CollectableCollisionSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const world = this.world;
    const p = world.character;

    const playerBox = { x: p.x, y: p.y, w: p.w, h: p.h };

    for (const c of world.collectables) {
      if (c.collected) continue;
      if (aabb(playerBox, c.bounds)) c.onCollect(world);
    }

    world.collectables = world.collectables.filter((c) => !c.collected);
  }
}
