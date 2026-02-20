export function handleCharacterInput(character, keyboard) {
  if (character.isDead) return;
  if (character.isHurt) return;

  character.horizontalVelocity = 0;

  if (keyboard?.LEFT) {
    character.horizontalVelocity = -character.moveSpeed;
    character.facingDirection = -1;
  }

  if (keyboard?.RIGHT) {
    character.horizontalVelocity = character.moveSpeed;
    character.facingDirection = 1;
  }

  if (keyboard?.JUMP) {
    attemptJump(character);
  }
}

function attemptJump(character) {
  if (!character.isOnGround) return;

  character.isOnGround = false;
  character.verticalVelocity = -character.jumpStrength;
}
