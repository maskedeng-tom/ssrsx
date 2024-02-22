import { addLastSlash, removeFirstSlash } from './addSlash';

////////////////////////////////////////////////////////////////////////////////

const joinPath = (...paths: string[]) => {
  return paths.map((path, i) => {
    if(i === 0){
      return addLastSlash(path);
    }
    if(i === paths.length - 1){
      return removeFirstSlash(path);
    }else{
      return removeFirstSlash(addLastSlash(path));
    }
  }).join('');
};

////////////////////////////////////////////////////////////////////////////////

export { joinPath };