export function drawCharacter(character, canvasContext, cameraOffsetX) {
  const animation = character.animations[character.currentAnimationKey];

  if (!animation.isReady()) return;

  const image = animation.getCurrentImage();

  const screenX = character.positionX - cameraOffsetX;
  const drawY = character.positionY - character.height;

  if (character.isHurt && !character.isDead) {
    if (Math.floor(character.hurtTimer / 3) % 2 === 0) {
      return;
    }
  }

  canvasContext.save();

  if (character.facingDirection === -1) {
    canvasContext.translate(screenX + character.width, 0);
    canvasContext.scale(-1, 1);
    canvasContext.drawImage(image, 0, drawY, character.width, character.height);
  } else {
    canvasContext.drawImage(
      image,
      screenX,
      drawY,
      character.width,
      character.height,
    );
  }

  canvasContext.restore();
}
