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
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default class EnemySpawnSystem {
  constructor(world) {
    this.world = world;

    this.points = [];
    this.nextIndex = 0;

    this.timer = 0;
    this.nextIn = 60;

    this._initPoints();
    this._scheduleNext();
  }

  _cfg() {
    return this.world.level?.enemySpawn ?? null;
  }

  _progress01() {
    const cfg = this._cfg();
    if (!cfg) return 0;

    const startX = cfg.startX ?? 400;
    const endX = cfg.endX ?? 5200;

    const playerX = this.world.character?.x ?? 0;
    const t = (playerX - startX) / Math.max(1, endX - startX);
    return clamp01(t);
  }

  _scaledCfg() {
    const cfg = this._cfg();
    if (!cfg) return null;

    // progress 0..1
    const p = this._progress01();

    // 🔥 Schwierigkeit steigt zum Ende hin
    // Du kannst die Kurve hier steuern:
    const curve = p * p; // quadratic: am Anfang sanft, am Ende steiler

    // Intervalle werden kürzer (mehr Druck)
    const intervalMin = Math.round(
      lerp(cfg.intervalMin ?? 45, (cfg.intervalMin ?? 45) * 0.65, curve),
    );
    const intervalMax = Math.round(
      lerp(cfg.intervalMax ?? 120, (cfg.intervalMax ?? 120) * 0.7, curve),
    );

    // maxAlive steigt Richtung Ende
    const maxAliveBase = cfg.maxAlive ?? 6;
    const maxAlive = Math.round(lerp(maxAliveBase, maxAliveBase + 3, curve));

    // Spawn Ahead (nutzt endlich deine Config)
    const spawnAheadMin = cfg.spawnAheadMin ?? 500;
    const spawnAheadMax = cfg.spawnAheadMax ?? 1100;
    const spawnAhead = Math.round(randFloat(spawnAheadMin, spawnAheadMax));

    // Enemy variety: leicht steigern (optional)
    const smallChance = lerp(0.25, 0.45, curve);

    return {
      ...cfg,
      intervalMin,
      intervalMax,
      maxAlive,
      spawnAhead,
      smallChance,
    };
  }

  _scheduleNext() {
    const cfg = this._scaledCfg();
    if (!cfg) {
      this.nextIn = 999999;
      return;
    }
    this.nextIn = randInt(cfg.intervalMin, cfg.intervalMax);
  }

  _initPoints() {
    const cfg = this._cfg();
    this.points = [];
    this.nextIndex = 0;
    if (!cfg) return;

    const startX = cfg.startX ?? 400;
    const endX = cfg.endX ?? 5200;

    const length = Math.max(0, endX - startX);

    // ✅ gleichmäßiger: count aus Länge + Zielabstand
    // Level werden dadurch “fairer” vergleichbar
    const targetSpacing = 320; // ~ alle 320px ein Spawnpunkt
    const count = Math.max(
      12,
      Math.min(34, Math.round(length / targetSpacing)),
    );

    // ✅ nicht zu nah clustern, aber nicht zu leer
    const minGap = 260;

    const bossX = this.world.level?.boss?.x ?? null;
    const noSpawnRadius = 450;

    const points = [];
    let safety = 0;

    while (points.length < count && safety < count * 120) {
      safety++;

      const x = Math.floor(randFloat(startX + 150, endX - 150));

      if (bossX !== null && Math.abs(x - bossX) < noSpawnRadius) continue;

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

  reset() {
    this.timer = 0;
    this._initPoints();
    this._scheduleNext();
  }

  update(dt) {
    const cfg = this._scaledCfg();
    if (!cfg) return;
    if (this.world.state !== "playing") return;

    const aliveCount = this.world.enemies.filter((e) => e.alive).length;
    if (aliveCount >= cfg.maxAlive) return;

    if (this.nextIndex >= this.points.length) return;

    this.timer += dt;
    if (this.timer < this.nextIn) return;

    const playerX = this.world.character?.x ?? 0;

    // Viewport
    const camX = this.world.camera?.x ?? 0;
    const viewW = this.world.canvas?.width ?? 800;

    // ✅ Offscreen Margin (nie sichtbar)
    const offscreenPad = 220;
    const minOffscreenX = camX + viewW + offscreenPad;

    // ✅ trigger: nutze spawnAhead aus cfg (statt fix 1800)
    const plannedX = this.points[this.nextIndex];

    // Spawn erst, wenn player nahe genug dran ist
    if (playerX + cfg.spawnAhead < plannedX) return;

    // Offscreen rechts erzwingen
    const spawnX = Math.max(plannedX, minOffscreenX);

    const EnemyClass =
      Math.random() < cfg.smallChance ? ChickenSmall : ChickenNormal;

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

    this._scheduleNext();
  }
}
