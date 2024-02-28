import { VirtualChildren } from 'jsx/jsx-runtime';
import { SsrsxFunctions } from 'jsx/jsx-parser';
import { getParseContext } from '../server/support';
import { RouterContext } from './Router';

////////////////////////////////////////////////////////////////////////////////

const Routes = ({
  children, _ssrsxFunctions
}:{
  children?: VirtualChildren,
  _ssrsxFunctions?: SsrsxFunctions
}) => {
  const parseContext = getParseContext<RouterContext>('router');

  // backup context
  const backupRoutesContext = {...parseContext.routes};
  // set context
  parseContext.routes = {};

  // output
  const result = <>{children}</>;
  if(_ssrsxFunctions){
    _ssrsxFunctions.finalize = () => {
      parseContext.routes = backupRoutesContext;
    };
  }
  return result;
};

////////////////////////////////////////////////////////////////////////////////

export default Routes;
export { Routes };