export default class CollisionSystem {
  constructor(world) {
    this.world = world;

    this.damageCooldown = 0;

    // =====================================================
    // DEBUG CONFIG
    // =====================================================
    this._dbg = {
      enabled: true,
      deep: false,
      lastCooldownLog: 0,
      lastAabbLog: 0,
      id: Math.random().toString(16).slice(2, 6),
    };

    if (this._dbg.enabled) {
      console.log(`[Collision#${this._dbg.id}] INIT`);
    }
  }

  update(dt) {
    const prevCooldown = this.damageCooldown;
    this.damageCooldown = Math.max(0, this.damageCooldown - dt);

    if (
      this._dbg.enabled &&
      prevCooldown > 0 &&
      this.damageCooldown === 0
    ) {
      console.log(`[Collision#${this._dbg.id}] damageCooldown reset`);
    }

    this._collidePlayerEnemies();
    this._collideBottleEnemies();
    this._collideCollectables();
  }

  // =====================================================
  // PLAYER ↔ ENEMY
  // =====================================================

  _collidePlayerEnemies() {
    const world = this.world;
    const player = world.character;

    if (!player) return;

    const playerBounds = player.getBounds();
    const playerVy = player.vy ?? 0;

    for (const enemy of world.enemies) {
      if (!enemy.alive) continue;

      const enemyBounds = enemy.getBounds();

      if (!this._aabb(playerBounds, enemyBounds)) continue;

      // --- STOMP ---
      if (this._isStomp(playerBounds, enemyBounds, playerVy)) {
        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] STOMP`, {
            playerY: playerBounds.y,
            enemyY: enemyBounds.y,
            playerVy,
          });
        }

        enemy.kill();

        if (typeof player.bounce === "function") {
          player.bounce();
        } else {
          player.vy = -10;
        }

        world.sound?.play?.("enemyKill");
        continue;
      }

      // --- SIDE DAMAGE ---
      if (this.damageCooldown <= 0) {
        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] SIDE DAMAGE`, {
            cooldownBefore: this.damageCooldown,
            playerHP: player.hp,
          });
        }

        if (typeof player.takeDamage === "function") {
          player.takeDamage(20);
        }

        world.sound?.play?.("hurt");
        this.damageCooldown = 45;
      }
    }
  }

  // =====================================================
  // BOTTLE ↔ ENEMY
  // =====================================================

  _collideBottleEnemies() {
    const { bottles, enemies } = this.world;

    for (const bottle of bottles) {
      if (!bottle.alive || bottle.state !== "flying") continue;

      const bottleBounds = bottle.getBounds();

      for (const enemy of enemies) {
        if (!enemy.alive) continue;

        if (!this._aabb(bottleBounds, enemy.getBounds())) continue;

        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] BOTTLE HIT`, {
            bottleX: bottle.x,
            enemyX: enemy.x,
          });
        }

        enemy.kill();
        bottle.land?.();
        break;
      }
    }
  }

  // =====================================================
  // PLAYER ↔ COLLECTABLE
  // =====================================================

  _collideCollectables() {
    const world = this.world;
    const player = world.character;
    if (!player) return;

    const playerBounds = player.getBounds();

    for (const collectable of world.collectables) {
      if (collectable.collected) continue;

      if (this._aabb(playerBounds, collectable.bounds)) {
        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] COLLECT`, {
            type: collectable.type,
            x: collectable.bounds?.x,
          });
        }

        collectable.onCollect?.(world);
      }
    }

    const before = world.collectables.length;

    world.collectables = world.collectables.filter(
      (c) => !c.collected
    );

    const after = world.collectables.length;

    if (this._dbg.enabled && before !== after) {
      console.log(`[Collision#${this._dbg.id}] Collectable cleanup`, {
        removed: before - after,
      });
    }
  }

  // =====================================================
  // AABB
  // =====================================================

  _aabb(a, b) {
    const hit =
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y;

    if (this._dbg.enabled && this._dbg.deep && hit) {
      console.log(`[Collision#${this._dbg.id}] AABB HIT`, { a, b });
    }

    return hit;
  }

  // =====================================================
  // STOMP CHECK
  // =====================================================

  _isStomp(playerBounds, enemyBounds, playerVy, tolerance = 12) {
    const playerBottom = playerBounds.y + playerBounds.h;
    const enemyTop = enemyBounds.y;

    const comingFromAbove = playerBottom <= enemyTop + tolerance;
    const falling = playerVy > 0;

    const result = comingFromAbove && falling;

    if (this._dbg.enabled && this._dbg.deep && result) {
      console.log(`[Collision#${this._dbg.id}] STOMP DETECTED`, {
        playerBottom,
        enemyTop,
        playerVy,
        tolerance,
      });
    }

    return result;
  }
}