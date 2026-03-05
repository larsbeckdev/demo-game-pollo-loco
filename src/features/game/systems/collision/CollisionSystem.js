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

import { BossChicken } from "@/features/game/entities/enemy/Enemies.js";

export default class CollisionSystem {
  constructor(world) {
    this.world = world;

    this.damageCooldown = 0;

    // =====================================================
    // DEBUG CONFIG
    // =====================================================
    this._dbg = {
      enabled: false,
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
    this._collidePlayerCoins();
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

        // Boss NICHT stomp-kill (optional: wenn du willst, hier blocken)
        if (enemy instanceof BossChicken) {
          // optional: bounce only
          if (typeof player.bounce === "function") player.bounce();
          else player.vy = -10;
          continue;
        }

        enemy.kill();

        if (typeof player.bounce === "function") player.bounce();
        else player.vy = -10;

        const sfx = Math.random() < 0.5 ? "chickenDead1" : "chickenDead2";
        world.sound?.play?.(sfx);
        continue;
      }

      // --- DAMAGE ---
      if (this.damageCooldown <= 0) {
        if (
          enemy instanceof BossChicken &&
          typeof enemy.isAttacking === "function"
        ) {
          if (!enemy.isAttacking()) continue;
        }

        if (typeof player.takeDamage === "function") {
          const damage = enemy.damage ?? 10;

          if (this._dbg.enabled) {
            console.log(`[Collision#${this._dbg.id}] DAMAGE`, {
              enemy: enemy.constructor?.name,
              usedDamage: damage,
              playerHP_before: player.hp,
            });
          }

          player.takeDamage(damage);

          const hpPercent = Math.round((player.hp / player.maxHp) * 100);
          world.stats?.setHealth?.(hpPercent);

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
    const world = this.world;
    const { bottles, enemies } = world;

    for (const bottle of bottles) {
      if (!bottle.alive || bottle.state !== "flying") continue;

      const bottleBounds = bottle.getBounds();

      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (!this._aabb(bottleBounds, enemy.getBounds())) continue;

        const isBoss = enemy instanceof BossChicken;

        if (this._dbg.enabled) {
          console.log(`[Collision#${this._dbg.id}] BOTTLE HIT`, {
            enemy: enemy.constructor?.name,
            isBoss,
            bottleX: bottle.x,
            enemyX: enemy.x,
          });
        }

        // ✅ Boss: damage instead of kill
        if (isBoss && typeof enemy.takeHit === "function") {
          enemy.takeHit(1);

          // Bossbar updaten (0..100)
          const hp = enemy.hp ?? 0;
          const maxHp = enemy.maxHp ?? 1;
          const percent = Math.max(0, Math.round((hp / maxHp) * 100));
          world.stats?.setBoss?.(percent);

          const eb = enemy.getBounds();
          const hitY = eb.y + eb.h * 0.5;
          bottle.break?.(hitY);

          bottle.break?.();
          break;
        }

        // ✅ Normal enemies: kill on hit
        enemy.kill();
        const sfx = Math.random() < 0.5 ? "chickenDead1" : "chickenDead2";
        world.sound?.play?.(sfx);
        bottle.land?.();
        break;
      }
    }
  }

  // =====================================================
  // PLAYER ↔ COINS
  // =====================================================

  _collidePlayerCoins() {
    const world = this.world;
    const player = world.character;
    if (!player) return;

    const coins = world.coins ?? [];
    const playerBounds = player.getBounds();

    for (const coin of coins) {
      if (coin.collected) continue;

      // coin.bounds muss korrekt sein (du hast das schon angepasst)
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

    world.coins = coins.filter((c) => !c.collected);
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

    return comingFromAbove && falling;
  }
}
