import { createCharacterAnimations } from "./animation/createCharacterAnimations.js";
import { handleCharacterInput } from "./logic/handleCharacterInput.js";
import { applyCharacterPhysics } from "./logic/applyCharacterPhysics.js";
import { updateCharacterState } from "./logic/updateCharacterState.js";
import {
  applyDamageToCharacter,
  updateInvincibilityTimer,
} from "./logic/handleCharacterHealth.js";
import { drawCharacter } from "./rendering/drawCharacter.js";

import { applyLegacyCharacterInterface } from "./compatibility/characterLegacyAdapter.js";

export default class Character {
  constructor({
    initialX = 80,
    groundLevel = 400,
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
}

applyLegacyCharacterInterface(Character);
