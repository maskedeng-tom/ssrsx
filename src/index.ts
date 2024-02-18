import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import childProcess from 'child_process';
import { initializeParse, events } from './eventSupport';
import { getRequireJs, getLoadEventsJs } from './getJs';
import { getDir } from './lib/getDir';
import { readdirSyncRecursively } from './lib/readdirSyncRecursively';

interface SsrsxOptions {
  requireJsPaths?: { [key: string]: string };
  sourceMap?: boolean;
  workRoot?: string;
  serverRoot?: string;
  clientRoot?: string;
}

const ssrsx = (option?: SsrsxOptions) => {
  //
  const bust = (new Date()).getTime();
  //
  const baseUrl = '/ssrsx/';
  const requireJs = `event-loader-${bust}.js`;
  //
  const workRoot = getDir(option?.workRoot, './ssrsx');
  const serverRoot = getDir(option?.workRoot, './src/server');
  const clientRoot = getDir(option?.workRoot, './src/client');

  const requireJsOptions = Object.assign({
    baseUrl,
    urlArgs: 't=' + bust,
  }, option?.requireJsPaths);

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
            console.log(`compile error: ${file}\n${stderr}`);
          }
          if(i === files.length - 1){
            resolve(errorCount === 0);
          }
        });
      }
      //
    });
  };

  const handler = async (ctx: Koa.Context, next: Koa.Next) => {
    //
    await compile();
    //
    if(ctx.url.indexOf(baseUrl) === 0){
    //
      let targetUrl = ctx.url.replace(baseUrl, '');
      const pos = targetUrl.lastIndexOf('?');
      if(pos !== -1){
        targetUrl = targetUrl.substr(0, pos);
      }

      // require.js
      if(targetUrl === requireJs){
        ctx.body = getRequireJs() + getLoadEventsJs();
        return;
      }

      // load compiled js
      const targetPath = path.join(workRoot, targetUrl);
      console.log('targetUrl', targetPath);
      const data = fs.readFileSync(targetPath).toString();
      ctx.body = data;
      return;
    }

    // output filename
    let fileName = (!ctx.url || ctx.url === '/')?'/index':ctx.url;
    const localPath = path.join(serverRoot, ctx.url);
    if(ctx.url.slice(-1) === '/' || (fs.existsSync(localPath) && fs.lstatSync(localPath).isDirectory())){
      fileName = path.join(ctx.url, 'index');
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
    ctx.body = '<!DOCTYPE html>' + output;

  };

  return handler;

};

export default ssrsx;
export { SsrsxOptions };