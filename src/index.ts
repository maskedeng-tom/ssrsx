import Koa from 'koa';
import express from 'express';
import { SsrsxOptions, HttpServer } from './types';
import { ssrsx } from './core';

////////////////////////////////////////////////////////////////////////////////

const ssrsxKoa = (ssrsxOption?: SsrsxOptions) => {
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

const ssrsxExpress = (ssrsxOption?: SsrsxOptions) => {
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
