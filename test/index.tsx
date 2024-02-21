import Koa from 'koa';
import koaStatic from 'koa-static';
import session from 'koa-session';
//import ssrsx from '@maskedeng-tom/ssrsx';
import ssrsx, { ExpressProps, KoaProps } from '../src/';
import bodyParser from 'koa-bodyparser';

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import { Router } from '../src/router/Router';
import { Routes } from '../src/router/Routes';
import { Route } from '../src/router/Route';

import Index from './server/Index';

////////////////////////////////////////////////////////////////////////////////

interface UserContext {
  db: string;
}

export { UserContext };

const App = () => {
  //
  return <>
    <Router /*basename='/tt'*/>
      <html lang="ja">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body>
          <div>
            <Routes>
              <Route path="ss">
                <div>-ss-</div>
                <Route path=":zz/yy">
                  <div>-zz-</div>
                  <Route path="/">
                    <div>zz/</div>
                  </Route>
                  <Route path="xx">
                    <div>xx</div>
                  </Route>
                </Route>

                <Route path="tt">
                  <div>tt</div>
                </Route>
              </Route>
              <Route path="*">
                <div>ALL</div>
              </Route>
            </Routes>
          </div>
        </body>
      </html>
    </Router>
  </>;
  //
};


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
    development: true,
    //hotReload: 5001,
    requireJsRoot: 'test/requireJs',
    clientRoot: 'test/client',
    requireJsPaths: {
      //'jquery': 'https://code.jquery.com/jquery-3.7.1.min',
      'jquery': 'jquery.min',
    },
    context: (ctx): UserContext => {
      return {
        db: 'DB',
      };
    },
    app: <App/>
  }));

  app.use(koaStatic('test/server'));

  app.listen(3000);

};

startServer();
