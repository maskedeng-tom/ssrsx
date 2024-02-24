import Koa from 'koa';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
//
import express from 'express';
import expressSession from 'express-session';
import expressHelmet from 'helmet';

import { ssrsxKoa, ssrsxExpress } from '../src/';

////////////////////////////////////////////////////////////////////////////////

import AppRouter, { UserContext } from './server/AppRouter';


////////////////////////////////////////////////////////////////////////////////

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
    app.use(helmet.contentSecurityPolicy({ directives: {
      defaultSrc: ['\'self\'','ws'],
      connectSrc: ['\'self\'','ws://*:*'],
    } }));
  }

  app.use(ssrsxKoa({
    baseUrl: '/a',
    development: true,
    clientRoot: 'test/client',
    requireJsRoot: 'test/client',
    requireJsPaths: {
      'jquery': 'jquery.min',
    },
    context: (): UserContext => {
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
    app.use(expressHelmet.contentSecurityPolicy({ directives: {
      defaultSrc: ['\'self\'','ws'],
      connectSrc: ['\'self\'','ws://*:*'],
    } }));
  }

  app.use(function (req, res, next) {
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
    context: (): UserContext => {
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
