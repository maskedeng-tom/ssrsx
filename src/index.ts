import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import { Server } from 'ws';
import { initializeParse, events } from './core/eventSupport';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { TscOption } from './types/TscOption';
import { createCompiler } from './core/compiler';
import { moduleLoader } from './core/moduleLoader';
import { errorConsole } from './lib/errorConsole';
import { initializeStyles, getStyles } from './core/cssSupport';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptions<T = unknown> {
  development?: boolean;
  workRoot?: string;
  serverRoot?: string;
  clientRoot?: string;
  //
  requireJsRoot?: string;
  requireJsPaths?: { [key: string]: string };
  //
  cacheControlMaxAge?: number;
  //
  context?: (ctx: Koa.Context) => T;
  router?: (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => boolean;
  // for development
  sourceMap?: boolean;
  hotReload?: number | boolean;
  hotReloadWait?: number;
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
  const serverRoot = getDir(option?.serverRoot, './src/server');
  const clientRoot = getDir(option?.clientRoot, './src/client');
  const clientOffset = clientRoot.replace(process.cwd(), '');
  log('workRoot:', workRoot);
  log('requireJsRoot:', requireJsRoot);
  log('serverRoot:', serverRoot);
  log('clientRoot:', clientRoot);
  log('clientOffset:', clientOffset);
  log('-----------------------------------------------');

  //////////////////////////////////////////////////////////////////////////////

  const requireJsOptions = {
    baseUrl: ssrsxBaseUrl,
    urlArgs: 't=' + bust,
    paths: option?.requireJsPaths,
  };

  //////////////////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////////////////
  // source map handler

  const sourceMapHandler = (ctx: Koa.Context, _next: Koa.Next): boolean => {
    const url = ctx.URL.pathname;

    if(!tscOptions.inlineSourceMap){
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

  const ssrsxHandler = async (ctx: Koa.Context, next: Koa.Next): Promise<boolean> => {

    // compile
    await compiler.compile(clientRoot, workRoot, tscOptions);

    // target pathname
    const url = ctx.URL.pathname;

    // source map request
    if(sourceMapHandler(ctx, next)){
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
  // for hot reload

  if(option?.hotReload){
    new Server({ port: (typeof option.hotReload === 'boolean')? 8878: option.hotReload});
  }

  //////////////////////////////////////////////////////////////////////////////

  const loadModule = moduleLoader();

  return async (ctx: Koa.Context, next: Koa.Next) => {

    // ssrsx handler
    if(await ssrsxHandler(ctx, next)){
      return;
    }

    // target pathname
    const url = ctx.URL.pathname;

    // page target
    let fileName = (!url || url === '/')?'/index':url;
    const localPath = path.join(serverRoot, url);
    if(url.slice(-1) === '/' || (fs.existsSync(localPath) && fs.lstatSync(localPath).isDirectory())){
      fileName = path.join(url, 'index');
    }

    // output filepath
    let targetPath = path.join(serverRoot, `${fileName}.tsx`);
    if(!fs.existsSync(targetPath)){
      targetPath = path.join(serverRoot, `${fileName}.ts`);
      if(!fs.existsSync(targetPath)){
        await next();
        return;
      }
    }
    const targetOffsetPath = targetPath.slice(serverRoot.length + 1);

    // userContext
    const userContext = option?.context? option.context(ctx): undefined;

    // filter
    const router = option?.router? option.router(ctx, next, userContext): undefined;
    if(router === false){
      return;
    }

    // load module
    const mod = await loadModule(targetPath);
    if(!mod){
      logError('Module load error:', targetOffsetPath);
      await next();
      return;
    }
    // run module
    try{
      // initialize styles
      initializeStyles();
      // initialize parse
      initializeParse();
      // run module
      await mod(ctx, next, userContext);
    }catch(e){
      logError('Module error:', targetOffsetPath, e);
      await next();
      return;
    }

    // output
    ctx.status = ctx.status || 200;
    log(ctx.method, ctx.status, ctx.url, targetOffsetPath);

    // body
    let body = String(ctx.body);

    // add styles
    const addStyle = `<style>${getStyles()}</style>`;
    // find /head
    const headCloseTag = /<(\s*)\/(\s*)head(\s*)>/i;
    // insert style
    body = `${String(body).replace(headCloseTag, `${addStyle}</head>`)}`;

    // add scripts
    const addScript = `<script type="text/javascript" src="${ssrsxBaseUrl}${requireJs}"></script>
    <script type="text/javascript">
    var ssrsxHotReload=${option?.hotReload ?? 0};
    var ssrsxHotReloadWait=${option?.hotReloadWait ?? 1000};
    var ssrsxEvents=${JSON.stringify(events)};require.config(${JSON.stringify(requireJsOptions)});</script>`;
    // find /body
    const bodyCloseTag = /<(\s*)\/(\s*)body(\s*)>/i;
    // body tag not found
    if(bodyCloseTag.test(body) === false){
      body = `<!DOCTYPE html>${body}${addScript}<script>${errorConsole('body tag not found', targetOffsetPath)}</script>`;
      return;
    }

    // insert script
    ctx.body = `<!DOCTYPE html>${String(body).replace(bodyCloseTag, `${addScript}</body>`)}`;

  };

};

export default ssrsx;
export { SsrsxOptions };