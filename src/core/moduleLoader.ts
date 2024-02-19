import Koa from 'koa';

const moduleLoader = () => {

  const loadCache: {[path:string]: (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => void | Promise<void>} = {};

  return async (targetPath: string) => {
    // load target
    let target = loadCache[targetPath];
    if(!loadCache[targetPath]){
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target = (await import(targetPath))['default'] as (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => void | Promise<void>;
      loadCache[targetPath] = target;
    }
    return target;
  };
  
};

export { moduleLoader };
