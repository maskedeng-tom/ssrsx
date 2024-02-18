import debug from 'debug';
const log = debug('ssrsx');
import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import childProcess from 'child_process';
import { initializeParse, events } from './core/eventSupport';
import { getRequireJs, getLoadEventsJs } from './core/getJs';
import { getDir } from './lib/getDir';
import { readdirSyncRecursively } from './lib/readdirSyncRecursively';

////////////////////////////////////////////////////////////////////////////////

interface SsrsxOptions {
  requireJsPaths?: { [key: string]: string };
  sourceMap?: boolean;
  workRoot?: string;
  serverRoot?: string;
  clientRoot?: string;
  maxAge?: number;
}

////////////////////////////////////////////////////////////////////////////////

const ssrsx = (option?: SsrsxOptions) => {

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

  const requireJsOptions = Object.assign({
    baseUrl,
    urlArgs: 't=' + bust,
  }, option?.requireJsPaths);

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
            log(`compile error: ${file}\n${stderr}`);
          }else{
            log(`compile ok: ${file}`);
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

  const handler = async (ctx: Koa.Context, next: Koa.Next) => {
    //
    await compile();

    // cut hash and search
    let url = ctx.url;
    const searchPos = url.lastIndexOf('?');
    if(searchPos !== -1){
      url = url.slice(0, searchPos);
    }
    const hashPos = url.lastIndexOf('#');
    if(hashPos !== -1){
      url = url.slice(0, hashPos);
    }

    // ssrsx
    if(url.indexOf(baseUrl) === 0){
      const targetUrl = url.replace(baseUrl, '');

      // cache
      ctx.status = 200;
      ctx.set('ETag', targetUrl);
      ctx.set('Cache-Control', `max-age=${option?.maxAge ?? 60 * 60 * 24}`);
      if(ctx.fresh){
        ctx.status = 304;
        return;
      }

      // require.js
      if(targetUrl === requireJs){
        ctx.body = getRequireJs() + getLoadEventsJs();
        return;
      }

      // load compiled js
      const targetPath = path.join(workRoot, targetUrl);
      log(ctx.method, targetUrl);
      const data = fs.readFileSync(targetPath).toString();
      ctx.body = data;
      return;
    }

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const target = (await import(targetPath))['default'] as (ctx: Koa.Context, next: Koa.Next) => void | Promise<void>;
    if(!target){
      await next();
      return;
    }

    // initialize parse
    initializeParse();
    try{
      await target(ctx, next);
    }catch(e){
      console.error(e);
      await next();
      return;
    }

    // add scripts
    const body = /<(\s*)\/(\s*)body(\s*)>/i;
    const output = String(ctx.body).replace(body, `
<script type="text/javascript" src="${baseUrl}${requireJs}"></script>
<script type="text/javascript">var events=${JSON.stringify(events)};require.config(${JSON.stringify(requireJsOptions)});</script>
</body>`);

    // result
    log(ctx.method, targetPath.slice(serverRoot.length + 1));
    ctx.body = '<!DOCTYPE html>' + output;

  };

  return handler;

};

export default ssrsx;
export { SsrsxOptions };