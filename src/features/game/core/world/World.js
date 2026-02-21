// src/classes/core/World.js

import Character from "@/features/game/entities/character/Character.js";
import Enemy from "@/features/game/entities/enemy/Enemy.js";
import { level1 } from "@/features/game/levels/level1.js";

import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/throw/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";

export default class World {
  constructor({
    canvasElement,
    cameraSystem,
    keyboardInput,
    levelConfiguration = level1,
  } = {}) {
    this.canvasElement = canvasElement; // Canvas DOM element
    this.cameraSystem = cameraSystem; // Camera reference
    this.keyboardInput = keyboardInput; // Keyboard input reference
    this.levelConfiguration = levelConfiguration; // Level configuration object

    // --------------------------------------------------
    // Ground configuration
    // --------------------------------------------------
    this.groundPositionY =
      this.canvasElement.height - (this.levelConfiguration.groundOffset ?? 40);

    // --------------------------------------------------
    // Player entity
    // --------------------------------------------------
    this.playerCharacter = new Character({
      groundPositionY: this.groundPositionY,
    });

    // --------------------------------------------------
    // Entity collections
    // --------------------------------------------------
    this.enemyEntities = [
      new Enemy({
        x: 600,
        groundPositionY: this.groundPositionY,
        scale: 0.5,
      }),
    ];

    this.collectableEntities = [];
    this.throwableBottleEntities = [];

    // --------------------------------------------------
    // World size
    // --------------------------------------------------
    this.worldWidth = this.levelConfiguration.worldWidth ?? 4000;

    // --------------------------------------------------
    // Systems
    // --------------------------------------------------
    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);
  }

  update(deltaTimeInFrames) {
    // Order is important:

    // 1) Movement system (input, player, camera)
    this.movementSystem.update(deltaTimeInFrames);

    // 2) Throw system (create + update bottles)
    this.throwSystem.update(deltaTimeInFrames);

    // 3) Collision system (collisions + enemy updates)
    this.collisionSystem.update(deltaTimeInFrames);
  }

  draw(canvasContext2D) {
    // Draw player
    this.playerCharacter.draw(canvasContext2D, this.cameraSystem.x);

    // Draw enemies
    for (const enemyEntity of this.enemyEntities) {
      enemyEntity.draw(canvasContext2D, this.cameraSystem.x);
    }

    // Draw bottles
    for (const bottleEntity of this.throwableBottleEntities) {
      bottleEntity.draw(canvasContext2D, this.cameraSystem.x);
    }
  }
}
