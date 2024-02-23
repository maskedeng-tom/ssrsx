import { jsx, jsxs, Fragment, VirtualChildren } from '../../jsx/jsx-runtime';
import { joinPath } from './lib/joinPath';
import { getCurrentSsrsx } from 'jsx/jsx-parser';

////////////////////////////////////////////////////////////////////////////////

const Link = ({tag, href, children, ...rest}:{tag?: string, href: string, children: VirtualChildren, [key:string]: unknown}) => {
  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';
  //
  const targetHref = (href.slice(0,1) === '/')?joinPath(baseUrl, href):href;
  if(!tag || tag === 'a'){
    return jsx(tag ?? 'a', {href, children, ...rest});
  }
  if(tag === 'button'){
    return jsx(tag, {type:'button', onClick: `js:location.href='${targetHref}'`, children, ...rest});
  }
  return jsx(tag, {onClick: `js:location.href='${targetHref}'`, children, ...rest});
};

export default Link;
export { Link };