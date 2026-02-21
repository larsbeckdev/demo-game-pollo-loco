/* ============================================================================
  Imports
  - Entities: Character and Enemy
  - Level data: default level configuration
  - Systems: Movement, Throw, Collision
============================================================================ */

import Character from "@/features/game/entities/character/Character.js";
import Enemy from "@/features/game/entities/enemy/Enemy.js";
import { level1 } from "@/features/game/levels/level1.js";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";

import Coin from "@/features/game/entities/collectables/Coin.js"; // add
import SalsaBottlePickup from "@/features/game/entities/collectables/SalsaBottlePickup.js"; // add
import StatsStore from "@/features/game/core/stats/StatsStore.js"; // add (optional but recommended)
import SoundManager from "@/features/game/core/audio/SoundManager.js"; // add (optional but recommended)

/* ============================================================================
  World
  - Holds references to canvas, camera, input, and current level
  - Owns all entities (player, enemies, bottles, collectables)
  - Owns and calls all systems in the correct order
============================================================================ */

export default class World {
  /* ==========================================================================
    Constructor
    - Stores shared references (canvas, camera, keyboard, level)
    - Calculates ground position
    - Creates initial entities
    - Defines world boundaries
    - Creates systems
  ========================================================================== */

  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    /* ------------------------------------------------------------------------
      Shared references
    ------------------------------------------------------------------------ */

    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

    /* ------------------------------------------------------------------------
      Ground setup
    ------------------------------------------------------------------------ */

    this.groundY = 398;

    /* ------------------------------------------------------------------------
      Player setup
    ------------------------------------------------------------------------ */

    this.character = new Character({ groundY: this.groundY });

    /* ------------------------------------------------------------------------
      Stats + Sound (Phase 4) // add
      - stats: coins, bottles, health
      - sound: simple sfx playback
    ------------------------------------------------------------------------ */

    this.stats = new StatsStore({ health: 100 }); // add
    this.sound = new SoundManager(); // add
    this.sound.register("coin", "/audio/coin.mp3", { volume: 0.6 }); // add
    this.sound.register("bottle", "/audio/bottle.mp3", { volume: 0.6 }); // add

    /* ------------------------------------------------------------------------
      Entities setup
    ------------------------------------------------------------------------ */

    this.enemies = [new Enemy({ x: 600, groundY: this.groundY, scale: 0.5 })];

    this.collectables = [
      new Coin({ x: 420, y: this.groundY - 120 }), // add
      new Coin({ x: 480, y: this.groundY - 120 }), // add
      new SalsaBottlePickup({ x: 680, y: this.groundY - 70 }), // add
    ]; // add

    this.bottles = [];

    /* ------------------------------------------------------------------------
      World size / boundaries
    ------------------------------------------------------------------------ */

    const worldWidthFromLevel =
      this.level.worldWidth !== undefined ? this.level.worldWidth : 4000;

    this.worldWidth = worldWidthFromLevel;

    /* ------------------------------------------------------------------------
      Systems setup
    ------------------------------------------------------------------------ */

    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);
  }

  update(dt) {
    this.movementSystem.update(dt);
    this.throwSystem.update(dt);
    this.collisionSystem.update(dt);
  }

  draw(ctx) {
    this.character.draw(ctx, this.camera.x);

    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.camera.x);
    }

    for (const bottle of this.bottles) {
      bottle.draw(ctx, this.camera.x);
    }

    /* ------------------------------------------------------------------------
      Collectables draw // add
    ------------------------------------------------------------------------ */

    for (const item of this.collectables) {
      // add
      item.draw(ctx, this.camera.x); // add
    } // add
  }
}
