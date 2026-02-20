// Keeps draw order in one place
export function drawWorld(world, ctx) {
  const camX = world.camera.x;

  world.character.draw(ctx, camX);

  for (const e of world.enemies) e.draw(ctx, camX);
  for (const b of world.bottles) b.draw(ctx, camX);
}
