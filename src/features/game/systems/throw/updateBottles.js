export default function updateBottles(world, dt) {
  for (const bottle of world.bottles) {
    bottle.update(dt);
  }

  // cleanup dead bottles
  world.bottles = world.bottles.filter((b) => b.alive);
}
