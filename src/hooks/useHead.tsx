import { GlobalContext } from 'jsx/jsx-parser';
import { VirtualChildren } from 'jsx/jsx-runtime';
import { getParseContext } from '../server/support';

const useHead = (head: VirtualChildren) => {
  const globalContext = getParseContext<GlobalContext>('global');
  globalContext.head = <>{head}</>;
};

export { useHead };
