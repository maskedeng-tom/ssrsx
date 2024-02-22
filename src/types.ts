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
  context?: (ctx: Koa.Context) => USER_CONTEXT;
  filter?: (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => boolean;
  app?: VirtualElement;
  // for development
  sourceMap?: boolean;
  hotReload?: number | boolean;
  hotReloadWait?: number;
}

////////////////////////////////////////////////////////////////////////////////

interface KoaProps {
  ctx: Koa.Context;
  next: Koa.Next;
}

interface ExpressProps {
  req: express.Request;
  res: express.Response;
}

interface HttpServer {
  koa?: KoaProps;
  express?: ExpressProps;
}

////////////////////////////////////////////////////////////////////////////////

export { SsrsxOptions, KoaProps, ExpressProps, HttpServer };
