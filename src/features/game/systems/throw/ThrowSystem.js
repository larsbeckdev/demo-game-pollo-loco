import Bottle from "@/features/game/entities/bottle/Bottle.js";

class ThrowInputSystem {
  constructor(world) {
    this.world = world;
    this.wasDown = false;
  }
  justPressed() {
    const down = !!this.world.keyboard.THROW;
    const jp = down && !this.wasDown;
    this.wasDown = down;
    return jp;
  }
}

class BottleSpawnSystem {
  constructor(world) {
    this.world = world;
  }
  spawn() {
    const world = this.world;
    const c = world.character;

    const spawnX = c.x + (c.facing === 1 ? 60 : -10);
    const spawnY = c.y - c.h * 0.6;

    const bottle = new Bottle({
      x: spawnX,
      y: spawnY,
      direction: c.facing,
      groundY: world.groundY,
      worldWidth: world.worldWidth,
      onBreak: () => world.sound?.play?.("bottleBreak"),
    });

    world.bottles.push(bottle);
  }
}

class BottleUpdateSystem {
  constructor(world) {
    this.world = world;
  }
  update(dt) {
    const world = this.world;
    for (const b of world.bottles) b.update(dt);
    world.bottles = world.bottles.filter((b) => b.alive);
  }
}

export default class ThrowSystem {
  constructor(world) {
    this.world = world;
    this.input = new ThrowInputSystem(world);
    this.spawnSystem = new BottleSpawnSystem(world);
    this.updateSystem = new BottleUpdateSystem(world);

    this.update = (dt) => {
      if (this.input.justPressed()) {
        const stats = this.world.stats;
        const c = this.world.character;
        const cost = 4;

        if (!stats || !c) {
          this.updateSystem.update(dt);
          return;
        }

        // ✅ OPTIONAL POLISH:
        // first press in long_idle only wakes the player, no throw yet
        if (typeof c.wakeUpFromLongIdle === "function") {
          const wokeUp = c.wakeUpFromLongIdle();
          if (typeof c.wakeUpFromLongIdle === "function") {
            c.wakeUpFromLongIdle(); // nicht returnen!
          }
        }

        // ✅ Hard block while long_idle (fallback if you skip wakeUpFromLongIdle)
        if (typeof c.canThrowBottle === "function" && !c.canThrowBottle()) {
          this.updateSystem.update(dt);
          return;
        }

        if ((stats.bottles ?? 0) < cost) {
          this.updateSystem.update(dt);
          return;
        }

        stats.useBottle?.(cost);
        this.spawnSystem.spawn();
      }

      this.updateSystem.update(dt);
    };
  }
}
