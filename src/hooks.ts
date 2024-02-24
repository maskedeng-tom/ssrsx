import { getCurrentSsrsx } from 'jsx/jsx-parser';
import { getBody, getContext, getHttpServer, getServer, getSession } from './server/support';
import { SassStyles } from './styleToString/cssTypes';
import { KoaServer, ExpressServer } from './types';
import { styleToString } from './styleToString/styleToString';
import { shortId } from './lib/shortId';

////////////////////////////////////////////////////////////////////////////////

const useServer = <T = KoaServer | ExpressServer>() => {
  const server = getServer();
  return getHttpServer(server) as T;
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useBody = <T = any>() => {
  const server = getServer();
  return getBody<T>(server);
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSession = <T = any>() => {
  const server = getServer();
  return getSession<T>(server);
};

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useContext = <T = any>() => {
  return getContext<T>();
};

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

export { useServer, useBody, useSession, useContext };
export { useGlobalStyle, useScopedStyle };