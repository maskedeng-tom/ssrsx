import debug from 'debug';
const log = debug('ssrsx');
const logError = debug('ssrsx:error');
import { HttpServer, isKoaServer, isExpressServer } from '../types';
import { getUrl } from './support';

////////////////////////////////////////////////////////////////////////////////

interface SendData {
  status: number,
  type: string,
  body: unknown,
  headers?: {name: string, value: string}[],
  lastModified?: Date,
  source?: string,
  errorLog?: boolean,
}

////////////////////////////////////////////////////////////////////////////////

const sendDataKoa = (
  httpServer: HttpServer,
  data: SendData,
) => {
  const server = httpServer.koa;
  if(!server){
    logError('server is not Koa');
    return;
  }
  for(const header of data.headers ?? []){
    server.ctx.set(header.name, header.value);
  }
  //
  server.ctx.status = data.status;
  server.ctx.type = data.type;
  //
  if(data.lastModified){
    server.ctx.set('ETag', getUrl(httpServer));
    server.ctx.set('Cache-Control', 'max-age=0');
    server.ctx.set('Last-Modified', data.lastModified.toUTCString());
    if(server.ctx.fresh){
      server.ctx.status = 304;
      log(server.ctx.method, data.status, server.ctx.url, data.source);
      return true;
    }
  }
  //
  server.ctx.body = data.body;
  //
  if(data.errorLog){
    logError(server.ctx.method, data.status, server.ctx.url, data.source);
  }else{
    log(server.ctx.method, data.status, server.ctx.url, data.source);
  }
};

////////////////////////////////////////////////////////////////////////////////

const sendDataExpress = (
  httpServer: HttpServer,
  data: SendData,
) => {
  const server = httpServer.express;
  if(!server){
    logError('server is not express');
    return;
  }

  for(const header of data.headers ?? []){
    server.res.set(header.name, header.value);
  }
  //
  server.res.set('content-type', data.type);
  //
  if(data.lastModified){
    server.res.set('ETag', getUrl(httpServer));
    server.res.set('Cache-Control', 'max-age=0');
    server.res.set('Last-Modified', data.lastModified.toUTCString());
  }
  //
  server.res.status(data.status).send(data.body);
  //
  if(data.errorLog){
    logError(server.req.method, data.status, server.req.url, data.source);
  }else{
    log(server.req.method, data.status, server.req.url, data.source);
  }
};

////////////////////////////////////////////////////////////////////////////////

const sendData = (
  server: HttpServer,
  data: SendData,
) => {
  if(isKoaServer(server)){
    return sendDataKoa(server, data);
  }
  if(isExpressServer(server)){
    return sendDataExpress(server, data);
  }
  throw new Error('server is not Koa or Express');
};

////////////////////////////////////////////////////////////////////////////////

export { sendData };