import { getKoa } from '../../index';
import { getParseContext } from '../../index';
import { SsrsxFunctions } from '../../jsx/jsx-parser';
import { RouterContext } from './Router';
import { joinPath } from './lib/joinPath';
import { matchPath } from './lib/matchPath';
import { VirtualChildren } from 'jsx/jsx-runtime';
import { removeFirstSlash } from './lib/addSlash';

////////////////////////////////////////////////////////////////////////////////

const Route = ({
  path, sensitive, children, _ssrsxFunctions
}:{
  path: string,
  sensitive?: boolean,
  children?: VirtualChildren,
  _ssrsxFunctions?: SsrsxFunctions
}) => {
  const parseContext = getParseContext<RouterContext>();
  const koa = getKoa();

  // resolved
  if(parseContext.routes?.resolved){
    return <></>;
  }

  // all
  if(path === '*'){
    if(parseContext.routes){
      parseContext.routes.resolved = true;
    }
    return <>{children}</>;
  }

  // get url
  const url = koa.ctx.URL.pathname || '';// TODO express

  // base path
  const base = parseContext.matched;

  // test match
  const match = matchPath(removeFirstSlash(path), url.slice(base.length), {sensitive: sensitive ?? false});
  if(!match.match && !match.subMatch){
    return <></>;
  }

  // update matched
  if(match.match){
    parseContext.matched = url;
    if(parseContext.routes){
      parseContext.routes.resolved = true;
    }
  }else if(match.subMatch){
    parseContext.matched = joinPath(base, match.offsetPath ?? '', '/');
  }

  // output
  const result = <>{children}</>;
  if(_ssrsxFunctions){
    _ssrsxFunctions.finalize = () => {
      parseContext.matched = base;
      if(!parseContext.routes?.resolved){
        return <></>;
      }
    };
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////

export default Route;
export { Route };