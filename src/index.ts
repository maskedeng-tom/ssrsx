import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import childProcess from 'child_process';
import { initializeParse, events } from './core/eventSupport';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { readdirSyncRecursively } from './lib/readdirSyncRecursively';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptions<T = unknown> {
  requireJsPaths?: { [key: string]: string };
  sourceMap?: boolean;
  workRoot?: string;
  serverRoot?: string;
  clientRoot?: string;
  cacheControlMaxAge?: number;
  context?: (ctx: Koa.Context) => T;
  router?: (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => boolean;
}

////////////////////////////////////////////////////////////////////////////////

const ssrsx = (option?: SsrsxOptions) => {

  log('-----------------------------------------------');
  log('Start ssrsx: option =', option);
  log('-----------------------------------------------');

  const bust = (new Date()).getTime();
  const baseUrl = '/ssrsx/';
  const requireJs = `event-loader-${bust}.js`;

  //////////////////////////////////////////////////////////////////////////////

  const workRoot = getDir(option?.workRoot, './ssrsx');
  const serverRoot = getDir(option?.serverRoot, './src/server');
  const clientRoot = getDir(option?.clientRoot, './src/client');

  log('workRoot:', workRoot);
  log('serverRoot:', serverRoot);
  log('clientRoot:', clientRoot);

  //////////////////////////////////////////////////////////////////////////////

  const requireJsOptions = {
    baseUrl,
    urlArgs: 't=' + bust,
    paths: option?.requireJsPaths,
  };

  //////////////////////////////////////////////////////////////////////////////

  const tscOptions = {
    target: 'ES6',
    module: 'umd',
    sourceMap: option?.sourceMap ?? true,
    outDir: workRoot,
    removeComments: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    skipLibCheck: true
  };

  //////////////////////////////////////////////////////////////////////////////

  let compiled = false;
  const compile = async () => {
    if(compiled){
      return;
    }
    compiled = true;

    return new Promise((resolve) => {
      //
      let errorCount = 0;
      const files = readdirSyncRecursively(clientRoot);
      if(files.length === 0){
        resolve(true);
        return;
      }
      //
      for(let i = 0; i < files.length; i++){
        // target ts(x) file
        const file = files[i].slice(clientRoot.length + 1);
        const ext = path.extname(file);
        if(ext !== '.ts' && ext !== '.tsx'){
          continue;
        }

        // create tsc options
        const offsetPath = file.split('/').slice(0, -1).join('/');
        tscOptions.outDir = path.join(workRoot, offsetPath);
        //
        const options: string[] = [];
        for(const key in tscOptions){
          options.push(`--${key} ${tscOptions[key as keyof typeof tscOptions]}`);
        }

        // compile
        const cmd = `tsc ${path.join(clientRoot, file)} ${options.join(' ')}`;
        childProcess.exec(cmd, (err, stdout, stderr) => {
          if (err) {
            ++errorCount;
            logError(`Compile error: ${file}\n${stderr}`);
          }else{
            log(`Compiled: ${file}`);
          }
          if(i === files.length - 1){
            resolve(errorCount === 0);
          }
        });
      }
      //
    });
  };

  //////////////////////////////////////////////////////////////////////////////

  const loadCache: {[path:string]: (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => void | Promise<void>} = {};

  const errorConsole = (message: string, description: string) => {
    return `console.log("%c${message}%c : ${description}", "background-color:red;color:white;", "color:initial;")`;
  };

  const handler = async (ctx: Koa.Context, next: Koa.Next) => {
    //
    await compile();

    // target pathname
    const url = ctx.URL.pathname;

    // ssrsx
    if(url.indexOf(baseUrl) === 0){
      const targetUrl = url.replace(baseUrl, '');

      // cache
      ctx.status = 200;
      ctx.set('ETag', targetUrl);
      ctx.set('Cache-Control', `max-age=${option?.cacheControlMaxAge ?? 60 * 60 * 24}`);
      if(ctx.fresh){
        log('CACHE', ctx.url, targetUrl);
        ctx.status = 304;
        return;
      }

      // require.js
      if(targetUrl === requireJs){
        log(ctx.method, ctx.url, targetUrl);
        ctx.body = getRequireJs() + getLoadEventsJs();
        return;
      }

      // load compiled js
      const targetPath = path.join(workRoot, targetUrl);
      if(!fs.existsSync(targetPath)){
        logError('Invalid event handler:', ctx.method, targetUrl);
        ctx.body = errorConsole('Invalid event handler', targetUrl.split('.').slice(0, -1).join('.'));
        return;
      }
      log(ctx.method, ctx.url, targetUrl);
      ctx.body = fs.readFileSync(targetPath).toString();
      return;
    }

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

    // load target
    let target = loadCache[targetPath];
    if(!loadCache[targetPath]){
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target = (await import(targetPath))['default'] as (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => void | Promise<void>;
      loadCache[targetPath] = target;
    }
    if(!target){
      logError('Page load error:', targetOffsetPath);
      await next();
      return;
    }

    try{
      // initialize parse
      initializeParse();
      // run target
      await target(ctx, next, userContext);
    }catch(e){
      logError('Page parse error:', targetOffsetPath, e);
      await next();
      return;
    }

    // add scripts
    const addScript = `
    <script type="text/javascript" src="${baseUrl}${requireJs}"></script>
    <script type="text/javascript">var events=${JSON.stringify(events)};require.config(${JSON.stringify(requireJsOptions)});</script>
    `;

    // find /body
    const body = /<(\s*)\/(\s*)body(\s*)>/i;

    // body tag not found
    if(body.test(String(ctx.body)) === false){
      logError('Body tag not found:', targetOffsetPath);
      ctx.body = `<!DOCTYPE html>${String(ctx.body)}${addScript}<script>${errorConsole('body tag not found', targetOffsetPath)}</script>`;
      return;
    }

    // insert script
    log(ctx.method, ctx.url, targetOffsetPath);
    ctx.body = `<!DOCTYPE html>${String(ctx.body).replace(body, `${addScript}</body>`)}`;

  };

  return handler;

};

export default ssrsx;
export { SsrsxOptions };