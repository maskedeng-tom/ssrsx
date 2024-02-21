import { SsrsxContext } from '../../jsx/jsx-parser';

////////////////////////////////////////////////////////////////////////////////

interface RouterContext {
  basename: string;
  //matched: string[];
  matched: string;
  routes?: {
    resolved?: boolean;
  };
}

////////////////////////////////////////////////////////////////////////////////

const Router = ({
  basename, children, ssrsx
}:{
  basename?: string,
  children?: JSX.Children,
  ssrsx?: SsrsxContext<unknown, RouterContext>,
}) => {
  if(!ssrsx?.parseContext){
    throw new Error('ssrsx.parseContext is not defined');
  }

  // set parse context
  ssrsx.parseContext = {
    basename: basename ?? '/',
    matched: '',
    routes: {},
  };

  // set basename
  ssrsx.parseContext.matched = ssrsx.parseContext.basename;

  // output
  return <>{children}</>;
};

////////////////////////////////////////////////////////////////////////////////

export default Router;
export { Router, RouterContext };