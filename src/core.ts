import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
import { Server } from 'ws';
import { log } from './lib/log';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { createCompiler } from './core/compiler';
import { errorConsole } from './lib/errorConsole';
import { ElementEvent, parse } from 'jsx/jsx-parser';
import { SsrsxOptions, HttpServer, isKoaServer, isExpressServer } from './types';
import { addFirstSlash, removeLastSlash } from './router/lib/addSlash';
import { sendData } from './server/sendData';
import { getPathname } from './server/support';
import { SsrsxOptionsExpress, SsrsxOptionsKoa } from '.';

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

let HotReloadDefault = 33730;

////////////////////////////////////////////////////////////////////////////////

const ssrsx = (ssrsxOption?: SsrsxOptions) => {

  const HotReload = HotReloadDefault++;

  //////////////////////////////////////////////////////////////////////////////

  const serviceStartDateTime = new Date();

  //////////////////////////////////////////////////////////////////////////////

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
  const requireJs = 'require.js';
  const eventLoaderJs = 'event-loader.js';

  //////////////////////////////////////////////////////////////////////////////

  const workRoot = getDir(option?.workRoot, './.ssrsx');
  const clientRoot = getDir(option?.clientRoot, './src/client');
  const clientOffset = clientRoot.replace(RegExp(`^${process.cwd()}`), '');
  const requireJsRoot = getDir(option?.requireJsRoot, option?.clientRoot ?? './src/client');
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
    const port = (typeof option.hotReload === 'boolean')? HotReload: option.hotReload;
    log('Hot reload start:', port);
    new Server({ port });
  }

  //////////////////////////////////////////////////////////////////////////////
  // source map handler

  const sourceMapHandler = (server: HttpServer): boolean => {
    const url = getPathname(server);

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

    if(targetMapPath.indexOf(clientRoot) !== 0){
      return false;
    }

    sendData(server, {
      status: 200,
      type: 'text/plain',
      body: fs.readFileSync(targetMapPath).toString(),
      lastModified: fs.statSync(targetMapPath).mtime,
      source: targetMapPath,
    });

    return true;
  };

  //////////////////////////////////////////////////////////////////////////////
  // ssrsx handler

  const compiler = createCompiler(clientRoot, workRoot, {
    target: 'ES6',
    module: 'umd',
    inlineSourceMap: option?.sourceMap ?? false,
    outDir: workRoot,
    removeComments: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    skipLibCheck: true
  });

  const ssrsxHandler = async (server: HttpServer): Promise<boolean> => {

    // source map request
    if(sourceMapHandler(server)){
      return false;
    }

    // target pathname
    const url = getPathname(server);

    // ssrsx
    if(url.indexOf(ssrsxBaseUrl) < 0){
      return false;
    }

    const targetPathname = url.replace(RegExp(`^${ssrsxBaseUrl}`), '');

    // requireJs
    if(targetPathname === requireJs){
      sendData(server, {
        status: 200,
        type: 'text/javascript',
        body: `${getRequireJs()}`,
        source: targetPathname,
        lastModified: serviceStartDateTime,
      });
      return true;
    }

    // event loader
    if(targetPathname === eventLoaderJs){
      sendData(server, {
        status: 200,
        type: 'text/javascript',
        body: getLoadEventsJs(),
        source: targetPathname,
        lastModified: serviceStartDateTime,
      });
      return true;
    }

    // on demand compile
    const js = await compiler.compile(targetPathname);
    if(js){
      sendData(server, {
        status: 200,
        type: 'text/javascript',
        body: js,
        source: targetPathname,
        lastModified: serviceStartDateTime,
      });
      return true;
    }

    // requireJsRoot
    const requireJsFile = path.join(requireJsRoot, targetPathname);
    if(fs.existsSync(requireJsFile)){
      if(requireJsFile.indexOf(requireJsRoot) === 0){
        sendData(server, {
          status: 200,
          type: 'text/javascript',
          body: fs.readFileSync(requireJsFile).toString(),
          source: requireJsFile,
          lastModified: serviceStartDateTime,
        });
        return true;
      }
    }

    // error
    sendData(server, {
      status: 200,
      type: 'text/javascript',
      body: errorConsole('Invalid event handler', `${targetPathname.split('.').slice(0, -1).join('.')} (${targetPathname})`),
      source: targetPathname,
      errorLog: true,
    });
    return true;
  };

  //////////////////////////////////////////////////////////////////////////////
  // static file

  const staticFileHandler = (server: HttpServer) => {
    //
    const url = getPathname(server);
    // static file route
    const filepath = path.join(clientRoot, url.replace(RegExp(`^${baseUrl}`), ''));
    const ext = path.extname(filepath);
    if(ext === '.ts' || ext === '.tsx' ||
      !fs.existsSync(filepath) ||
      fs.lstatSync(filepath).isDirectory()
    ){
      return false;
    }
    //
    if(filepath.indexOf(clientRoot) !== 0){
      return false;
    }
    //
    sendData(server, {
      status: 200,
      type: mime.lookup(path.extname(filepath).slice(1)) || 'text/plain',
      body: fs.readFileSync(filepath),
      source: filepath,
      lastModified: fs.statSync(filepath).mtime,
    });
    return true;
  };

  //////////////////////////////////////////////////////////////////////////////
  // app

  const addHead = (body: string, head: string) => {
    // find /head
    const headCloseTag = /<(\s*)\/(\s*)head(\s*)>/i;
    // insert style
    return `${String(body).replace(headCloseTag, `${head}</head>`)}`;
  };

  const addStyles = (body: string, styles: string) => {
    // add styles
    const addStyle = `<style>${styles}</style>`;
    // find /head
    const headCloseTag = /<(\s*)\/(\s*)head(\s*)>/i;
    // insert style
    return `${String(body).replace(headCloseTag, `${addStyle}</head>`)}`;
  };

  /////////////////////////////////////////

  const addScripts = (server: HttpServer, body: string, events: ElementEvent[]) => {
    const requireJsOptions = {
      baseUrl: ssrsxBaseUrl,
      urlArgs: 't=' + bust,
      paths: option?.requireJsPaths,
    };
    //
    let nonce = '';
    if(isKoaServer(server)){
      nonce = server.koa!.ctx.state.nonce ? String(server.koa!.ctx.state.nonce) : '';
    }
    if(isExpressServer(server)){
      nonce = (server.express!.res).locals.nonce ? String((server.express!.res).locals.nonce) : '';
    }
    // add scripts
    const addScript = `
    <script src="${ssrsxBaseUrl}${requireJs}"></script>
    <script ${nonce? `nonce="${nonce}"` : ''}>
    ssrsxOptions = {
      events: ${JSON.stringify(events)},
      hotReload: ${option?.hotReload? HotReload: false},
      hotReloadWait: ${option?.hotReloadWait ?? 1000},
      hotReloadWaitMax: ${option?.hotReloadWaitMax ?? 1000 * 5},
      hotReloadWaitInclement: ${option?.hotReloadWaitInclement ?? 500},
      requireJsConfig: ${JSON.stringify(requireJsOptions)},
    };
    </script>
    <script src="${ssrsxBaseUrl}${eventLoaderJs}"></script>
    `;
    //
    // find /body
    const bodyCloseTag = /<(\s*)\/(\s*)body(\s*)>/i;
    // body tag not found
    if(bodyCloseTag.test(body) === false){
      return `<!DOCTYPE html>${body}${addScript}<script>${errorConsole('body tag not found', 'by ROUTER')}</script>`;
    }
    // insert script
    return `<!DOCTYPE html>${String(body).replace(bodyCloseTag, `${addScript}</body>`)}`;
  };

  /////////////////////////////////////////

  const appHandler = async (server: HttpServer) => {
    const url = getPathname(server);

    if(url.indexOf(baseUrl) !== 0 && !option?.app){
      return false;
    }

    if(url.split('/').slice(-1).join('/') === 'favicon.ico'){
      return false;
    }

    // userContext
    let userContext: unknown = undefined;
    if(isKoaServer(server)){
      const optionKoa = option as SsrsxOptionsKoa;
      userContext = optionKoa.context?.(server.koa!.ctx, server.koa!.next);
    }
    if(isExpressServer(server)){
      const optionExpress = option as SsrsxOptionsExpress;
      userContext = optionExpress.context?.(server.express!.req, server.express!.res, server.express!.next);
    }

    //
    const result = await parse(option.app, server, userContext, baseUrl);
    // global context
    const globalContext = result.context.parseContext.global;
    if(globalContext.redirect){
      return true;
    }
    //
    if(globalContext.head){
      result.body = addHead(result.body, (await parse(globalContext.head, server, userContext, baseUrl)).body);
    }
    //
    sendData(server, {
      status: 200,
      type: 'text/html',
      body: addScripts(server, addStyles(result.body, result.context.styles.join('\n')), result.context.events),
      source: url,
      lastModified: globalContext.lastModified ?? serviceStartDateTime,
    });
    //
    return true;
  };

  //////////////////////////////////////////////////////////////////////////////

  return async (server: HttpServer) => {
    // ssrsx handler
    if(await ssrsxHandler(server)){
      return true;
    }
    // ssrsx handler
    if(staticFileHandler(server)){
      return true;
    }
    // app
    if(await appHandler(server)){
      return true;
    }
    return false;
  };

};

////////////////////////////////////////////////////////////////////////////////

export default ssrsx;
export { ssrsx };
export type { TscOption };
