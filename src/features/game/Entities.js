// src/features/game/Entities.js

/* ============================================================================
  Entities
  - All canvas entities are defined here (compact approach)
  - Each entity:
      - has update(dt, world)
      - has draw(context, cameraX, assets)
      - has getBounds()
  - No Vue, no DOM, no console output
============================================================================ */

import { drawSprite } from "./Render.js";

/* ---------------------------------------------------------------------------
  Math Helpers
--------------------------------------------------------------------------- */

/**
 * Clamp a value between min and max.
 * @param {number} value - Value
 * @param {number} min - Min
 * @param {number} max - Max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Axis-aligned bounding box overlap test.
 * @param {{x:number,y:number,width:number,height:number}} a - Bounds A
 * @param {{x:number,y:number,width:number,height:number}} b - Bounds B
 * @returns {boolean}
 */
function isOverlapping(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/* ---------------------------------------------------------------------------
  Animation (simple frame cycling)
--------------------------------------------------------------------------- */

class FrameAnimation {
  /**
   * @param {string[]} frameSources - Image sources
   * @param {number} framesPerSecond - Playback speed
   */
  constructor(frameSources, framesPerSecond) {
    this.frameSources = frameSources;
    this.framesPerSecond = framesPerSecond;

    this.currentFrameIndex = 0;
    this.frameTimerFrames = 0;
  }

  /**
   * @param {number} deltaFrames - Delta in "frames" (dt units)
   */
  update(deltaFrames) {
    const frameDuration = 60 / this.framesPerSecond;
    this.frameTimerFrames += deltaFrames;

    while (this.frameTimerFrames >= frameDuration) {
      this.frameTimerFrames -= frameDuration;
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.frameSources.length;
    }
  }

  /**
   * @returns {string}
   */
  getCurrentFrameSource() {
    return this.frameSources[this.currentFrameIndex];
  }
}

/* ---------------------------------------------------------------------------
  Character
--------------------------------------------------------------------------- */

export class Character {
  /**
   * @param {{x:number, groundY:number}} options - Setup
   */
  constructor(options) {
    this.x = options.x;
    this.groundY = options.groundY;

    this.width = 90;
    this.height = 140;

    this.speed = 4.0;
    this.jumpVelocity = -14.5;
    this.gravity = 0.75;

    this.velocityY = 0;
    this.isOnGround = true;

    this.facingRight = true;

    this.health = 100;
    this.isDead = false;

    this.damageCooldownFrames = 0;

    this.idleAnimation = new FrameAnimation(
      ["/images/2_character_pepe/1_idle/idle/I-1.png"],
      8,
    );

    this.walkAnimation = new FrameAnimation(
      ["/images/2_character_pepe/2_walk/W-21.png"],
      10,
    );

    this.jumpAnimation = new FrameAnimation(
      ["/images/2_character_pepe/3_jump/J-31.png"],
      10,
    );
  }

  /**
   * @param {number} deltaFrames - dt units (about 1 at 60fps)
   * @param {import("./World.js").World} world - World reference
   */
  update(deltaFrames, world) {
    if (this.isDead) return;

    this._updateCooldowns(deltaFrames);
    this._handleHorizontalMovement(
      deltaFrames,
      world.inputState,
      world.levelData,
    );
    this._handleJump(world.inputState);
    this._applyGravity(deltaFrames, world.groundY);
    this._updateAnimations(deltaFrames, world.inputState);
  }

  /**
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} cameraX - Camera offset
   * @param {import("./Assets.js").Assets} assets - Assets
   */
  draw(context, cameraX, assets) {
    const screenX = this.x - cameraX;
    const drawY = this.groundY - this.height;

    const imageSource = this._getActiveImageSource();
    const image = assets.getImageBySource(imageSource);
    if (!image) return;

    drawSprite(
      context,
      image,
      screenX,
      drawY,
      this.width,
      this.height,
      !this.facingRight,
    );
  }

  /**
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 18,
      y: this.groundY - this.height + 12,
      width: this.width - 36,
      height: this.height - 20,
    };
  }

  /**
   * @param {number} amount - Damage amount
   * @param {import("./World.js").World} world - World reference
   */
  takeDamage(amount, world) {
    if (this.isDead) return;
    if (this.damageCooldownFrames > 0) return;

    this.health = clamp(this.health - amount, 0, 100);
    this.damageCooldownFrames = 45;

    world.assets.sounds.play("hurt");

    if (this.health <= 0) {
      this.isDead = true;
      world.requestGameOver();
    }
  }

  /**
   * Bounce upwards after stomping an enemy.
   */
  bounce() {
    this.velocityY = -10.5;
    this.isOnGround = false;
  }

  /**
   * @param {number} deltaFrames - dt units
   */
  _updateCooldowns(deltaFrames) {
    if (this.damageCooldownFrames <= 0) return;
    this.damageCooldownFrames = Math.max(
      0,
      this.damageCooldownFrames - deltaFrames,
    );
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {import("./Input.js").InputState} inputState - Input
   * @param {import("./Levels.js").LevelData} levelData - Level data
   */
  _handleHorizontalMovement(deltaFrames, inputState, levelData) {
    const moveLeft = inputState.moveLeft;
    const moveRight = inputState.moveRight;

    if (moveLeft === moveRight) return;

    const direction = moveRight ? 1 : -1;
    const nextX = this.x + direction * this.speed * deltaFrames;

    this.x = clamp(nextX, 0, levelData.worldWidth - this.width);
    this.facingRight = direction === 1;
  }

  /**
   * @param {import("./Input.js").InputState} inputState - Input
   */
  _handleJump(inputState) {
    if (!inputState.jump) return;
    if (!this.isOnGround) return;

    this.velocityY = this.jumpVelocity;
    this.isOnGround = false;
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {number} groundY - Ground line
   */
  _applyGravity(deltaFrames, groundY) {
    this.velocityY += this.gravity * deltaFrames;
    const nextY = groundY + this.velocityY;

    if (nextY >= groundY) {
      this.velocityY = 0;
      this.isOnGround = true;
      return;
    }
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {import("./Input.js").InputState} inputState - Input
   */
  _updateAnimations(deltaFrames, inputState) {
    if (!this.isOnGround) {
      this.jumpAnimation.update(deltaFrames);
      return;
    }

    if (inputState.moveLeft || inputState.moveRight) {
      this.walkAnimation.update(deltaFrames);
      return;
    }

    this.idleAnimation.update(deltaFrames);
  }

  /**
   * @returns {string}
   */
  _getActiveImageSource() {
    if (!this.isOnGround) return this.jumpAnimation.getCurrentFrameSource();
    return this.walkAnimation.getCurrentFrameSource();
  }
}

/* ---------------------------------------------------------------------------
  Enemy (two types handled via configuration)
--------------------------------------------------------------------------- */

export class Enemy {
  /**
   * @param {{x:number, groundY:number, type:"normal"|"small"}} options - Setup
   */
  constructor(options) {
    this.x = options.x;
    this.groundY = options.groundY;

    this.type = options.type;

    this.width = this.type === "small" ? 55 : 80;
    this.height = this.type === "small" ? 55 : 80;

    this.speed = this.type === "small" ? 2.2 : 1.2;

    this.facingRight = false;
    this.direction = -1;

    this.isAlive = true;
    this.markedForRemoval = false;

    this.deathTimerFrames = 0;
    this.deathLifetimeFrames = 120;

    this.walkAnimation = new FrameAnimation(
      [
        "/images/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "/images/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "/images/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
      ],
      8,
    );

    this.deadImageSource =
      "/images/3_enemies_chicken/chicken_normal/2_dead/dead.png";
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {import("./World.js").World} world - World reference
   */
  update(deltaFrames, world) {
    if (!this.isAlive) {
      this._updateDeath(deltaFrames);
      return;
    }

    this._move(deltaFrames, world.levelData);
    this.walkAnimation.update(deltaFrames);
  }

  /**
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} cameraX - Camera offset
   * @param {import("./Assets.js").Assets} assets - Assets
   */
  draw(context, cameraX, assets) {
    const screenX = this.x - cameraX;
    const drawY = this.groundY - this.height;

    const imageSource = this.isAlive
      ? this.walkAnimation.getCurrentFrameSource()
      : this.deadImageSource;

    const image = assets.getImageBySource(imageSource);
    if (!image) return;

    drawSprite(
      context,
      image,
      screenX,
      drawY,
      this.width,
      this.height,
      this.facingRight,
    );
  }

  /**
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 10,
      y: this.groundY - this.height + 8,
      width: this.width - 20,
      height: this.height - 10,
    };
  }

  /**
   * Kill enemy and start removal timer.
   * @param {import("./World.js").World} world - World reference
   */
  kill(world) {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.deathTimerFrames = 0;

    world.assets.sounds.play("enemyKill");
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {import("./Levels.js").LevelData} levelData - Level data
   */
  _move(deltaFrames, levelData) {
    const nextX = this.x + this.direction * this.speed * deltaFrames;

    if (nextX < 0) this.direction = 1;
    if (nextX > levelData.worldWidth - this.width) this.direction = -1;

    this.x = clamp(nextX, 0, levelData.worldWidth - this.width);
    this.facingRight = this.direction === 1;
  }

  /**
   * @param {number} deltaFrames - dt units
   */
  _updateDeath(deltaFrames) {
    this.deathTimerFrames += deltaFrames;

    if (this.deathTimerFrames < this.deathLifetimeFrames) return;
    this.markedForRemoval = true;
  }
}

/* ---------------------------------------------------------------------------
  Coin
--------------------------------------------------------------------------- */

export class Coin {
  /**
   * @param {{x:number, y:number}} options - Setup
   */
  constructor(options) {
    this.x = options.x;
    this.y = options.y;

    this.width = 40;
    this.height = 40;

    this.isCollected = false;
    this.imageSource = "/images/8_coin/coin_1.png";
  }

  /**
   * @param {number} deltaFrames - dt units
   * @param {import("./World.js").World} world - World reference
   */
  update(deltaFrames, world) {
    void deltaFrames;
    void world;
  }

  /**
   * @param {CanvasRenderingContext2D} context - Canvas context
   * @param {number} cameraX - Camera offset
   * @param {import("./Assets.js").Assets} assets - Assets
   */
  draw(context, cameraX, assets) {
    if (this.isCollected) return;

    const screenX = this.x - cameraX;
    const image = assets.getImageBySource(this.imageSource);
    if (!image) return;

    context.drawImage(image, screenX, this.y, this.width, this.height);
  }

  /**
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /**
   * @param {import("./World.js").World} world - World reference
   */
  collect(world) {
    if (this.isCollected) return;

    this.isCollected = true;
    world.stats.coins += 1;
    world.assets.sounds.play("coin");
  }
}

/* ---------------------------------------------------------------------------
  Shared collision exports
--------------------------------------------------------------------------- */

export { isOverlapping };
