import { URL } from 'url';
import { getCurrentSsrsx } from 'jsx/jsx-parser';
import { getServer, getProtocol, getHostname, getPort, getUrl } from '../../server/support';
import { joinPath } from '../lib/joinPath';

////////////////////////////////////////////////////////////////////////////////

const useLocation = () => {
  //
  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';
  //
  const server = getServer();
  const url = getUrl(server).replace(RegExp(`^${baseUrl}`), '');
  const protocol = getProtocol(server);
  const hostname = getHostname(server);
  const port = getPort(server);
  //
  const fullUrl = `${protocol}://${hostname}:${port}${url}`;
  const parsedUrl = new URL(fullUrl);
  //
  const search: {[key: string]: string | string[]} = {};
  for (const [key, value] of parsedUrl.searchParams.entries()) {
    if(search[key]){
      if(Array.isArray(search[key])){
        (search[key] as unknown[]).push(value);
      }else{
        search[key] = [search[key] as string, value];
      }
    }else{
      search[key] = value;
    }
  }
  //
  return {
    protocol: parsedUrl.protocol,
    host: parsedUrl.host,
    hostname: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    href: `${protocol}://${hostname}:${port}${getUrl(server)}`,
    pathname: parsedUrl.pathname,
    search: search,
    hash: parsedUrl.hash,
    //
    realPathname: joinPath(baseUrl, parsedUrl.pathname),
    realPath: (p: string) => {
      return joinPath(baseUrl, p);
    }
  };
  //
};

////////////////////////////////////////////////////////////////////////////////

export { useLocation };
