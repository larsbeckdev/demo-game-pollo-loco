/* ============================================================================
  Character Animations
  - Builds all animation instances for the player
============================================================================ */

import FrameAnimation from "@/features/game/utils/animation/frame-animation.js";
import {
  buildFramePaths,
  buildFrameFileNames,
} from "@/features/game/utils/animation/frame-path-builder.js";

export function createCharacterAnimations() {
  const basePath = "/images/2_character_pepe";

  const idlePaths = buildFramePaths(
    `${basePath}/1_idle/idle`,
    buildFrameFileNames("I-", 1, 10),
  );

  const longIdlePaths = buildFramePaths(
    `${basePath}/1_idle/long_idle`,
    buildFrameFileNames("I-", 11, 20),
  );

  const walkPaths = buildFramePaths(
    `${basePath}/2_walk`,
    buildFrameFileNames("W-", 21, 26),
  );

  const jumpPaths = buildFramePaths(
    `${basePath}/3_jump`,
    buildFrameFileNames("J-", 31, 39),
  );

  const hurtPaths = buildFramePaths(
    `${basePath}/4_hurt`,
    buildFrameFileNames("H-", 41, 43),
  );

  const deadPaths = buildFramePaths(
    `${basePath}/5_dead`,
    buildFrameFileNames("D-", 51, 57),
  );

  return {
    idle: new FrameAnimation(idlePaths, 10),
    longIdle: new FrameAnimation(longIdlePaths, 8),
    walk: new FrameAnimation(walkPaths, 14),
    jump: new FrameAnimation(jumpPaths, 10),
    fall: new FrameAnimation(jumpPaths, 10),
    hurt: new FrameAnimation(hurtPaths, 12),
    dead: new FrameAnimation(deadPaths, 10),
  };
}
