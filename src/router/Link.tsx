import { jsx, VirtualChildren } from 'jsx/jsx-runtime';
import { useLocation } from './hooks/useLocation';
import { joinPath } from './lib/joinPath';
import { getCurrentSsrsx } from 'jsx/jsx-parser';
import { useHref } from './hooks/useHref';

////////////////////////////////////////////////////////////////////////////////

const Link = ({
  tag, to, event, children, ...rest
}:{
  tag?: string,
  to: string,
  event?: string,
  children: VirtualChildren,
  [key:string]: unknown
}) => {

  const ssrsx = getCurrentSsrsx();
  const baseUrl = ssrsx?.baseUrl ?? '';

  // parse href
  let search = '';
  let targetUrl = to;
  const searchPos = to.indexOf('?');
  if(searchPos >= 0){
    search = to.slice(searchPos);
    targetUrl = to.slice(0, searchPos);
  }

  // href to full url
  const location = useLocation();
  const targetFullUrl = useHref(targetUrl);

  // is active flag
  const isActive = (location.pathname === targetFullUrl);

  const {className, style} = rest;
  //
  let outputClassName: string | undefined = undefined;
  if(!className || typeof className === 'string'){
    outputClassName = (className ? String(className) : '') + (isActive ? ' active' : '');
  }else if(typeof className === 'function'){
    outputClassName = String(className(isActive));
  }
  //
  let outputStyle: unknown = style;
  if(typeof style === 'function'){
    outputStyle = style(isActive);
  }
  //
  let outputChildren: VirtualChildren = children;
  if(typeof children === 'function'){
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    outputChildren = children(isActive);
  }

  // output a
  let targetHref = targetFullUrl + search;
  if(!tag || tag === 'a'){
    return jsx(tag ?? 'a', {
      href: targetHref,
      children: outputChildren,
      ...rest,
      className: outputClassName,
      style: outputStyle
    });
  }

  // add base url
  targetHref = joinPath(baseUrl, targetHref);

  // output button
  if(tag === 'button'){
    return jsx(tag, {
      type:'button',
      [`on${event ?? 'click'}`]: `js:location.href='${targetHref}'`,
      children: outputChildren,
      ...rest,
      className: outputClassName,
      style: outputStyle
    });
  }

  // output etc
  return jsx(tag, {
    [`on${event ?? 'click'}`]: `js:location.href='${targetHref}'`,
    children: outputChildren,
    ...rest,
    className: outputClassName,
    style: outputStyle
  });

};

////////////////////////////////////////////////////////////////////////////////

export default Link;
export { Link, Link as NavLink };
