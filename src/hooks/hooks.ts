import { getCurrentSsrsx } from 'jsx/jsx-parser';
import { getBody, getContext, getHttpServer, getServer, getSession } from '../server/support';
import { SassStyles } from './styleToString/cssTypes';
import { KoaServer, ExpressServer } from '../types';
import { styleToString } from './styleToString/styleToString';
import { shortId } from '../lib/shortId';
import { nestedStyleToString } from './styleToString/nested';

////////////////////////////////////////////////////////////////////////////////
// http server

const useServer = <T = KoaServer | ExpressServer>() => {
  const server = getServer();
  return getHttpServer(server) as T;
};

////////////////////////////////////////////////////////////////////////////////
// body

const useBody = <T = {[key:string]: string}>() => {
  const server = getServer();
  return getBody<T>(server);
};

////////////////////////////////////////////////////////////////////////////////
// session

const useSession = <T = {[key:string]: string}>() => {
  const server = getServer();
  return getSession<T>(server);
};

////////////////////////////////////////////////////////////////////////////////
// user context

const useContext = <T = {[key:string]: string}>() => {
  return getContext<T>();
};

////////////////////////////////////////////////////////////////////////////////
// Styles

const useGlobalStyle = (style: SassStyles) => {
  const ssrsx = getCurrentSsrsx();
  ssrsx?.styles.push(styleToString(style));
};

const useScopedStyle = (style: SassStyles) => {
  const scope = shortId('sc');
  const ssrsx = getCurrentSsrsx();
  ssrsx?.styles.push(styleToString(style, `data-ssrsx-css="${scope}"`));
  return {'data-ssrsx-css': scope};
};

const useCSSNesting = (style: SassStyles) => {
  const scope = shortId('sc');
  const ssrsx = getCurrentSsrsx();
  ssrsx?.styles.push(nestedStyleToString(style, `data-ssrsx-css="${scope}"`));
  return {'data-ssrsx-css': scope};
};

////////////////////////////////////////////////////////////////////////////////

export { useServer, useBody, useSession, useContext };
export { useGlobalStyle, useScopedStyle, useCSSNesting };