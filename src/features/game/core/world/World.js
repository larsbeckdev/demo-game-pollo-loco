import Character from "@/features/game/entities/character/Character.js";
import {
  ChickenNormal,
  ChickenSmall,
  BossChicken,
} from "@/features/game/entities/enemy/Enemies.js";
import { level1 } from "@/features/game/levels";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";
import EnemySpawnSystem from "@/features/game/systems/spawn/EnemySpawnSystem.js";
import CoinSpawnSystem from "@/features/game/systems/spawn/CoinSpawnSystem.js";

import StatsStore from "@/features/game/core/stats/StatsStore.js";
import SoundManager from "@/features/game/core/audio/SoundManager.js";

export default class World {
  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

    // -----------------------------------------------------
    // Game state
    // -----------------------------------------------------
    this.state = "intro"; // "intro" | "playing" | "won" | "lost"

    // =====================================================
    // DEBUG CONFIG
    // =====================================================
    this._dbg = {
      enabled: false,
      deep: false,
      id: Math.random().toString(16).slice(2, 6),
      frameCounter: 0,
    };

    // -----------------------------------------------------
    // Ground
    // -----------------------------------------------------
    const groundOffset = this.level.groundOffset ?? 40;
    this.groundY = this.canvas.height - groundOffset;

    // -----------------------------------------------------
    // Player
    // -----------------------------------------------------
    this.character = new Character({ groundY: this.groundY });

    // -----------------------------------------------------
    // Stats + Sound
    // -----------------------------------------------------
    this.stats = new StatsStore({ health: 100 });
    this.sound = new SoundManager();
    this.sound.register("coin", "/audio/coin.mp3", { volume: 0.6 });

    // -----------------------------------------------------
    // World Size
    // -----------------------------------------------------
    this.worldWidth =
      this.level.worldWidth !== undefined ? this.level.worldWidth : 4000;

    // -----------------------------------------------------
    // Entities
    // -----------------------------------------------------
    this.enemies = [
      new ChickenNormal({
        x: 600,
        groundY: this.groundY,
        scale: 0.5,
        patrolMinX: 200,
        patrolMaxX: 1200,
      }),
      new ChickenSmall({ x: 900, groundY: this.groundY, scale: 0.5 }),
    ];

    // Boss state
    this.bossSpawned = false;

    // coins
    this.coins = [];

    // bottles
    this.bottles = [];

    // -----------------------------------------------------
    // Systems
    // -----------------------------------------------------
    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);
    this.enemySpawnSystem = new EnemySpawnSystem(this);
    this.coinSpawnSystem = new CoinSpawnSystem(this);

    if (this._dbg.enabled) {
      console.log(
        `%c[World#${this._dbg.id}] INIT`,
        "color:cyan;font-weight:bold;",
        {
          groundY: this.groundY,
          worldWidth: this.worldWidth,
          enemies: this.enemies.length,
          coins: this.coins.length,
          bottles: this.bottles.length,
          levelId: this.level?.id ?? "unknown",
          bossCfg: this.level?.boss ?? null,
        },
      );
    }
  }

  // =====================================================
  // UPDATE
  // =====================================================
  update(dt) {
    if (this._dbg?.enabled) {
      console.log("[World] state =", this.state);
    }
    // ✅ Freeze world when not playing
    // This prevents post-win/post-lose damage, spawns, and weird state flips.
    if (this.state !== "playing") {
      if (this._dbg.enabled) this._dbg.frameCounter++;
      return;
    }

    // -----------------------------------------------------
    // 1) Systems
    // -----------------------------------------------------
    this.movementSystem.update(dt);
    this.throwSystem.update(dt);
    this.collisionSystem.update(dt);
    this.enemySpawnSystem.update(dt);
    this.coinSpawnSystem.update(dt);

    // -----------------------------------------------------
    // 2) Entity updates (movement + animations)
    // -----------------------------------------------------
    this.character?.update?.(dt);

    for (const enemy of this.enemies) {
      enemy.update?.(dt);
    }

    for (const bottle of this.bottles) {
      bottle.update?.(dt);
    }

    // -----------------------------------------------------
    // 3) Boss spawn (from level config)
    // -----------------------------------------------------
    if (!this.bossSpawned) {
      const playerX = this.character?.x ?? 0;

      const bossCfg = this.level?.boss ?? null;

      // Defaults if a level has no boss config
      const bossX = bossCfg?.x ?? this.worldWidth - 350;
      const bossScale = bossCfg?.scale ?? 1.0;
      const bossHp = bossCfg?.hp ?? 5;

      // Spawn zone: a bit before boss position
      const spawnZoneX = bossX - 600;

      if (playerX >= spawnZoneX) {
        const boss = new BossChicken({
          x: bossX,
          groundY: this.groundY,
          scale: bossScale,
          patrolMinX: bossX - 450,
          patrolMaxX: bossX + 200,
        });

        // ✅ Apply level HP to boss
        boss.maxHp = bossHp;
        boss.hp = bossHp;

        this.enemies.push(boss);
        this.bossSpawned = true;

        if (this._dbg.enabled) {
          console.log(`[World#${this._dbg.id}] BOSS SPAWNED`, {
            bossX,
            bossScale,
            bossHp,
          });
        }
      }
    }

    // -----------------------------------------------------
    // 4) Cleanup
    // -----------------------------------------------------
    this.enemies = this.enemies.filter((e) => !e.markedForRemoval);
    this.bottles = this.bottles.filter((b) => b.alive !== false);

    // -----------------------------------------------------
    // 5) Game state (win/lose)
    // -----------------------------------------------------
    if (this.character?.dead) {
      this.state = "lost";
    }

    const boss = this.enemies.find((e) => e instanceof BossChicken);
    if (boss && !boss.alive) {
      this.state = "won";
    }

    // -----------------------------------------------------
    // 6) Debug logs
    // -----------------------------------------------------
    if (!this._dbg.enabled) return;

    this._dbg.frameCounter++;

    if (this._dbg.frameCounter % 60 === 0) {
      console.log(`[World#${this._dbg.id}] UPDATE`, {
        dt: Number(dt.toFixed(2)),
        enemiesAlive: this.enemies.filter((e) => e.alive).length,
        bottlesActive: this.bottles.filter((b) => b.alive).length,
        coinsLeft: this.coins.length,
        playerX: Number(this.character?.x?.toFixed?.(1) ?? 0),
        cameraX: Number(this.camera?.x?.toFixed?.(1) ?? 0),
        bossSpawned: this.bossSpawned,
        levelId: this.level?.id ?? "unknown",
      });
    }
  }

  // =====================================================
  // DRAW
  // =====================================================
  draw(ctx) {
    this.character.draw(ctx, this.camera.x);

    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.camera.x);
    }

    for (const bottle of this.bottles) {
      bottle.draw(ctx, this.camera.x);
    }

    for (const coin of this.coins) {
      coin.draw(ctx, this.camera.x);
    }

    if (this._dbg.enabled && this._dbg.frameCounter % 120 === 0) {
      console.log(`[World#${this._dbg.id}] DRAW OK`, {
        cameraX: Number(this.camera?.x?.toFixed?.(1) ?? 0),
        entitiesDrawn:
          1 + this.enemies.length + this.bottles.length + this.coins.length,
      });
    }
  }
}
