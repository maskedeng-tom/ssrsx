import { isKoaServer, isExpressServer, ExpressServer, KoaServer } from '../types';
import { getCurrentSsrsx } from 'jsx/jsx-parser';
import { HttpServer } from '../types';

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getParseContext = <T = any>(key: string): T => {
  const ssrsx = getCurrentSsrsx<unknown>();
  if(!ssrsx || !ssrsx.parseContext){
    throw new Error('invalid ssrsx parse context');
  }
  ssrsx.parseContext[key] = ssrsx.parseContext[key] ?? {};
  return ssrsx.parseContext[key] as T;
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getContext = <T = any>() => {
  const ssrsx = getCurrentSsrsx<T>();
  if(!ssrsx){
    throw new Error('invalid ssrsx context');
  }
  if(!ssrsx.context){
    ssrsx.context = {} as T;
  }
  return ssrsx.context;
};

////////////////////////////////////////////////////////////////////////////////

const getServer = () => {
  const ssrsx = getCurrentSsrsx();
  if(!ssrsx || !ssrsx.server){
    throw new Error('server is not running');
  }
  return ssrsx.server;
};

////////////////////////////////////////////////////////////////////////////////

const getHttpServer = (server: HttpServer): KoaServer | ExpressServer => {
  if(isKoaServer(server)){
    return server.koa!;
  }
  if(isExpressServer(server)){
    return server.express!;
  }
  throw new Error('server is not Koa or Express');
};

////////////////////////////////////////////////////////////////////////////////

const getProtocol = (server: HttpServer): string => {
  if(isKoaServer(server)){
    return server.koa!.ctx.protocol;
  }
  if(isExpressServer(server)){
    return server.express!.req.protocol;
  }
  throw new Error('server is not Koa or Express');
};

const getHostname = (server: HttpServer): string => {
  if(isKoaServer(server)){
    return server.koa!.ctx.hostname;
  }
  if(isExpressServer(server)){
    return server.express!.req.hostname;
  }
  throw new Error('server is not Koa or Express');
};

const getPort = (server: HttpServer): number => {
  if(isKoaServer(server)){
    return server.koa!.ctx.socket.localPort!;
  }
  if(isExpressServer(server)){
    return server.express!.req.socket.localPort!;
  }
  throw new Error('server is not Koa or Express');
};

const getUrl = (server: HttpServer): string => {
  if(isKoaServer(server)){
    return server.koa!.ctx.url;
  }
  if(isExpressServer(server)){
    return server.express!.req.url;
  }
  throw new Error('server is not Koa or Express');
};

const getPathname = (server: HttpServer): string => {
  return getUrl(server).replace(/\?.*/, '') ?? '';
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getBody = <T = any>(server: HttpServer): T => {
  if(isKoaServer(server)){
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return (server.koa!.ctx?.request as any)?.body as T;
  }
  if(isExpressServer(server)){
    return server.express!.req?.body as T;
  }
  throw new Error('server is not Koa or Express');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSession = <T = any>(server: HttpServer): T => {
  if(isKoaServer(server)){
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return ((server.koa!.ctx as any)?.session as unknown as T);
  }
  if(isExpressServer(server)){
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    return (server.express!.req as any)?.session as unknown as T;
  }
  throw new Error('server is not Koa or Express');
};

////////////////////////////////////////////////////////////////////////////////

export {
  getServer,
  getProtocol,
  getHostname,
  getPort,
  getHttpServer,
  getParseContext,
  getContext,
  getBody,
  getUrl,
  getPathname,
  getSession
};
