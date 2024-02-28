import { GlobalContext } from 'jsx/jsx-parser';
import { getParseContext } from '../../server/support';

////////////////////////////////////////////////////////////////////////////////

const useLastModified = (lastModified: Date) => {
  const routerContext = getParseContext<GlobalContext>('global');
  routerContext.lastModified = lastModified;
};

////////////////////////////////////////////////////////////////////////////////

export { useLastModified };
