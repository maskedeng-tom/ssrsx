import { FunctionComponent, Props, VirtualChildren } from '../src/types/types';
import { createUid, events } from '../src/core/eventSupport';

////////////////////////////////////////////////////////////////////////////////

const parseChildren = (children?: VirtualChildren): string => {
  if(Array.isArray(children)) {
    return children.join('');
  }
  if(!children){
    return '';
  }
  return String(children);
};

////////////////////////////////////////////////////////////////////////////////

const parseAttributes = (props: Props | null): string => {
  //
  const uid = createUid();
  //
  let needUid = false;
  const result: string[] = [];
  for(const key in props){
    //
    if(key.slice(0, 2) === 'on'){
      //
      const target = uid;
      const event = key.slice(2).toLowerCase();
      const [module, f] = String(props[key]).split('.');
      //
      events.push({target, event, module, f: f ?? key});
      needUid = true;
      //
      continue;
    }
    //
    result.push(`${key}="${String(props[key])}"`);
  }
  if(result.length === 0){
    return '';
  }
  if(needUid){
    result.push(`data-ssrsx-event="${uid}"`);
  }
  return ` ${result.join(' ')}`;
};

////////////////////////////////////////////////////////////////////////////////

const jsx = (
  tag: string | FunctionComponent,
  props: Props | null,
  _key?: string | number,
): string => {
  const {children, ...rest} = props || {};
  if (typeof tag === 'function') {
    return tag(props);
  }
  return `<${tag}${parseAttributes(rest)}>${parseChildren(children)}</${tag}>`;
};

////////////////////////////////////////////////////////////////////////////////

const jsxs = (
  tag: string | FunctionComponent,
  props: Props | null,
  key?: string | number,
): string => {
  return jsx(tag, props, key);
};

////////////////////////////////////////////////////////////////////////////////

const Fragment = (
  props: Props | null,
): string => {
  const {children/*, key, ...rest*/} = props || {};
  return parseChildren(children);
};

////////////////////////////////////////////////////////////////////////////////

export { jsx, jsxs, Fragment };
