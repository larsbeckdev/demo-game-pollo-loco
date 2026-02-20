export function createFramePaths(basePath, fileNames) {
  return fileNames.map((name) => `${basePath}/${name}`);
}

export function createNumberedFrameNames(prefix, startNumber, endNumber) {
  const names = [];

  for (let index = startNumber; index <= endNumber; index++) {
    names.push(`${prefix}${index}.png`);
  }

  return names;
}
