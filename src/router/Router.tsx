import { getCurrentSsrsx, getParseContext } from '../../index';
import { VirtualChildren } from 'jsx/jsx-runtime';
import { addFirstSlash, addLastSlash } from './lib/addSlash';

////////////////////////////////////////////////////////////////////////////////

interface RouterContext {
  basename: string;
  matched: string;
  routes?: {
    resolved?: boolean;
  };
}

////////////////////////////////////////////////////////////////////////////////

const Router = ({/*basename, */children}:{/*basename?: string, */children?: VirtualChildren}) => {
  //
  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';

  console.log('===>', baseUrl, '<===');

  //
  const parseContext = getParseContext<RouterContext>();

  // set parse context
  parseContext.basename = addFirstSlash(addLastSlash(baseUrl));
  parseContext.matched = parseContext.basename;//'';
  parseContext.routes = {};

  // output
  return <>{children}</>;
};

////////////////////////////////////////////////////////////////////////////////

export default Router;
export { Router };
export type { RouterContext };