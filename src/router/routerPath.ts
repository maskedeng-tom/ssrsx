import { joinPath } from './lib/joinPath';
import { RouterContext } from './Router';
import { getParseContext } from '../../index';

const routerPath = (path: string) => {
  const parseContext = getParseContext<RouterContext>();
  return joinPath(parseContext.basename, path);
};

export { routerPath };