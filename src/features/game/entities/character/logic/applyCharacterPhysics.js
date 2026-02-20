export function applyCharacterPhysics(character, deltaTime) {
  character.positionX += character.horizontalVelocity * deltaTime;

  character.verticalVelocity += character.gravityForce * deltaTime;
  character.positionY += character.verticalVelocity * deltaTime;

  if (character.positionY >= character.groundLevel) {
    character.positionY = character.groundLevel;
    character.verticalVelocity = 0;
    character.isOnGround = true;
  } else {
    character.isOnGround = false;
  }
}
