import { getParseContext } from '../../server/support';
import { RouterContext } from '../Router';

////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useParams = <T = any>() => {
  const parseContext = getParseContext<RouterContext>('router');
  return (parseContext.params ?? {}) as T;
};

////////////////////////////////////////////////////////////////////////////////

export { useParams };
