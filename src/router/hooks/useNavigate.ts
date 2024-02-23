import { GlobalParseContext, getCurrentSsrsx } from 'jsx/jsx-parser';
import { getParseContext, getServer } from '../../server/support';
import { joinPath } from '../lib/joinPath';
import { isExpressServer, isKoaServer } from '../../types';

////////////////////////////////////////////////////////////////////////////////

const useNavigate = () => {
  //
  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';
  //
  return (to: string) => {
    //
    const globalContext = getParseContext<GlobalParseContext>('global');
    const server = getServer();
    //
    const target = joinPath(baseUrl ?? '', to);
    //
    if(isKoaServer(server)){
      const ctx = server.koa?.ctx;
      ctx!.redirect(target);
      globalContext.redirect = true;
    }
    if(isExpressServer(server)){
      const res = server.express?.res;
      res!.redirect(target);
      globalContext.redirect = true;
    }
    //
    globalContext.redirect = true;
    //
  };
};

////////////

export { useNavigate };
