import { SsrsxContext, SsrsxFunctions } from '../../jsx/jsx-parser';
import { ExpressProps, KoaProps } from '../';
import { RouterContext } from './Router';
import { joinPath } from './lib/joinPath';
import { matchPath } from './lib/matchPath';

////////////////////////////////////////////////////////////////////////////////

const Route = ({
  path, strict, sensitive, children, ssrsx, koa, express, _ssrsxFunctions
}:{
  path: string,
  children?: JSX.Children,
  strict? : boolean,
  sensitive?: boolean,
  ssrsx?: SsrsxContext<unknown, RouterContext>,
  koa?: KoaProps,
  express?: ExpressProps,
  _ssrsxFunctions?: SsrsxFunctions
}) => {
  if(!ssrsx?.parseContext){
    throw new Error('ssrsx.parseContext is not defined');
  }

  // resolved
  if(ssrsx.parseContext.routes?.resolved){
    return <></>;
  }

  // all
  if(path === '*'){
    if(ssrsx.parseContext.routes){
      ssrsx.parseContext.routes.resolved = true;
    }
    return <>{children}</>;
  }

  // get url
  const url = koa?.ctx.URL.pathname || express?.req.url || '';  // TODO express

  // base path
  const base = ssrsx.parseContext.matched;

  // test match
  const match = matchPath(path, url.slice(base.length), {strict: strict ?? false, sensitive: sensitive ?? false});
  if(!match.match && !match.subMatch){
    return <></>;
  }

  // update matched
  if(match.match){
    ssrsx.parseContext.matched = url;
    if(ssrsx.parseContext.routes){
      ssrsx.parseContext.routes.resolved = true;
    }
  }else if(match.subMatch){
    ssrsx.parseContext.matched = joinPath(base, match.offsetPath ?? '', '/');
  }

  // output
  const result = <>{children}</>;
  if(_ssrsxFunctions){
    _ssrsxFunctions.finalize = () => {
      ssrsx.parseContext.matched = base;
      if(!ssrsx.parseContext.routes?.resolved){
        return <></>;
      }
    };
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////

export default Route;
export { Route };