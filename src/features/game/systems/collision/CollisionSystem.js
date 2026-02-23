/* ============================================================================
  CollisionSystem
  ----------------------------------------------------------------------------
  Central collision manager of the game world

  Responsibilities:
  - Player vs Enemy (stomp / damage)
  - Bottle vs Enemy
  - Player vs Coins (collectables)
  - Damage cooldown handling
============================================================================ */

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
      id: Math.random().toString(16).slice(2, 6),
    };

    if (this._dbg.enabled) {
      console.log(`[Collision#${this._dbg.id}] INIT`);
    }
  }

  update(dt) {
    const prevCooldown = this.damageCooldown;
    this.damageCooldown = Math.max(0, this.damageCooldown - dt);

    if (this._dbg.enabled && prevCooldown > 0 && this.damageCooldown === 0) {
      console.log(`[Collision#${this._dbg.id}] damageCooldown reset`);
    }

    this._collidePlayerEnemies();
    this._collideBottleEnemies();
    this._collidePlayerCoins(); // ✅ Coins
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

      // --- DAMAGE ---
      if (this.damageCooldown <= 0) {
        if (typeof player.takeDamage === "function") {
          const damage = enemy.damage ?? 10;

          if (this._dbg.enabled) {
            console.log(`[Collision#${this._dbg.id}] DAMAGE`, {
              enemy: enemy.constructor?.name,
              enemyDamage: enemy.damage,
              usedDamage: damage,
              playerHP_before: player.hp,
            });
          }

          player.takeDamage(damage);

          const hpPercent = Math.round((player.hp / player.maxHp) * 100);
          world.stats?.setHealth?.(hpPercent);

          if (this._dbg.enabled) {
            console.log(`[Collision#${this._dbg.id}] DAMAGE_AFTER`, {
              playerHP_after: player.hp,
              hpPercent,
            });
          }

          world.sound?.play?.("hurt");
          this.damageCooldown = 45;
        }
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
  // PLAYER ↔ COINS
  // - NOTE: world.collectables are coins in your game
  // =====================================================

  _collidePlayerCoins() {
    const world = this.world;
    const player = world.character;
    if (!player) return;

    const coins = world.coins ?? [];
    const playerBounds = player.getBounds();

    for (const coin of coins) {
      if (coin.collected) continue;
      if (this._aabb(playerBounds, coin.bounds)) {
        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] COIN COLLECT`, {
            x: coin.x,
            y: coin.y,
          });
        }
        coin.onCollect?.(world);
      }
    }

    const before = coins.length;
    world.coins = coins.filter((c) => !c.collected);
    const after = world.coins.length;

    if (this._dbg.enabled && before !== after) {
      console.log(`[Collision#${this._dbg.id}] Coin cleanup`, {
        removed: before - after,
        remaining: after,
      });
    }
  }

  // =====================================================
  // AABB
  // =====================================================

  _aabb(a, b) {
    const hit =
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

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
