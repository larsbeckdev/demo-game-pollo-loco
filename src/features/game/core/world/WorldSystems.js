import MovementSystem from "@/features/game/systems/movement/MovementSystem.js";
import ThrowSystem from "@/features/game/systems/ThrowSystem.js";
import CollisionSystem from "@/features/game/systems/collision/CollisionSystem.js";

export function createWorldSystems(world) {
  return [
    new MovementSystem(world),
    new ThrowSystem(world),
    new CollisionSystem(world),
  ];
}
