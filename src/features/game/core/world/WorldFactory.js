import Character from "@/features/game/entities/Character.js";
import Enemy from "@/features/game/entities/Enemy.js";

export function createWorldState({ canvas, level }) {
  const groundY = canvas.height - (level.groundOffset ?? 40);

  const character = new Character({ groundY });

  const enemies = [new Enemy({ x: 600, groundY, scale: 0.5 })];

  return {
    groundY,
    worldWidth: level.worldWidth ?? 4000,

    character,
    enemies,
    collectables: [],
    bottles: [],
  };
}
