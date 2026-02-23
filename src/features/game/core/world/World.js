import Character from "@/features/game/entities/character/Character.js";
import {
  ChickenNormal,
  ChickenSmall,
  BossChicken,
} from "@/features/game/entities/enemy/Enemies.js";
import { level1, level2, level3, level4 } from "@/features/game/levels";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";
import EnemySpawnSystem from "@/features/game/systems/spawn/EnemySpawnSystem.js";

import Coin from "@/features/game/entities/collectables/Coin.js";
import StatsStore from "@/features/game/core/stats/StatsStore.js";
import SoundManager from "@/features/game/core/audio/SoundManager.js";

export default class World {
  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

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
      new BossChicken({ x: 1800, groundY: this.groundY, scale: 1.0 }),
    ];

    this.enemySpawnSystem = new EnemySpawnSystem(this);

    // coins
    this.coins = [
      new Coin({ x: 420, y: this.groundY - 120 }),
      new Coin({ x: 480, y: this.groundY - 120 }),
    ];

    this.bottles = [];

    // -----------------------------------------------------
    // World Size
    // -----------------------------------------------------

    const worldWidthFromLevel =
      this.level.worldWidth !== undefined ? this.level.worldWidth : 4000;

    this.worldWidth = worldWidthFromLevel;

    // -----------------------------------------------------
    // Systems
    // -----------------------------------------------------

    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);

    // -----------------------------------------------------
    // INIT LOG
    // -----------------------------------------------------

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
          level: this.level?.name ?? "unknown",
        },
      );
    }
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(dt) {
    this.movementSystem.update(dt);
    this.throwSystem.update(dt);
    this.collisionSystem.update(dt);
    this.enemySpawnSystem.update(dt);

    if (!this._dbg.enabled) return;

    this._dbg.frameCounter++;

    // Log every ~60 frames
    if (this._dbg.frameCounter % 60 === 0) {
      console.log(`[World#${this._dbg.id}] UPDATE`, {
        dt: Number(dt.toFixed(2)),
        enemiesAlive: this.enemies.filter((e) => e.alive).length,
        bottlesActive: this.bottles.filter((b) => b.alive).length,
        coinsLeft: this.coins.length,
        playerX: Number(this.character?.x?.toFixed?.(1) ?? 0),
        cameraX: Number(this.camera?.x?.toFixed?.(1) ?? 0),
      });
    }

    if (this._dbg.deep) {
      console.log(`[World#${this._dbg.id}] DEEP UPDATE`, {
        playerState: this.character?.state,
        playerVy: this.character?.vy,
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

    // ✅ collectables -> coins
    for (const coin of this.coins) {
      coin.draw(ctx, this.camera.x);
    }

    // Throttled draw log
    if (this._dbg.enabled && this._dbg.frameCounter % 120 === 0) {
      console.log(`[World#${this._dbg.id}] DRAW OK`, {
        cameraX: Number(this.camera?.x?.toFixed?.(1) ?? 0),
        entitiesDrawn:
          1 + this.enemies.length + this.bottles.length + this.coins.length,
      });
    }
  }
}
