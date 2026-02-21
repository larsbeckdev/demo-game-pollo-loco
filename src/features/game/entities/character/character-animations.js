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

  const jumpPaths = makeFramePaths(
    `${basePath}/3_jump`,
    rangeFrames("J-", 31, 39),
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
    jump: new FrameAnimation(jumpPaths, 10),
    fall: new FrameAnimation(jumpPaths, 10),
    hurt: new FrameAnimation(hurtPaths, 12),
    dead: new FrameAnimation(deadPaths, 10),
  };
}
