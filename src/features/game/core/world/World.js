// src/classes/core/World.js
import Character from "@/features/game/entities/character/Character.js";
import Enemy from "@/classes/entities/Enemy.js";
import { level1 } from "@/classes/levels/level1.js";

import MovementSystem from "@/classes/systems/MovementSystem.js";
import ThrowSystem from "@/classes/systems/ThrowSystem.js";
import CollisionSystem from "@/classes/systems/CollisionSystem.js";

export default class World {
  constructor({ canvas, camera, keyboard, level = level1 } = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.keyboard = keyboard;
    this.level = level;

    // Ground setup
    this.groundY = this.canvas.height - (this.level.groundOffset ?? 40);

    // Player
    this.character = new Character({ groundY: this.groundY });

    // Entities
    this.enemies = [new Enemy({ x: 600, groundY: this.groundY, scale: 0.5 })];
    this.collectables = [];
    this.bottles = [];

    // World size
    this.worldWidth = this.level.worldWidth ?? 4000;

    // Systems
    this.movementSystem = new MovementSystem(this);
    this.throwSystem = new ThrowSystem(this);
    this.collisionSystem = new CollisionSystem(this);
  }

  update(dt) {
    // Reihenfolge ist wichtig:
    // 1) Movement (Input/Player/Kamera)
    this.movementSystem.update(dt);

    // 2) Throw (Bottles erzeugen + Bottles updaten)
    this.throwSystem.update(dt);

    // 3) Collisions + Enemies update
    this.collisionSystem.update(dt);
  }

  draw(ctx) {
    this.character.draw(ctx, this.camera.x);

    for (const enemy of this.enemies) enemy.draw(ctx, this.camera.x);
    for (const bottle of this.bottles) bottle.draw(ctx, this.camera.x);
  }
}
