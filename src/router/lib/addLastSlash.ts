const addLastSlash = (path: string) => {
  return path.slice(-1) === '/' ? path : `${path}/`;
};

export { addLastSlash };