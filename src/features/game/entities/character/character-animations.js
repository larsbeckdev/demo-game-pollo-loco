/* ============================================================================
  Character Animations
  - Builds animation instances for the player character
============================================================================ */

import FrameAnimation from "@/features/game/utils/animation/frame-animation.js";
import {
  makeFramePaths,
  rangeFrames,
} from "@/features/game/utils/animation/frame-paths.js";

export function createCharacterAnimations() {
  const basePath = "/images/2_character_pepe";

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

  return {
    idle: new FrameAnimation(idlePaths, 10),
    long_idle: new FrameAnimation(longIdlePaths, 8),
    walk: new FrameAnimation(walkPaths, 14),

    // Jump states
    jump_start: new FrameAnimation(jumpStartPaths, 14, { loop: false }),
    jump_up: new FrameAnimation(jumpUpPaths, 1, { loop: false }),
    jump_apex: new FrameAnimation(jumpApexPaths, 8, { loop: true }),
    jump_fall: new FrameAnimation(jumpFallPaths, 1, { loop: false }),
    jump_land: new FrameAnimation(jumpLandPaths, 14, { loop: false }),

    hurt: new FrameAnimation(hurtPaths, 12),
    dead: new FrameAnimation(deadPaths, 10, { loop: false }),
  };
}
