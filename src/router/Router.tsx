import { VirtualChildren } from '../../jsx/jsx-runtime';
import { getParseContext } from '../server/support';
import { getCurrentSsrsx } from '../../jsx/jsx-parser';
import { addFirstSlash, addLastSlash } from './lib/addSlash';

////////////////////////////////////////////////////////////////////////////////

interface RouterContext {
  basename: string;
  matched: string;
  params: {[key: string]: string};
  routes?: {
    resolved?: boolean;
  };
}

////////////////////////////////////////////////////////////////////////////////

const Router = ({children}:{children?: VirtualChildren}) => {
  //
  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';
  //
  const parseContext = getParseContext<RouterContext>('router');

  // set parse context
  parseContext.basename = addFirstSlash(addLastSlash(baseUrl));
  parseContext.matched = parseContext.basename;
  parseContext.params = {};
  parseContext.routes = {};

  // output
  return <>{children}</>;
};

////////////////////////////////////////////////////////////////////////////////

export default Router;
export { Router };
export type { RouterContext };