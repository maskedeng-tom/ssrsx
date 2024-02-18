import fs from 'fs';

const readdirSyncRecursively = (dir: string, files: string[] = []) => {
  const paths = fs.readdirSync(dir);
  const dirs = [];
  for (const path of paths) {
    const stats = fs.statSync(`${dir}/${path}`);
    if (stats.isDirectory()) {
      dirs.push(`${dir}/${path}`);
    } else {
      files.push(`${dir}/${path}`);
    }
  }
  for (const d of dirs) {
    files = readdirSyncRecursively(d, files);
  }
  return files;
};

export { readdirSyncRecursively };