import path from "node:path";

export const isPathInside = (parentPath, targetPath) => {
  const relativePath = path.relative(parentPath, targetPath);

  return relativePath && !relativePath.startsWith("..")
    ? true
    : relativePath === "";
};
