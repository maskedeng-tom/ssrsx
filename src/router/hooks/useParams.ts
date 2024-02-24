import { getParseContext } from '../../server/support';
import { RouterContext } from '../Router';

////////////////////////////////////////////////////////////////////////////////

const useParams = <T = {[key:string]: string}>() => {
  const parseContext = getParseContext<RouterContext>('router');
  return (parseContext.params ?? {}) as T;
};

////////////////////////////////////////////////////////////////////////////////

export { useParams };
