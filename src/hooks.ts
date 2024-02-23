import { setGlobalStyle, setScopedStyle } from './core/cssSupport';
import { getBody, getContext, getHttpServer, getServer, getSession } from './server/support';
import { SassStyles } from './styleToString/cssTypes';
import { KoaServer, ExpressServer } from './types';

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
  return setGlobalStyle(style);
};

const useScopedStyle = (style: SassStyles) => {
  return setScopedStyle(style);
};

////////////////////////////////////////////////////////////////////////////////

export { useServer, useBody, useSession, useContext };
export { useGlobalStyle, useScopedStyle };