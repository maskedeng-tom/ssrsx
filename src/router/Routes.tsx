import { SsrsxContext, SsrsxFunctions } from '../../jsx/jsx-parser';
import { RouterContext } from './Router';

////////////////////////////////////////////////////////////////////////////////

const Routes = ({
  children, ssrsx, _ssrsxFunctions
}:{
  children?: JSX.Children,
  ssrsx?: SsrsxContext<unknown, RouterContext>,
  _ssrsxFunctions?: SsrsxFunctions
}) => {
  if(!ssrsx?.parseContext){
    throw new Error('ssrsx.parseContext is not defined');
  }

  // backup context
  const backupRoutesContext = {...ssrsx.parseContext.routes};
  // set context
  ssrsx.parseContext.routes = {};

  // output
  const result = <>{children}</>;
  if(_ssrsxFunctions){
    _ssrsxFunctions.finalize = () => {
      ssrsx.parseContext.routes = backupRoutesContext;
    };
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////

export default Routes;
export { Routes };