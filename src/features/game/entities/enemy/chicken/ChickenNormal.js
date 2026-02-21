import EnemyBase, { makeFramePaths } from "../EnemyBase.js";

export default class ChickenNormal extends EnemyBase {
  constructor({ x, groundY, scale = 0.5 } = {}) {
    const base = "/images/3_enemies_chicken/chicken_normal";

    const walkPaths = makeFramePaths(`${base}/1_walk`, [
      "1_w.png",
      "2_w.png",
      "3_w.png",
    ]);

    super({
      x,
      groundY,
      scale,
      baseWidth: 80,
      baseHeight: 80,
      speed: 1.2,
      direction: -1,
      // Patrol ist optional; wenn null, läuft er endlos (oder du drehst im Spawner um)
      patrolMinX: null,
      patrolMaxX: null,
      walkPaths,
      walkFps: 8,
      deadImageSrc: `${base}/2_dead/dead.png`,
      deathLifetime: 120,
    });
  }
}
