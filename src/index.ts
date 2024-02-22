import Koa from 'koa';
import express from 'express';
import mime from 'mime-types';
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
import { SsrsxOptions, HttpServer } from './types';
import { addFirstSlash, removeLastSlash } from './router/lib/addSlash';

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

const HotReloadDefault = 33730;

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
  const requireJs = `requireJs-${bust}.js`;
  const eventLoaderJs = `event-loader-${bust}.js`;

  //////////////////////////////////////////////////////////////////////////////

  const workRoot = getDir(option?.workRoot, './.ssrsx');
  const clientRoot = getDir(option?.clientRoot, './src/client');
  const clientOffset = clientRoot.replace(process.cwd(), '');
  const requireJsRoot = getDir(option?.requireJsRoot, clientRoot);
  const baseUrl = removeLastSlash(addFirstSlash(option?.baseUrl ?? ''));
  log('workRoot:', workRoot);
  log('requireJsRoot:', requireJsRoot);
  log('clientRoot:', clientRoot);
  log('clientOffset:', clientOffset);
  log('baseUrl:', baseUrl);
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
    console.log('------------------------1---------------------', targetMapPath);
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
    ctx.type = 'text/javascript';
    /*
    const stats = fs.statSync(filepath);
    ctx.set('ETag', ctx.url);
    ctx.set('Cache-Control', 'max-age=0');
    ctx.set('Last-Modified', stats.mtime.toUTCString());
    */
    ctx.set('ETag', ctx.url);
    ctx.set('Cache-Control', `max-age=${option?.cacheControlMaxAge ?? 60 * 60 * 24}`);
    if(ctx.fresh){
      ctx.status = 304;
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // require.js
    if(targetUrl === requireJs){
      ctx.body = `${getRequireJs()}`;
      log(ctx.method, ctx.status, ctx.url, targetUrl);
      return true;
    }

    // require.js
    if(targetUrl === eventLoaderJs){
      const requireJsOptions = {
        baseUrl: ssrsxBaseUrl,
        urlArgs: 't=' + bust,
        paths: option?.requireJsPaths,
      };
      ctx.body = `${getLoadEventsJs()}
var ssrsxOptions = {
  events: ${JSON.stringify(events)},
  hotReload: ${option?.hotReload? HotReloadDefault: false},
  hotReloadWait: ${option?.hotReloadWait ?? 1000},
  requireJsConfig: ${JSON.stringify(requireJsOptions)},
}
`;
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
      console.log('------------------------2---------------------', requireJsFile);
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
    // add scripts
    const addScript = `
    <script src="${ssrsxBaseUrl}${requireJs}"></script>
    <script src="${ssrsxBaseUrl}${eventLoaderJs}"></script>
    `;
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
    /*
    console.log('==>', ctx.URL.pathname);
    console.log('==x>', ctx.URL.pathname.replace(baseUrl, ''));
    console.log('==>', baseUrl);
    */

    // static file route
    const filepath = path.join(clientRoot, ctx.URL.pathname.replace(baseUrl, ''));
    if(fs.existsSync(filepath) && !fs.lstatSync(filepath).isDirectory()){

      ctx.status = 200;
      const mimeType = mime.lookup(path.extname(filepath).slice(1));
      ctx.type = mimeType || 'text/plain';

      const stats = fs.statSync(filepath);
      ctx.set('ETag', ctx.url);
      ctx.set('Cache-Control', 'max-age=0');
      ctx.set('Last-Modified', stats.mtime.toUTCString());

      if(ctx.fresh){
        ctx.status = 304;
        log(ctx.method, ctx.status, ctx.url);
        return true;
      }

      console.log('------------------------3---------------------', filepath);
      ctx.body = fs.readFileSync(filepath);
      log(ctx.method, ctx.status, ctx.url, filepath);
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
      const server: HttpServer = {koa: {ctx, next}};
      ctx.status = (ctx.status === 404)?200:ctx.status;
      ctx.body = addScripts(addStyles(await parse(app, server, userContext, baseUrl)));
      ctx.type = 'text/html';
      log(ctx.method, ctx.status, ctx.url);
      return;
    }

    ////////////////////////////////////////////////////////////////////////////
  };
};

////////////////////////////////////////////////////////////////////////////////

export default ssrsx;
export type { TscOption };