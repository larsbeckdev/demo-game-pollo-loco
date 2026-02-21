export default class EnemyUpdateSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    for (const enemy of this.world.enemies) {
      enemy.update(dt);
    }
  }
}