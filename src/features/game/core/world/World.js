import Character from "@/features/game/entities/character/Character.js";
import Enemy from "@/features/game/entities/enemy/Enemy.js";
import { level1 } from "@/features/game/levels/level1.js";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";

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

    this.groundY = 398;

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
    this.sound.register("bottle", "/audio/bottle.mp3", { volume: 0.6 });

    // -----------------------------------------------------
    // Entities
    // -----------------------------------------------------

    this.enemies = [new Enemy({ x: 600, groundY: this.groundY, scale: 0.5 })];

    this.collectables = [
      new Coin({ x: 420, y: this.groundY - 120 }),
      new Coin({ x: 480, y: this.groundY - 120 }),
      // new SalsaBottlePickup({ x: 680, y: this.groundY - 70 }),
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
          collectables: this.collectables.length,
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

    if (!this._dbg.enabled) return;

    this._dbg.frameCounter++;

    // Log every ~60 frames
    if (this._dbg.frameCounter % 60 === 0) {
      console.log(`[World#${this._dbg.id}] UPDATE`, {
        dt: Number(dt.toFixed(2)),
        enemiesAlive: this.enemies.filter((e) => e.alive).length,
        bottlesActive: this.bottles.filter((b) => b.alive).length,
        collectablesLeft: this.collectables.length,
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

    for (const item of this.collectables) {
      item.draw(ctx, this.camera.x);
    }

    // Throttled draw log
    if (this._dbg.enabled && this._dbg.frameCounter % 120 === 0) {
      console.log(`[World#${this._dbg.id}] DRAW OK`, {
        cameraX: Number(this.camera?.x?.toFixed?.(1) ?? 0),
        entitiesDrawn:
          1 +
          this.enemies.length +
          this.bottles.length +
          this.collectables.length,
      });
    }
  }
}
