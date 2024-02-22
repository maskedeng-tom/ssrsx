import { getKoa } from '../../index';
import { getParseContext } from '../../index';
import { RouterContext } from './Router';
import { joinPath } from './lib/joinPath';

////////////////////////////////////////////////////////////////////////////////

const Redirect = ({to}:{to: string,}) => {
  const parseContext = getParseContext<RouterContext>();
  const koa = getKoa();
  //
  const target = joinPath(parseContext.basename ?? '', to);
  koa.ctx.redirect(target);  // express?.res
  return <></>;
};

export default Redirect;
export { Redirect };