/* ============================================================================
  Frame Path Helpers
  - Build animation frame file names and full paths
============================================================================ */

export function makeFramePaths(basePath, fileNames) {
  return fileNames.map((fileName) => `${basePath}/${fileName}`);
}

export function rangeFrames(prefix, fromNumber, toNumber) {
  const result = [];

  for (let index = fromNumber; index <= toNumber; index++) {
    result.push(`${prefix}${index}.png`);
  }

  return result;
}
