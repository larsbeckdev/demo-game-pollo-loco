import { ChickenNormal } from "@/features/game/entities/enemy/Enemies.js";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class EnemySpawnSystem {
  constructor(world) {
    this.world = world;
    this.timer = 0;
    this.nextIn = 60; // default ~1s
    this._scheduleNext();
  }

  _cfg() {
    return this.world.level?.enemySpawn ?? null;
  }

  _scheduleNext() {
    const cfg = this._cfg();
    if (!cfg) {
      this.nextIn = 999999;
      return;
    }
    this.nextIn = randInt(cfg.intervalMin, cfg.intervalMax);
  }

  update(dt) {
    const cfg = this._cfg();
    if (!cfg) return;

    // Hard cap
    const aliveCount = this.world.enemies.filter((e) => e.alive).length;
    if (aliveCount >= cfg.maxAlive) return;

    const playerX = this.world.character?.x ?? 0;

    // Only spawn after startX and before endX
    if (playerX < cfg.startX) return;
    if (playerX > cfg.endX) return;

    this.timer += dt;
    if (this.timer < this.nextIn) return;

    this.timer = 0;
    this._scheduleNext();

    // Spawn ahead of player (off-screen)
    const ahead = randInt(cfg.spawnAheadMin, cfg.spawnAheadMax);
    let spawnX = playerX + ahead;

    // Clamp to endX area (optional)
    if (spawnX > cfg.endX) spawnX = cfg.endX;

    // Small safety: don’t spawn too close to player anyway
    if (Math.abs(spawnX - playerX) < cfg.spawnAheadMin) return;

    this.world.enemies.push(
      new ChickenNormal({
        x: spawnX,
        groundY: this.world.groundY,
        scale: cfg.scale ?? 0.5,
      }),
    );
  }
}
