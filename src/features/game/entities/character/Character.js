import { createCharacterAnimations } from "./animation/createCharacterAnimations.js";
import { handleCharacterInput } from "./logic/handleCharacterInput.js";
import { applyCharacterPhysics } from "./logic/applyCharacterPhysics.js";
import { updateCharacterState } from "./logic/updateCharacterState.js";
import {
  applyDamageToCharacter,
  updateInvincibilityTimer,
} from "./logic/handleCharacterHealth.js";
import { drawCharacter } from "./rendering/drawCharacter.js";

export default class Character {
  constructor({
    initialX = 120,
    groundLevel = 380,
    width = 90,
    height = 140,
  } = {}) {
    this.positionX = initialX;
    this.positionY = groundLevel;
    this.groundLevel = groundLevel;

    this.width = width;
    this.height = height;

    this.horizontalVelocity = 0;
    this.verticalVelocity = 0;

    this.moveSpeed = 4.8;
    this.jumpStrength = 14;
    this.gravityForce = 0.9;

    this.facingDirection = 1;
    this.isOnGround = true;

    this.maxHealthPoints = 3;
    this.healthPoints = 3;

    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 60;

    this.isDead = false;
    this.isHurt = false;

    this.hurtTimer = 0;
    this.hurtDuration = 24;

    this.currentState = "idle";
    this.idleTimer = 0;
    this.longIdleDelay = 180;

    this.animations = createCharacterAnimations();
    this.currentAnimationKey = "idle";
  }

  getBounds() {
    return {
      x: this.positionX,
      y: this.positionY - this.height,
      w: this.width,
      h: this.height,
    };
  }

  handleInput(keyboard) {
    handleCharacterInput(this, keyboard);
  }

  update(deltaTime = 1) {
    applyCharacterPhysics(this, deltaTime);
    updateCharacterState(this, deltaTime);

    this.currentAnimationKey = this.currentState;
    this.animations[this.currentAnimationKey].update(deltaTime);

    updateInvincibilityTimer(this, deltaTime);
  }

  takeDamage() {
    applyDamageToCharacter(this);
  }

  draw(canvasContext, cameraOffsetX = 0) {
    drawCharacter(this, canvasContext, cameraOffsetX);
  }

  // ------------------------------------------------------------
  // Compatibility layer: keep old property names working
  // so existing World/Systems code still draws and moves correctly
  // ------------------------------------------------------------

  get x() {
    return this.positionX;
  }
  set x(value) {
    this.positionX = value;
  }

  get y() {
    return this.positionY;
  }
  set y(value) {
    this.positionY = value;
  }

  get w() {
    return this.width;
  }
  set w(value) {
    this.width = value;
  }

  get h() {
    return this.height;
  }
  set h(value) {
    this.height = value;
  }

  get vx() {
    return this.horizontalVelocity;
  }
  set vx(value) {
    this.horizontalVelocity = value;
  }

  get vy() {
    return this.verticalVelocity;
  }
  set vy(value) {
    this.verticalVelocity = value;
  }

  get facing() {
    return this.facingDirection;
  }
  set facing(value) {
    this.facingDirection = value;
  }

  get onGround() {
    return this.isOnGround;
  }
  set onGround(value) {
    this.isOnGround = value;
  }

  get dead() {
    return this.isDead;
  }
  set dead(value) {
    this.isDead = value;
  }

  get hurtActive() {
    return this.isHurt;
  }
  set hurtActive(value) {
    this.isHurt = value;
  }

  get anims() {
    return this.animations;
  }
  set anims(value) {
    this.animations = value;
  }

  get currentAnimKey() {
    return this.currentAnimationKey;
  }
  set currentAnimKey(value) {
    this.currentAnimationKey = value;
  }

  get groundY() {
    return this.groundLevel;
  }
  set groundY(value) {
    this.groundLevel = value;
  }
}
