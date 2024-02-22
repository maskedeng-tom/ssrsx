import { createUid, events } from '../src/core/eventSupport';
import { styleToString } from '../src/styleToString/styleToString';
import { SassStyles } from '../src/styleToString/cssTypes';
import { Fragment, VirtualElement, VirtualChildren } from './jsx-runtime';
import { HttpServer } from '../src/types';

////////////////////////////////////////////////////////////////////////////////

const parseAttributes = (attributes?: {[key:string]: unknown}): string | undefined => {
  //
  if(!attributes){
    return;
  }
  //
  const uid = createUid();
  //
  let needUid = false;
  const result: string[] = [];
  for(const key in attributes){
    const attribute = attributes[key];
    //
    if(key.slice(0, 2) === 'on'){
      //
      const target = uid;
      const event = key.slice(2).toLowerCase();
      const [module, f] = String(attribute).split('.');
      //
      events.push({target, event, module, f: f ?? key});
      needUid = true;
      //
      continue;
    }
    //
    if(key === 'className'){
      result.push(`class="${String(attribute)}"`);
      continue;
    }
    if(key === 'htmlFor'){
      result.push(`for="${String(attribute)}"`);
      continue;
    }
    if(key === 'style'){
      result.push(`style="${typeof attribute === 'string' ?
        String(attribute)
        :
        (typeof attribute === 'object' ?
          styleToString(attribute as SassStyles)
          :
          ''
        )
      }"`);
      continue;
    }
    //
    result.push(`${key}="${String(attribute)}"`);
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

interface SsrsxContext<C = unknown, P = unknown> {
  baseUrl: string;
  context?: C;
  parseContext: P;
  server: HttpServer;
}

interface SsrsxFunctions {
  finalize?: () => VirtualChildren | Promise<VirtualChildren> | void | Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////

let currentSsrsx: SsrsxContext | undefined = undefined;

const getCurrentSsrsx = <C = unknown, P = unknown>(): SsrsxContext<C, P> | undefined => {
  return currentSsrsx as SsrsxContext<C, P>;
};

const parseCore = async (root: VirtualChildren): Promise<string> => {
  if(!root){
    return '';
  }

  if(Array.isArray(root)){
    const result: string[] = [];
    for(const child of root as VirtualChildren[]){
      result.push(await parseCore(child));
    }
    return result.join('');
  }

  if(root === null || root === undefined){
    return '';
  }
  if(typeof root !== 'object'){
    return String(root);
  }

  const ve = await (root as Promise<VirtualElement>);
  if(ve.fragment){
    return await parseCore(ve.children);
  }
  if(ve.f){
    const _ssrsxFunctions: SsrsxFunctions = {finalize: () => {}};
    //
    let funcResult: VirtualElement | undefined = undefined;
    try{
      funcResult = await ve.f({_ssrsxFunctions, ...ve.props});
    }catch(e){
      console.error(e); // TODO error report
    }
    //
    const result = await parseCore(funcResult);
    const finalResult = _ssrsxFunctions.finalize?.();
    //
    if(finalResult){
      return await parseCore(finalResult);
    }
    return result;
  }
  if(ve.tag){
    return `<${ve.tag}${parseAttributes(ve.attributes)}>${await parseCore(ve.children)}</${ve.tag}>`;
  }

  return '';
};

const parse = async (root: JSX.Children, httpServer: HttpServer, userContext: unknown, baseUrl: string): Promise<string> => {
  const ssrsx: SsrsxContext = {
    baseUrl,
    context: userContext,
    parseContext: {},
    server: httpServer,
  };
  currentSsrsx = ssrsx;
  return await parseCore(root);
};

////////////////////////////////////////////////////////////////////////////////

export { Fragment, parse };
export type { SsrsxContext, SsrsxFunctions };
export { getCurrentSsrsx };
