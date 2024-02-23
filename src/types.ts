import Koa from 'koa';
import express from 'express';
import { VirtualElement } from 'jsx/jsx-runtime';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptions<USER_CONTEXT = unknown> {
  //
  baseUrl?: string;
  //
  development?: boolean;
  workRoot?: string;
  clientRoot?: string;
  //
  requireJsRoot?: string;
  requireJsPaths?: { [key: string]: string };
  //
  cacheControlMaxAge?: number;
  //
  context?: ((server: KoaServer) => USER_CONTEXT) | ((server: ExpressServer) => USER_CONTEXT);
  app?: VirtualElement;
  // for development
  sourceMap?: boolean;
  hotReload?: number | boolean;
  hotReloadWait?: number;
}

////////////////////////////////////////////////////////////////////////////////

interface KoaServer {
  ctx: Koa.Context;
  next: Koa.Next;
}

interface ExpressServer {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
}

interface HttpServer {
  koa?: KoaServer;
  express?: ExpressServer;
}

////////////////////////////////////////////////////////////////////////////////

const isKoaServer = (server: HttpServer) => {
  return 'koa' in server;
};

const isExpressServer = (server: HttpServer) => {
  return 'express' in server;
};

////////////////////////////////////////////////////////////////////////////////

export { SsrsxOptions, KoaServer, ExpressServer, HttpServer };
export { isKoaServer, isExpressServer };