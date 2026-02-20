export function updateCharacterState(character, deltaTime) {
  if (character.isDead) {
    character.currentState = "dead";
    return;
  }

  if (character.isHurt) {
    character.currentState = "hurt";
    character.hurtTimer -= deltaTime;

    if (character.hurtTimer <= 0) {
      character.isHurt = false;
      character.hurtTimer = 0;
    }

    return;
  }

  if (!character.isOnGround) {
    character.idleTimer = 0;
    character.currentState = character.verticalVelocity < 0 ? "jump" : "fall";
    return;
  }

  if (Math.abs(character.horizontalVelocity) > 0.01) {
    character.idleTimer = 0;
    character.currentState = "walk";
    return;
  }

  character.idleTimer += deltaTime;

  if (character.idleTimer >= character.longIdleDelay) {
    character.currentState = "longIdle";
  } else {
    character.currentState = "idle";
  }
}
