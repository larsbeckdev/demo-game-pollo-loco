/* ============================================================================
  ThrowSystem
  - Handles complete throw logic
  - Coordinates:
      1) Input edge detection
      2) Bottle spawning
      3) Bottle updating + cleanup
============================================================================ */

import Bottle from "@/features/game/entities/bottle/Bottle.js";

/* ============================================================================
  ThrowInputSystem
  - Detects "just pressed" state for throw key
============================================================================ */

class ThrowInputSystem {
  constructor(world) {
    this.world = world;
    this.wasDown = false;
  }

  justPressed() {
    const isCurrentlyDown = !!this.world.keyboard.THROW;
    const isJustPressed = isCurrentlyDown && !this.wasDown;
    this.wasDown = isCurrentlyDown;
    return isJustPressed;
  }
}

/* ============================================================================
  BottleSpawnSystem
  - Creates new bottle entities
============================================================================ */

class BottleSpawnSystem {
  constructor(world) {
    this.world = world;
  }

  spawn() {
    const world = this.world;
    const character = world.character;

    /* Spawn position */
    const spawnX = character.x + (character.facing === 1 ? 60 : -10);

    const spawnY = character.y - character.h * 0.6;

    /* Create bottle */
    const bottle = new Bottle({
      x: spawnX,
      y: spawnY,
      direction: character.facing,
      groundY: world.groundY,
      worldWidth: world.worldWidth,
    });

    world.bottles.push(bottle);
  }
}

/* ============================================================================
  BottleUpdateSystem
  - Updates all bottles
  - Removes inactive bottles
============================================================================ */

class BottleUpdateSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const world = this.world;

    /* Update bottles */
    for (const bottle of world.bottles) {
      bottle.update(dt);
    }

    /* Cleanup */
    world.bottles = world.bottles.filter((bottle) => bottle.alive);
  }
}

/* ============================================================================
  ThrowSystem (Main)
============================================================================ */

export default class ThrowSystem {
  constructor(world) {
    this.world = world;

    /* Subsystems */
    this.input = new ThrowInputSystem(world);
    this.spawnSystem = new BottleSpawnSystem(world);
    this.updateSystem = new BottleUpdateSystem(world);
  }

  update(dt) {
    /* ------------------------------------------------------------
       1) Detect single press
    ------------------------------------------------------------ */
    if (this.input.justPressed()) {
      this.spawnSystem.spawn();
    }

    /* ------------------------------------------------------------
       2) Update + cleanup bottles
    ------------------------------------------------------------ */
    this.updateSystem.update(dt);
  }
}
