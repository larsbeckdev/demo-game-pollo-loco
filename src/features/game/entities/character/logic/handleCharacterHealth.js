export function applyDamageToCharacter(character) {
  if (character.isDead) return;
  if (character.isInvincible) return;

  character.healthPoints -= 1;

  character.isInvincible = true;
  character.invincibilityTimer = character.invincibilityDuration;

  character.isHurt = true;
  character.hurtTimer = character.hurtDuration;

  character.horizontalVelocity = 0;

  if (character.healthPoints <= 0) {
    character.isDead = true;
    character.isHurt = false;
    character.verticalVelocity = 0;
    character.horizontalVelocity = 0;
  }
}

export function updateInvincibilityTimer(character, deltaTime) {
  if (!character.isInvincible) return;

  character.invincibilityTimer -= deltaTime;

  if (character.invincibilityTimer <= 0) {
    character.invincibilityTimer = 0;
    character.isInvincible = false;
  }
}
