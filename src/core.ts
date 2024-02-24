import mime from 'mime-types';
import debug from 'debug';
const log = debug('ssrsx');
import fs from 'fs';
import path from 'path';
import { Server } from 'ws';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { createCompiler } from './core/compiler';
import { errorConsole } from './lib/errorConsole';
import { ElementEvent, parse } from '../jsx/jsx-parser';
import { SsrsxOptions, HttpServer } from './types';
import { addFirstSlash, removeLastSlash } from './router/lib/addSlash';
import { sendData } from './server/sendData';
import { getPathname } from './server/support';

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
      contentsDate: fs.statSync(targetMapPath).mtime,
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
        contentsDate: serviceStartDateTime,
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
        contentsDate: serviceStartDateTime,
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
        contentsDate: serviceStartDateTime,
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
          contentsDate: serviceStartDateTime,
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
      contentsDate: fs.statSync(filepath).mtime,
    });
    return true;
  };

  //////////////////////////////////////////////////////////////////////////////
  // app

  const addStyles = (body: string, styles: string) => {
    // add styles
    const addStyle = `<style>${styles}</style>`;
    // find /head
    const headCloseTag = /<(\s*)\/(\s*)head(\s*)>/i;
    // insert style
    return `${String(body).replace(headCloseTag, `${addStyle}</head>`)}`;
  };

  /////////////////////////////////////////

  //let events: ElementEvent[] = [];

  const addScripts = (body: string, events: ElementEvent[]) => {
    const requireJsOptions = {
      baseUrl: ssrsxBaseUrl,
      urlArgs: 't=' + bust,
      paths: option?.requireJsPaths,
    };
    // add scripts
    const addScript = `
    <script src="${ssrsxBaseUrl}${requireJs}"></script>
    <script src="${ssrsxBaseUrl}${eventLoaderJs}"></script>
    <script>
    ssrsxOptions = {
      events: ${JSON.stringify(events)},
      hotReload: ${option?.hotReload? HotReload: false},
      hotReloadWait: ${option?.hotReloadWait ?? 1000},
      requireJsConfig: ${JSON.stringify(requireJsOptions)},
    };
    </script>
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

  /////////////////////////////////////////

  const appHandler = async (server: HttpServer) => {
    const url = getPathname(server);

    if(url.indexOf(baseUrl) !== 0 && !option?.app){
      return false;
    }

    // userContext
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const userContext = option?.context? option.context(server as any): undefined;
    //
    const result = await parse(option.app, server, userContext, baseUrl);
    //events = result.context.events;
    if(result.context.parseContext.global.redirect){
      return true;
    }
    //
    sendData(server, {
      status: 200,
      type: 'text/html',
      body: addScripts(addStyles(result.body, result.context.styles.join('\n')), result.context.events),
      source: url,
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
