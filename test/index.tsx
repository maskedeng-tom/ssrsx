import Koa from 'koa';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
//
import express from 'express';
import expressSession from 'express-session';
import expressHelmet from 'helmet';
import crypto from 'crypto';

import { ssrsxKoa, ssrsxExpress, useSearch } from '../';
import { Router, Routes, Route, Link, Navigate, useBody, useSession } from '../';

////////////////////////////////////////////////////////////////////////////////

interface SessionContext {
  username?: string;
}

const Authorized = () => {
  // session
  const session = useSession<SessionContext>();
  if(!session.username){
    // not authorized
    return <Navigate to="/"/>;
  }
  // authorized
  return <>
    <h1>Authorized</h1>
    <div>
      <div>Authorized Username: {session.username}</div>
    </div>
    <Link to="/logout">Logout</Link>
  </>;
};

const Login = () => {
  // session
  const session = useSession<SessionContext>();
  // post body data
  const body = useBody<{username: string, password: string}>();
  // check username and password
  if(body.username === 'admin' && body.password === 'admin'){
    session.username = body.username;
    return <Navigate to="/authorized"/>;
  }
  // authorization failed
  return <Navigate to="/?message=authorization_failed"/>;
};

const Logout = () => {
  // set session
  const session = useSession<SessionContext>();
  // session clear
  session.username = undefined;
  // redirect to top
  return <Navigate to="/"/>;
};

const LoginForm = () => {
  // get search(query parameter) data (?message=...)
  const search = useSearch<{message: string}>();
  // set session
  const session = useSession<SessionContext>();
  if(session.username){
    // already authorized
    return <Navigate to="/authorized"/>;
  }
  // login form
  return <>
    <h1>Login Form</h1>
    <form method="post" action="/login">
      <div>
        <label>
          username: <input type="text" name="username" />
        </label>
      </div>
      <div>
        <label>
          password: <input type="password" name="password" />
        </label>
      </div>
      {
        search.message && <div>{search.message}</div>
      }
      <button type="submit">Login</button>
    </form>
  </>;
};

const App = () => {
  return <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <Router>
        <Routes>
          <Route path="/"><LoginForm /></Route>
          <Route path="/login"><Login /></Route>
          <Route path="/logout"><Logout /></Route>
          <Route path="/authorized"><Authorized /></Route>
        </Routes>
      </Router>
    </body>
  </html>;
};

const startSample = () => {

  const app = new Koa();

  app.keys = ['f6fba634-dedb-9d6c-c1de-acd2196e3786'];
  app.use(session(app));
  app.use(bodyParser());

  app.use(async (ctx, next) => {
    await next();
    ctx.res.removeHeader('x-powered-by');
  });

  //if(process.env.NODE_ENV === 'production'){
  app.use(helmet());
  app.use((ctx, next) => {
    ctx.state.nonce = crypto.randomBytes(16).toString('base64');
    return helmet.contentSecurityPolicy({ directives: {
      defaultSrc: ['\'self\'','ws'],
      connectSrc: ['\'self\'','ws://*:*'],
      scriptSrc: [
        '\'self\'',
        `'nonce-${ctx.state.nonce}'`,
        //'https://code.jquery.com/jquery-3.7.1.min.js'
      ],
    }})(ctx, next) as Koa.Middleware;
  });

  app.use(ssrsxKoa({
    development: true,
    clientRoot: 'test/client',
    app: <App/>
  }));

  app.listen(3000);

};
//startSample();

////////////////////////////////////////////////////////////////////////////////

import AppRouter, { UserContext } from './server/AppRouter';

const startServerKoa = () => {

  const app = new Koa();

  app.keys = ['f6fba634-dedb-9d6c-c1de-acd2196e3786'];
  app.use(session({
    key: 'ssrsx.session',
    maxAge: 86400000,
  }, app));
  app.use(bodyParser());

  app.use(async (ctx, next) => {
    await next();
    ctx.res.removeHeader('x-powered-by');
  });

  if(process.env.NODE_ENV === 'production'){
    app.use(helmet());
    app.use((ctx, next) => {
      ctx.state.nonce = crypto.randomBytes(16).toString('base64');
      return helmet.contentSecurityPolicy({ directives: {
        defaultSrc: ['\'self\'','ws'],
        connectSrc: ['\'self\'','ws://*:*'],
        scriptSrc: [
          '\'self\'',
          `'nonce-${ctx.state.nonce}'`,
          //'https://code.jquery.com/jquery-3.7.1.min.js'
        ],
      }})(ctx, next) as Koa.Middleware;
    });
  }

  app.use(ssrsxKoa({
    baseUrl: '/a',
    development: true,
    clientRoot: 'test/client',
    requireJsRoot: 'test/client',
    requireJsPaths: {
      'jquery': 'jquery.min',
    },
    context: (ctx, next): UserContext => {
      console.log('=KOA=>', ctx, next);
      return {
        db: 'DB',
      };
    },
    app: <AppRouter/>
  }));

  app.listen(3000);

};

const startServerExpress = () => {

  const app = express();

  app.use(expressSession({
    secret: 'f6fba634-dedb-9d6c-c1de-acd2196e3785',
    name: 'ssrsx.session.express',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

  if(process.env.NODE_ENV === 'production'){
    app.use(expressHelmet());
    app.use((req, res, next) => {
      (res as express.Response).locals.nonce = crypto.randomBytes(16).toString('base64');
      expressHelmet.contentSecurityPolicy({ directives: {
        defaultSrc: ['\'self\'','ws'],
        connectSrc: ['\'self\'','ws://*:*'],
        scriptSrc: [
          '\'self\'',
          (req, res) => `'nonce-${(res as express.Response).locals?.nonce}'`,
          //'https://code.jquery.com/jquery-3.7.1.min.js'
        ],
      }})(req, res, next);
    });
  }

  app.use((req, res, next) => {
    res.removeHeader('x-powered-by');
    next();
  });

  // body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(ssrsxExpress({
    baseUrl: '/a',
    development: true,
    clientRoot: 'test/client',
    requireJsRoot: 'test/client',
    requireJsPaths: {
      'jquery': 'jquery.min',
    },
    context: (req, res, next): UserContext => {
      console.log('=EXPRESS=>', req, res, next);
      return {
        db: 'DB',
      };
    },
    app: <AppRouter/>
  }));

  app.listen(3001);
};

startServerKoa();
startServerExpress();
