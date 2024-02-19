import Koa from 'koa';
import koaStatic from 'koa-static';
import session from 'koa-session';
//import ssrsx from '@maskedeng-tom/ssrsx';
import bodyParser from 'koa-bodyparser';

import ssrsx from '../src/';

const startServer = () => {

  const app = new Koa();

  app.keys = ['f6fba634-dedb-9d6c-c1de-acd2196e3786'];
  const CONFIG = {
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
  app.use(session(CONFIG, app));
  app.use(bodyParser());

  app.use(ssrsx({
    workRoot: 'test/ssrsx',
    clientRoot: 'test/client',
    serverRoot: 'test/server',
    requireJsPaths: {
      'jquery': 'https://code.jquery.com/jquery-3.7.1.min',
    },
    context: (ctx) => {
      return {
        database: 'DB',
      };
    },
    router: (ctx, next, userContext) => {
      return true;
    },
  }));

  app.use(koaStatic('test/server'));

  app.listen(3000);

};

startServer();
