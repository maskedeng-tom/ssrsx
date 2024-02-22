import PathToRegExp,  { pathToRegexp, compile } from 'path-to-regexp';
import { joinPath } from './joinPath';

////////////////////////////////////////////////////////////////////////////////

const createParams = (keys: PathToRegExp.Key[], match: RegExpExecArray) => {
  const params: {[key: string]: string} = {};
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    if(key.name === 0){
      continue;
    }
    const value = match[i + 1];
    params[key.name] = value;
  }
  return params;
};

////////////////////////////////////////////////////////////////////////////////

const matchPath = (matchPath: string, url: string, option: {sensitive?: boolean}) => {

  // match
  const keys: PathToRegExp.Key[] = [];
  const regexp = pathToRegexp(matchPath, keys, {...option});
  const match = regexp.exec(url);
  if(match){
    const toPath = compile(matchPath, { encode: encodeURIComponent });
    const targetPath = toPath(createParams(keys, match));
    if(targetPath !== url){
      return { subMatch: true, offsetPath: targetPath, params: createParams(keys, match) };
    }
    return  { match: true, params: createParams(keys, match)};
  }

  // sub match
  const subKeys: PathToRegExp.Key[] = [];
  const subRegexp = pathToRegexp(joinPath(matchPath, '(.*)'), subKeys, {...option});
  const subMatch = subRegexp.exec(url);
  if(!subMatch){
    return {params: {}};
  }
  const toPath = compile(matchPath, { encode: encodeURIComponent });
  const offsetPath = toPath(createParams(subKeys, subMatch));
  return { subMatch: true, offsetPath: offsetPath, params: createParams(subKeys, subMatch) };
};

////////////////////////////////////////////////////////////////////////////////

export { matchPath };