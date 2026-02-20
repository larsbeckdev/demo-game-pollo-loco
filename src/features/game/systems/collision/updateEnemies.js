export default function updateEnemies(world, dt) {
  for (const enemy of world.enemies) {
    enemy.update(dt);
  }
}
