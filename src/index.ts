import Koa from 'koa';
import express from 'express';
//
import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import fs from 'fs';
import path from 'path';
import { Server } from 'ws';
import { initializeParse, events } from './core/eventSupport';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { createCompiler } from './core/compiler';
import { errorConsole } from './lib/errorConsole';
import { initializeStyles, getStyles } from './core/cssSupport';
import { parse } from '../jsx/jsx-parser';
import { VirtualElement } from 'jsx/jsx-runtime';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptions<USER_CONTEXT = unknown> {
  development?: boolean;
  workRoot?: string;
  //serverRoot?: string;
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

const HotReloadDefault = 33730;

////////////////////////////////////////////////////////////////////////////////

interface TscOption {
  target: string,
  module: string,
  inlineSourceMap: boolean,
  outDir: string,
  removeComments: boolean,
  esModuleInterop: boolean,
  forceConsistentCasingInFileNames: boolean,
  strict: boolean,
  skipLibCheck: boolean;
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

////////////////////////////////////////////////////////////////////////////////

const ssrsx = (ssrsxOption?: SsrsxOptions) => {

  const option = ssrsxOption ?? {};
  if(option?.development){
    option.hotReload = option.hotReload ?? true;
    option.sourceMap = option.sourceMap ?? true;
  }

  log('-----------------------------------------------');
  log('Start ssrsx: option =', option);
  log('-----------------------------------------------');

  //////////////////////////////////////////////////////////////////////////////

  const bust = (new Date()).getTime();
  const ssrsxBaseUrl = '/ssrsx-client-script/';
  const requireJs = `event-loader-${bust}.js`;

  //////////////////////////////////////////////////////////////////////////////

  const workRoot = getDir(option?.workRoot, './.ssrsx');
  const requireJsRoot = getDir(option?.requireJsRoot, './src/requireJs');
  //const serverRoot = getDir(option?.serverRoot, './src/server');
  const clientRoot = getDir(option?.clientRoot, './src/client');
  const clientOffset = clientRoot.replace(process.cwd(), '');
  log('workRoot:', workRoot);
  log('requireJsRoot:', requireJsRoot);
  //log('serverRoot:', serverRoot);
  log('clientRoot:', clientRoot);
  log('clientOffset:', clientOffset);
  log('-----------------------------------------------');

  //////////////////////////////////////////////////////////////////////////////
  // for hot reload

  if(option?.hotReload){
    const port = (typeof option.hotReload === 'boolean')? HotReloadDefault: option.hotReload;
    log('Hot reload start:', port);
    new Server({ port });
  }

  //////////////////////////////////////////////////////////////////////////////
  // source map handler

  const sourceMapHandler = (ctx: Koa.Context): boolean => {
    const url = ctx.URL.pathname;

    if(!option?.sourceMap){
      return false;
    }
    if(url.slice(-3) === '.js' || url.indexOf(clientOffset) < 0){
      return false;
    }
    const targetMapPath = path.join(clientRoot.slice(0, -clientOffset.length), url);
    if(!fs.existsSync(targetMapPath)){
      return false;
    }

    ctx.status = 200;
    ctx.body = fs.readFileSync(targetMapPath).toString();
    log(ctx.method, ctx.status, ctx.url, targetMapPath);
    return true;
  };

  //////////////////////////////////////////////////////////////////////////////

  const compiler = createCompiler();

  const ssrsxHandler = async (ctx: Koa.Context): Promise<boolean> => {

    const tscOptions: TscOption = {
      target: 'ES6',
      module: 'umd',
      inlineSourceMap: option?.sourceMap ?? false,
      outDir: workRoot,
      removeComments: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true
    };

    // compile
    await compiler.compile(clientRoot, workRoot, tscOptions);

    // target pathname
    const url = ctx.URL.pathname;

    // source map request
    if(sourceMapHandler(ctx)){
      return false;
    }

    // ssrsx
    if(url.indexOf(ssrsxBaseUrl) < 0){
      return false;
    }
    const targetUrl = url.replace(ssrsxBaseUrl, '');

    // cache
    ctx.status = 200;
    ctx.set('ETag', ctx.url);
    ctx.set('Cache-Control', `max-age=${option?.cacheControlMaxAge ?? 60 * 60 * 24}`);
    if(ctx.fresh){
      ctx.status = 304;
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // require.js
    if(targetUrl === requireJs){
      ctx.body = getRequireJs() + getLoadEventsJs();
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // output compiled js
    const js = compiler.getJs(targetUrl);
    if(js){
      ctx.body = js;
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // requireJsRoot
    const requireJsFile = path.join(requireJsRoot, targetUrl);
    if(fs.existsSync(requireJsFile)){
      ctx.body = fs.readFileSync(requireJsFile).toString();
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // error
    ctx.body = errorConsole('Invalid event handler', `${targetUrl.split('.').slice(0, -1).join('.')} (${targetUrl})`);
    logError('Invalid event handler:', ctx.method, targetUrl);
    return false;
  };

  //////////////////////////////////////////////////////////////////////////////

  const addStyles = (body: string) => {
    // add styles
    const addStyle = `<style>${getStyles()}</style>`;
    // find /head
    const headCloseTag = /<(\s*)\/(\s*)head(\s*)>/i;
    // insert style
    return `${String(body).replace(headCloseTag, `${addStyle}</head>`)}`;
  };

  //////////////////////////////////////////////////////////////////////////////

  const addScripts = (body: string) => {
    const requireJsOptions = {
      baseUrl: ssrsxBaseUrl,
      urlArgs: 't=' + bust,
      paths: option?.requireJsPaths,
    };
    // add scripts
    const addScript = `<script type="text/javascript" src="${ssrsxBaseUrl}${requireJs}"></script>
    <script type="text/javascript">
    var ssrsxHotReload=${option?.hotReload? HotReloadDefault: false};
    var ssrsxHotReloadWait=${option?.hotReloadWait ?? 1000};
    var ssrsxEvents=${JSON.stringify(events)};require.config(${JSON.stringify(requireJsOptions)});</script>`;
    // find /body
    const bodyCloseTag = /<(\s*)\/(\s*)body(\s*)>/i;
    // body tag not found
    if(bodyCloseTag.test(body) === false){
      return `<!DOCTYPE html>${body}${addScript}<script>${errorConsole('body tag not found', 'by ROUTER')}</script>`;
    }
    // insert script
    return `<!DOCTYPE html>${String(body).replace(bodyCloseTag, `${addScript}</body>`)}`;
  };

  //////////////////////////////////////////////////////////////////////////////

  return async (ctx: Koa.Context, next: Koa.Next) => {

    // ssrsx handler
    if(await ssrsxHandler(ctx)){
      return;
    }

    // userContext
    const userContext = option?.context? option.context(ctx): undefined;

    ////////////////////////////////////////////////////////////////////////////

    // initialize styles
    initializeStyles();
    // initialize parse
    initializeParse();

    ////////////////////////////////////////////////////////////////////////////

    // app root
    const app = option?.app? option?.app : undefined;
    if(app){
      const koa: KoaProps = { ctx, next };
      // output
      ctx.status = (ctx.status === 404)?200:ctx.status;
      ctx.body = addScripts(addStyles(await parse(app, {koa}, userContext)));
      log(ctx.method, ctx.status, ctx.url);
      return;
    }

    ////////////////////////////////////////////////////////////////////////////

  };

};

////////////////////////////////////////////////////////////////////////////////

export default ssrsx;
export { TscOption, SsrsxOptions };
export { KoaProps, ExpressProps };