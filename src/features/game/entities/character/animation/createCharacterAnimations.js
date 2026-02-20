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

  // Jump phases
  const jumpPrepPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 31, 33),
  );

  const jumpRisePaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 34, 34),
  );

  const jumpPeakPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 35, 36),
  );

  const jumpFallPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 37, 37),
  );

  const jumpLandPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 38, 38),
  );

  const jumpStandPaths = createFramePaths(
    `${basePath}/3_jump`,
    createNumberedFrameNames("J-", 39, 39),
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

    // NEW jump parts
    jumpPrep: new FrameAnimation(jumpPrepPaths, 14),
    jumpRise: new FrameAnimation(jumpRisePaths, 10),
    jumpPeak: new FrameAnimation(jumpPeakPaths, 10),
    jumpFall: new FrameAnimation(jumpFallPaths, 10),
    jumpLand: new FrameAnimation(jumpLandPaths, 10),
    jumpStand: new FrameAnimation(jumpStandPaths, 10),

    hurt: new FrameAnimation(hurtPaths, 12),
    dead: new FrameAnimation(deadPaths, 10),
  };
}
