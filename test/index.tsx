import Koa from 'koa';
import koaStatic from 'koa-static';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
//import ssrsx from '@maskedeng-tom/ssrsx';
import ssrsx from '../src/';

////////////////////////////////////////////////////////////////////////////////

import AppRouter, { UserContext } from './server/AppRouter';

////////////////////////////////////////////////////////////////////////////////

const startServer = () => {

  const app = new Koa();

  app.keys = ['f6fba634-dedb-9d6c-c1de-acd2196e3786'];
  const sessionConfig = {
    key: 'ssrsx.session', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    //autoCommit: true, /** (boolean) automatically commit headers (default true) */
    //overwrite: true, /** (boolean) can overwrite or not (default true) */
    //httpOnly: true, /** (boolean) httpOnly or not (default true) */
    //signed: true, /** (boolean) signed or not (default true) */
    //rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    //renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    //secure: true, /** (boolean) secure cookie*/
    //sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
  };
  app.use(session(sessionConfig, app));
  app.use(bodyParser());


  app.use(async (ctx, next) => {
    await next();
    //ctx.set('Cache-Control', 'no-store');
    //ctx.set('Pragma', 'no-cache');
    ctx.res.removeHeader('x-powered-by');
  });

  ////////////////////////////////////////////////////////////////////////////////
  // CSP
  ////////////////////////////////////////////////////////////////////////////////

  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({ directives: {
    defaultSrc: ['\'self\'','ws'],
    connectSrc: ['\'self\'','ws://*:*'],
  } }));

  app.use(ssrsx({
    baseUrl: '/a',
    development: true,
    //hotReload: 33730,
    clientRoot: 'test/client',
    requireJsRoot: 'test/client',
    requireJsPaths: {
      //'jquery': 'https://code.jquery.com/jquery-3.7.1.min',
      'jquery': 'jquery.min',
    },
    context: (ctx): UserContext => {
      return {
        db: 'DB',
      };
    },
    app: <AppRouter/>
  }));

  app.use(koaStatic('test/assets'));

  app.listen(3000);

};

startServer();
