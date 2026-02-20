export default function updateCameraFollow(world) {
  const { camera, character, canvas, worldWidth } = world;

  // Follow offset (camera target is a bit left of player center)
  const followOffset = 200;
  const targetX = character.x - followOffset;

  // Clamp camera to world bounds
  const maxCamX = Math.max(0, worldWidth - canvas.width);
  camera.x = Math.min(Math.max(0, targetX), maxCamX);
}
