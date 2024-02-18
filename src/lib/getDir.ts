import path from 'path';

const getDir = (root: string | undefined, defRoot: string) => {
  if(root && root.slice(0, 1) === '/'){
    return root;
  }
  return path.join(__dirname, root ?? defRoot);
};

export { getDir };
