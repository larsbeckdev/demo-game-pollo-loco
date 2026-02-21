/* ============================================================================
  Frame Path Builder
  - Creates file names and full paths for animation frames
============================================================================ */

export function buildFrameFileNames(prefix, startNumber, endNumber) {
  const fileNames = [];

  for (let number = startNumber; number <= endNumber; number++) {
    fileNames.push(`${prefix}${number}.png`);
  }

  return fileNames;
}

export function buildFramePaths(basePath, fileNames) {
  return fileNames.map((fileName) => `${basePath}/${fileName}`);
}
