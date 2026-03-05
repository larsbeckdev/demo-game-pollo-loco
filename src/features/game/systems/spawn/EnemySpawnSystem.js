// EnemySpawnSystem.js
import {
  ChickenNormal,
  ChickenSmall,
} from "@/features/game/entities/enemy/Enemies.js";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export default class EnemySpawnSystem {
  constructor(world) {
    this.world = world;

    // list of x-positions to spawn across the level
    this.points = [];
    this.nextIndex = 0;

    // time gating (keeps it organic)
    this.timer = 0;
    this.nextIn = 60;

    this._initPoints();
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
    this.nextIn = randInt(cfg.intervalMin ?? 45, cfg.intervalMax ?? 120);
  }

  _initPoints() {
    const cfg = this._cfg();
    this.points = [];
    this.nextIndex = 0;

    if (!cfg) return;

    const startX = cfg.startX ?? 400;
    const endX = cfg.endX ?? 5200;

    // Heuristik: wie viele Gegner insgesamt über die Strecke?
    // (kannst du später als cfg.countMin/Max ergänzen, wenn du willst)
    const length = Math.max(0, endX - startX);
    const approx = Math.round(length / 300); // ~ alle 300px ein Spawnpunkt
    const count = Math.max(10, Math.min(28, approx));

    // Abstand zwischen Spawnpunkten, damit es nicht clustert
    const minGap = 240;

    // optional: Boss-Zone meiden
    const bossX = this.world.level?.boss?.x ?? null;
    const noSpawnRadius = 450;

    const points = [];
    let safety = 0;

    while (points.length < count && safety < count * 80) {
      safety++;

      const x = Math.floor(randFloat(startX + 150, endX - 150));

      // boss area block
      if (bossX !== null && Math.abs(x - bossX) < noSpawnRadius) continue;

      // minGap
      let ok = true;
      for (const px of points) {
        if (Math.abs(px - x) < minGap) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      points.push(x);
    }

    points.sort((a, b) => a - b);

    this.points = points;
  }

  // Optional: call when you load a new level / new world
  reset() {
    this.timer = 0;
    this._initPoints();
    this._scheduleNext();
  }

  update(dt) {
    const cfg = this._cfg();
    if (!cfg) return;
    if (this.world.state !== "playing") return;

    const aliveCount = this.world.enemies.filter((e) => e.alive).length;
    if (aliveCount >= (cfg.maxAlive ?? 6)) return;

    if (this.nextIndex >= this.points.length) return;

    const playerX = this.world.character?.x ?? 0;

    // ✅ schneller spawnen (weniger warten)
    this.timer += dt;
    if (this.timer < this.nextIn) return;

    // ✅ Viewport/Offscreen-Info
    const camX = this.world.camera?.x ?? 0;
    const viewW = this.world.canvas?.width ?? 800;

    // ✅ Offscreen Margin: damit man es nie sieht
    const offscreenPad = 220;

    // ✅ Spawn erst, wenn player nahe genug dran ist, ABER so,
    // dass wir definitiv rechts außerhalb des Screens spawnen.
    const triggerAhead = 1800; // vorher 1000 → deutlich früher triggern
    const plannedX = this.points[this.nextIndex];

    if (playerX + triggerAhead < plannedX) return;

    // ✅ erzwinge offscreen rechts: mindestens "rechts vom Bildschirm"
    const minOffscreenX = camX + viewW + offscreenPad;

    // ✅ spawnX ist max(plannedX, offscreen-rechts)
    // (so bleibt die Verteilung grob erhalten, aber ohne Pop-in)
    const spawnX = Math.max(plannedX, minOffscreenX);

    // choose enemy type (optional variety)
    const smallChance = 0.35;
    const EnemyClass =
      Math.random() < smallChance ? ChickenSmall : ChickenNormal;

    this.world.enemies.push(
      new EnemyClass({
        x: spawnX,
        groundY: this.world.groundY,
        scale: cfg.scale ?? 0.5,
        patrolMinX: spawnX - 180,
        patrolMaxX: spawnX + 180,
      }),
    );

    this.nextIndex++;
    this.timer = 0;

    // ✅ kürzere nächste Wartezeit, damit "mehr los" ist
    this._scheduleNext();
  }
}
