////////////////////////////////////////////////////////////////////////////////

import { ssrsxKoa, ssrsxExpress } from './src/';
import {
  SsrsxOptions,
  HttpServer,
  KoaServer,
  ExpressServer,
  isKoaServer,
  isExpressServer,
} from './src/types';
//
import { Router } from './src/router/Router';
import { Routes } from './src/router/Routes';
import { Route } from './src/router/Route';
import { Redirect } from './src/router/Redirect';
import { Link } from './src/router/Link';
//import { routerPath } from './src/router/routerPath';
//
import {
  useServer,
  useBody,
  useSession,
  useContext,
  useGlobalStyle,
  useScopedStyle,
} from './src/hooks';
import { useNavigate } from './src/router/hooks/useNavigate';
import { useLocation } from './src/router/hooks/useLocation';
import { useParams } from './src/router/hooks/useParams';

////////////////////////////////////////////////////////////////////////////////
//
export { ssrsxKoa, ssrsxExpress };
export type { SsrsxOptions, HttpServer, KoaServer, ExpressServer };
export { isKoaServer, isExpressServer };
//
export {
  Router,
  Routes,
  Route,
  Redirect,
  Link,
  //routerPath,
};
//
export {
  useServer,
  useBody,
  useSession,
  useContext,
  useGlobalStyle,
  useScopedStyle,
};
export {
  useNavigate,
  useLocation,
  useParams,
};

////////////////////////////////////////////////////////////////////////////////

