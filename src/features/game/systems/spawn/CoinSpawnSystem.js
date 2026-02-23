/* ============================================================================
  CoinSpawnSystem
  ----------------------------------------------------------------------------
  Spawns coins randomly in front of the camera on 2 fixed height lanes:
  - Lane A: Pepe head level
  - Lane B: one lane above

  Also cleans up coins behind the camera.
============================================================================ */

import Coin from "@/features/game/entities/collectables/Coin.js";

export default class CoinSpawnSystem {
  constructor(world) {
    this.world = world;

    // =====================================================
    // CONFIG
    // =====================================================

    this.config = {
      maxCoinsAlive: 12, // max coins in the world at the same time
      spawnEveryFrames: 90, // spawn attempt cadence (dt is "frames" in your game)
      spawnChance: 0.65, // chance that a spawn attempt actually spawns
      spawnAheadMin: 300, // min distance ahead of camera
      spawnAheadMax: 900, // max distance ahead of camera
      minDistanceToOtherCoins: 140, // spacing so coins don't stack
      cleanupBehind: 250, // remove coins this far behind camera
      laneOffsetHead: 0, // fine tune head lane
      laneGap: 90, // distance between lane A and lane B
      yMin: 20, // don't spawn too high (off-screen)
      yMaxPaddingFromGround: 80, // keep coins away from ground
    };

    this._spawnTimer = 0;

    // =====================================================
    // DEBUG
    // =====================================================

    this._dbg = {
      enabled: false,
      id: Math.random().toString(16).slice(2, 6),
    };

    if (this._dbg.enabled) {
      console.log(`[CoinSpawn#${this._dbg.id}] INIT`, this.config);
    }
  }

  update(dt) {
    const world = this.world;

    // Ensure array exists
    if (!world.coins) world.coins = [];

    // 1) Cleanup coins behind camera
    this._cleanupBehindCamera();

    // 2) Spawn cadence
    this._spawnTimer += dt;
    if (this._spawnTimer < this.config.spawnEveryFrames) return;
    this._spawnTimer = 0;

    // 3) Respect max coins
    if (world.coins.length >= this.config.maxCoinsAlive) return;

    // 4) Chance-based spawn
    if (Math.random() > this.config.spawnChance) return;

    // 5) Create coin position
    const pos = this._pickSpawnPosition();
    if (!pos) return;

    // 6) Add coin
    world.coins.push(new Coin(pos));

    if (this._dbg.enabled) {
      console.log(`[CoinSpawn#${this._dbg.id}] SPAWN`, pos, {
        coinsNow: world.coins.length,
      });
    }
  }

  /* ==========================================================================
    Pick spawn position
  ========================================================================== */

  _pickSpawnPosition() {
    const world = this.world;
    const cameraX = world.camera?.x ?? 0;
    const canvasW = world.canvas?.width ?? 800;

    const spawnMinX = cameraX + canvasW + this.config.spawnAheadMin;
    const spawnMaxX = cameraX + canvasW + this.config.spawnAheadMax;

    // random X in front of camera
    const x = this._rand(spawnMinX, spawnMaxX);

    // compute 2 lanes from player head level
    const lanes = this._getCoinLanesY();
    if (!lanes || lanes.length === 0) return null;

    // pick one of the 2 lanes
    const y = lanes[Math.floor(Math.random() * lanes.length)];

    // spacing check
    if (!this._hasEnoughSpacing(x, y)) return null;

    return { x, y };
  }

  _getCoinLanesY() {
    const world = this.world;
    const player = world.character;

    // fallback: use groundY if bounds not available
    const groundY = world.groundY ?? 300;
    const coinH = 70;

    let headY = groundY - 220; // safe fallback

    // Prefer player's bounds for true "head level"
    if (player && typeof player.getBounds === "function") {
      const b = player.getBounds();
      // b.y is player's TOP in your collision system usage
      headY = (b?.y ?? headY) + this.config.laneOffsetHead;
    }

    // Lane A = head level (coin aligned near head)
    // We place coin so its top sits around headY (feel free to tweak)
    const laneA = headY;

    // Lane B = one above
    const laneB = headY - this.config.laneGap;

    // Clamp lanes to stay visible and not too close to ground
    const yMax = groundY - this.config.yMaxPaddingFromGround - coinH;
    const clamp = (v) => Math.max(this.config.yMin, Math.min(v, yMax));

    return [clamp(laneA), clamp(laneB)];
  }

  _hasEnoughSpacing(x, y) {
    const coins = this.world.coins ?? [];
    const minDist = this.config.minDistanceToOtherCoins;

    for (const c of coins) {
      const dx = (c.x ?? 0) - x;
      const dy = (c.y ?? 0) - y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) return false;
    }

    return true;
  }

  /* ==========================================================================
    Cleanup
  ========================================================================== */

  _cleanupBehindCamera() {
    const world = this.world;
    const cameraX = world.camera?.x ?? 0;
    const before = world.coins.length;

    world.coins = world.coins.filter((c) => {
      if (!c) return false;
      if (c.collected) return false;

      // remove coins far behind camera
      if ((c.x ?? 0) < cameraX - this.config.cleanupBehind) return false;

      return true;
    });

    const after = world.coins.length;

    if (this._dbg.enabled && before !== after) {
      console.log(`[CoinSpawn#${this._dbg.id}] CLEANUP`, {
        removed: before - after,
        remaining: after,
      });
    }
  }

  /* ==========================================================================
    Utils
  ========================================================================== */

  _rand(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
