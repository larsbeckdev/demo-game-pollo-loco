import Bottle from "@/features/game/entities/Bottle.js";

export default function spawnBottle(world) {
  const c = world.character;

  world.bottles.push(
    new Bottle({
      x: c.x + (c.facing === 1 ? 60 : -10),
      y: c.y - c.h * 0.6,
      direction: c.facing,
      groundY: world.groundY,
      worldWidth: world.worldWidth,
    }),
  );
}
