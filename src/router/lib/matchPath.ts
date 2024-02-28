import { logError } from '../../lib/log';
import PathToRegExp,  { pathToRegexp, compile } from 'path-to-regexp';
import { joinPath } from './joinPath';

////////////////////////////////////////////////////////////////////////////////

const createParams = (keys: PathToRegExp.Key[], match: RegExpExecArray) => {
  const params: {[key: string]: string} = {};
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    params[key.name] = match[i + 1];
  }
  return params;
};

////////////////////////////////////////////////////////////////////////////////

const matchPath = (matchPath: string, url: string, option: {sensitive?: boolean}) => {
  try{
    // match
    const keys: PathToRegExp.Key[] = [];
    const regexp = pathToRegexp(matchPath, keys, {...option});
    const match = regexp.exec(url);
    if(match){
      const toPath = compile(matchPath, { encode: encodeURIComponent });
      const params = createParams(keys, match);
      const targetPath = toPath(params);
      if(targetPath !== url){
        return { subMatch: true, offsetPath: targetPath, params: params };
      }
      return  { match: true, params: params};
    }

    // sub match
    const subKeys: PathToRegExp.Key[] = [];
    const subRegexp = pathToRegexp(joinPath(matchPath, '(.*)'), subKeys, {...option});
    const subMatch = subRegexp.exec(url);
    if(!subMatch){
      return {params: {}};
    }
    const params = createParams(subKeys, subMatch);
    const toPath = compile(matchPath, { encode: encodeURIComponent });
    const offsetPath = toPath(params);
    return { subMatch: true, offsetPath: offsetPath, params: params };
    //
  }catch(e){
    logError('matchPath error:', e);
    return {params: {}};
  }
};

////////////////////////////////////////////////////////////////////////////////

export { matchPath };