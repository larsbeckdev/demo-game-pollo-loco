import FrameAnimation from "@/features/game/utils/animation/frame-animation.js";
import {
  makeFramePaths,
  rangeFrames,
} from "@/features/game/utils/animation/frame-paths.js";

export function createCharacterAnimations() {
  const DEBUG = false; // <- hier ausschalten wenn fertig
  const DEEP = false;

  const basePath = "/images/2_character_pepe";

  if (DEBUG) {
    console.log(
      "%c[CharacterAnimations] INIT",
      "color:cyan;font-weight:bold;",
      { basePath },
    );
  }

  const build = (key, paths, fps, options = {}) => {
    if (DEBUG) {
      console.log(`[Anim Build] ${key}`, {
        frames: paths.length,
        fps,
        loop: options?.loop ?? true,
        sample: paths[0],
      });

      if (!paths.length) {
        console.warn(`[Anim Warning] ${key} has 0 frames`);
      }

      if (DEEP) {
        console.log(`[Anim Paths] ${key}`, paths);
      }
    }

    return new FrameAnimation(paths, fps, options);
  };

  const idlePaths = makeFramePaths(
    `${basePath}/1_idle/idle`,
    rangeFrames("I-", 1, 10),
  );

  const longIdlePaths = makeFramePaths(
    `${basePath}/1_idle/long_idle`,
    rangeFrames("I-", 11, 20),
  );

  const walkPaths = makeFramePaths(
    `${basePath}/2_walk`,
    rangeFrames("W-", 21, 26),
  );

  // ===== JUMP PHASES =====

  const jumpStartPaths = makeFramePaths(
    `${basePath}/3_jump`,
    rangeFrames("J-", 31, 33),
  );

  const jumpUpPaths = makeFramePaths(`${basePath}/3_jump`, ["J-34.png"]);

  const jumpApexPaths = makeFramePaths(
    `${basePath}/3_jump`,
    rangeFrames("J-", 35, 36),
  );

  const jumpFallPaths = makeFramePaths(`${basePath}/3_jump`, ["J-37.png"]);

  const jumpLandPaths = makeFramePaths(
    `${basePath}/3_jump`,
    rangeFrames("J-", 38, 39),
  );

  const hurtPaths = makeFramePaths(
    `${basePath}/4_hurt`,
    rangeFrames("H-", 41, 43),
  );

  const deadPaths = makeFramePaths(
    `${basePath}/5_dead`,
    rangeFrames("D-", 51, 57),
  );

  const animations = {
    idle: build("idle", idlePaths, 10),
    long_idle: build("long_idle", longIdlePaths, 8),
    walk: build("walk", walkPaths, 14),

    jump_start: build("jump_start", jumpStartPaths, 14, { loop: false }),
    jump_up: build("jump_up", jumpUpPaths, 1, { loop: false }),
    jump_apex: build("jump_apex", jumpApexPaths, 8, { loop: true }),
    jump_fall: build("jump_fall", jumpFallPaths, 1, { loop: false }),
    jump_land: build("jump_land", jumpLandPaths, 14, { loop: false }),

    hurt: build("hurt", hurtPaths, 12),
    dead: build("dead", deadPaths, 10, { loop: false }),
  };

  if (DEBUG) {
    console.log(
      "%c[CharacterAnimations] READY",
      "color:lime;font-weight:bold;",
      Object.keys(animations),
    );
  }

  return animations;
}
