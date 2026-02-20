import FrameAnimation from "./FrameAnimation.js";
import {
  createFramePaths,
  createNumberedFrameNames,
} from "./framePathHelpers.js";

export function createCharacterAnimations() {
  const basePath = "/images/2_character_pepe";

  const idlePaths = createFramePaths(
    `${basePath}/1_idle/idle`,
    createNumberedFrameNames("I-", 1, 10),
  );

  const longIdlePaths = createFramePaths(
    `${basePath}/1_idle/long_idle`,
    createNumberedFrameNames("I-", 11, 20),
  );

  const walkPaths = createFramePaths(
    `${basePath}/2_walk`,
    createNumberedFrameNames("W-", 21, 26),
  );

  const jumpPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 31, 39),
  );

  const hurtPaths = createFramePaths(
    `${basePath}/4_hurt`,
    createNumberedFrameNames("H-", 41, 43),
  );

  const deadPaths = createFramePaths(
    `${basePath}/5_dead`,
    createNumberedFrameNames("D-", 51, 57),
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
