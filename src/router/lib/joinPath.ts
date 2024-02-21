import { addLastSlash } from './addLastSlash';

const joinPath = (...paths: string[]) => {
  return paths.map((path, i) => {
    if(i === 0){
      return addLastSlash(path);
    }
    const append = path.slice(0, 1) === '/' ? path.slice(1) : path;
    if(i === paths.length - 1){
      return append;
    }else{
      return addLastSlash(append);
    }
  }).join('');
};

export { joinPath };