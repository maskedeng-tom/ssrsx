////////////////////////////////////////////////////////////////////////////////

const addLastSlash = (path: string) => {
  return path.slice(-1) === '/' ? path : `${path}/`;
};

const addFirstSlash = (path: string) => {
  return path.slice(0, 1) === '/' ? path : `/${path}`;
};

const removeFirstSlash = (path: string) => {
  return path.slice(0, 1) === '/' ? path.slice(1) : path;
};

const removeLastSlash = (path: string) => {
  return path.slice(-1) === '/' ? path.slice(0, -1) : path;
};

////////////////////////////////////////////////////////////////////////////////

export { addLastSlash, addFirstSlash, removeFirstSlash, removeLastSlash };