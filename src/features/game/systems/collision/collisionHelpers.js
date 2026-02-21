// src/features/game/systems/collision/collisionHelpers.js

export function aabb(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// “von oben” = Player bottom ist über enemy-top (+tolerance) und Player bewegt sich nach unten
export function isStomp(playerBounds, enemyBounds, playerVy, tolerance = 12) {
  const playerBottom = playerBounds.y + playerBounds.h;
  const enemyTop = enemyBounds.y;

  const comingFromAbove = playerBottom <= enemyTop + tolerance;
  const falling = playerVy > 0;

  return comingFromAbove && falling;
}
