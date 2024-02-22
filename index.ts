import ssrsx from './src/';
import { SsrsxOptions, KoaProps, ExpressProps, HttpServer } from './src/types';
import { Router } from './src/router/Router';
import { Routes } from './src/router/Routes';
import { Route } from './src/router/Route';
import { Redirect } from './src/router/Redirect';
import { routerPath } from './src/router/routerPath';
import { SsrsxContext, SsrsxFunctions, getCurrentSsrsx } from './jsx/jsx-parser';
import { initializeStyles, setStyle, setScopedStyle, getStyles, styleToString } from './src/core/cssSupport';
//
export default ssrsx;
export { ssrsx };
export type { SsrsxOptions, KoaProps, ExpressProps, HttpServer };
export { Router, Routes, Route };
export { Redirect };
export { routerPath };
export type { SsrsxContext, SsrsxFunctions };
export { getCurrentSsrsx };
export { initializeStyles, setStyle, setScopedStyle, getStyles, styleToString };

////////////////////////////////////////////////////////////////////////////////
// shorthand

const getKoa = () => {
  const ssrsx = getCurrentSsrsx();
  if(!ssrsx || !ssrsx.server.koa){
    throw new Error('koa server is not running');
  }
  return ssrsx.server.koa;
};

const getExpress = () => {
  const ssrsx = getCurrentSsrsx();
  if(!ssrsx || !ssrsx.server.express){
    throw new Error('express server is not running');
  }
  return ssrsx.server.express;
};

const getServer = () => {
  const ssrsx = getCurrentSsrsx();
  if(!ssrsx || !ssrsx.server){
    throw new Error('express server is not running');
  }
  return ssrsx.server;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getParseContext = <T = any>() => {
  const ssrsx = getCurrentSsrsx<unknown, T>();
  if(!ssrsx || !ssrsx.parseContext){
    throw new Error('invalid ssrsx parse context');
  }
  return ssrsx.parseContext;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getContext = <T = any>() => {
  const ssrsx = getCurrentSsrsx<T>();
  if(!ssrsx){
    throw new Error('invalid ssrsx context');
  }
  if(!ssrsx.context){
    ssrsx.context = {} as T;
  }
  return ssrsx.context;
};

////////////////////////////////////////////////////////////////////////////////

export { getKoa, getExpress, getServer, getParseContext, getContext };
