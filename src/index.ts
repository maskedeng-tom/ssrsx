import Koa from 'koa';
import express from 'express';
import { SsrsxOptions, HttpServer } from './types';
import { ssrsx } from './core';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptionsKoa<USER_CONTEXT = unknown> extends SsrsxOptions<USER_CONTEXT> {
  context?: (ctx: Koa.Context, next: Koa.Next) => USER_CONTEXT;
}

const ssrsxKoa = <T = unknown>(ssrsxOption?: SsrsxOptionsKoa<T>) => {
  //
  const handler = ssrsx(ssrsxOption);
  //
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const server: HttpServer = {koa: {ctx, next}};
    if(await handler(server)){
      return;
    }
    return next();
  };
};

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptionsExpress<USER_CONTEXT = unknown> extends SsrsxOptions<USER_CONTEXT> {
  context?: (req: express.Request, res: express.Response, next: express.NextFunction) => USER_CONTEXT;
}

const ssrsxExpress = <T = unknown>(ssrsxOption?: SsrsxOptionsExpress<T>) => {
  //
  const handler = ssrsx(ssrsxOption);
  //
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    void (async () => {
      const server: HttpServer = {express: {req, res, next}};
      if(await handler(server)){
        return;
      }
      return next();
    })();
  };
};

////////////////////////////////////////////////////////////////////////////////

export { ssrsxKoa, ssrsxExpress };
export type { SsrsxOptionsKoa, SsrsxOptionsExpress };
