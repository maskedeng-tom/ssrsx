import { useLocation } from '../hooks/useLocation';
import { addHref } from '../lib/addHref';

////////////////////////////////////////////////////////////////////////////////

const useHref = (href: string) => {
  const location = useLocation();
  return addHref(location.pathname, href);
};

////////////////////////////////////////////////////////////////////////////////

export { useHref };