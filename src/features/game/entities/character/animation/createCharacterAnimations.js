import FrameAnimation from "./FrameAnimation.js";
import {
  createFramePaths,
  createNumberedFrameNames,
} from "./framePathHelpers.js";

export function createCharacterAnimations() {
  const basePath = "/images/2_character_pepe";

  const jumpFolder = `${basePath}/3_jump`;

  const jumpCrouchPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 31, 33),
  );

  const jumpUpPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 34, 34),
  );

  const jumpPeakPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 35, 36),
  );

  const jumpFallPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 37, 37),
  );

  const jumpLandPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 38, 38),
  );

  const jumpStandPaths = createFramePaths(
    jumpFolder,
    createNumberedFrameNames("J-", 39, 39),
  );

  return {
    // ...deine anderen Animations (idle, walk, hurt, dead)

    jumpCrouch: new FrameAnimation(jumpCrouchPaths, 12, {
      shouldLoop: false,
      shouldHoldLastFrame: true,
    }),

    jumpUp: new FrameAnimation(jumpUpPaths, 12, {
      shouldLoop: false,
      shouldHoldLastFrame: true,
    }),

    jumpPeak: new FrameAnimation(jumpPeakPaths, 10, {
      shouldLoop: true,
      shouldHoldLastFrame: false,
    }),

    jumpFall: new FrameAnimation(jumpFallPaths, 12, {
      shouldLoop: false,
      shouldHoldLastFrame: true,
    }),

    jumpLand: new FrameAnimation(jumpLandPaths, 12, {
      shouldLoop: false,
      shouldHoldLastFrame: true,
    }),

    jumpStand: new FrameAnimation(jumpStandPaths, 12, {
      shouldLoop: false,
      shouldHoldLastFrame: true,
    }),
  };
}
