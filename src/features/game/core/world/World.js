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
    const worldWidthFromLevel =
      this.level.worldWidth !== undefined ? this.level.worldWidth : 4000;
    this.worldWidth = worldWidthFromLevel;

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
    // -----------------------------------------------------
    // 1) Systems
    // -----------------------------------------------------
    this.movementSystem.update(dt);
    this.throwSystem.update(dt);
    this.collisionSystem.update(dt);
    this.enemySpawnSystem.update(dt);
    this.coinSpawnSystem.update(dt);

    // -----------------------------------------------------
    // 2) Entity updates (WICHTIG für Bewegung/Animation)
    // -----------------------------------------------------

    // Player update (wenn MovementSystem nicht alles übernimmt)
    this.character?.update?.(dt);

    // Enemies update (Bewegung + Animation)
    for (const enemy of this.enemies) {
      enemy.update?.(dt);
    }

    // Bottles update (nur falls du KEIN BottleUpdateSystem aktiv hast)
    for (const bottle of this.bottles) {
      bottle.update?.(dt);
    }

    // -----------------------------------------------------
    // 3) Boss spawn at end of level
    // -----------------------------------------------------
    if (!this.bossSpawned) {
      const playerX = this.character?.x ?? 0;

      // Spawn zone: last ~700px of world
      const spawnZoneX = this.worldWidth - 700;

      if (playerX >= spawnZoneX) {
        this.enemies.push(
          new BossChicken({
            x: this.worldWidth - 350,
            groundY: this.groundY,
            scale: 1.0,
            patrolMinX: this.worldWidth - 700,
            patrolMaxX: this.worldWidth - 150,
          }),
        );

        this.bossSpawned = true;

        if (this._dbg.enabled) {
          console.log(`[World#${this._dbg.id}] BOSS SPAWNED`);
        }
      }
    }

    // -----------------------------------------------------
    // 4) Cleanup
    // -----------------------------------------------------
    this.enemies = this.enemies.filter((e) => !e.markedForRemoval);
    this.bottles = this.bottles.filter((b) => b.alive !== false);

    // -----------------------------------------------------
    // 5) Game state (win/lose) – muss IMMER laufen
    // -----------------------------------------------------
    if (this.character?.dead) {
      this.state = "lost";
    }

    // Win condition (Boss existiert und ist tot)
    const boss = this.enemies.find((e) => e instanceof BossChicken);
    if (boss && !boss.alive) {
      this.state = "won";
    }

    // -----------------------------------------------------
    // 6) Debug logs (nur wenn enabled)
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
