import { styleToString } from '../src/styleToString/styleToString';
import { SassStyles } from '../src/styleToString/cssTypes';
import { Fragment, VirtualElement, VirtualChildren } from './jsx-runtime';
import { HttpServer } from '../src/types';
import { resetShortId, shortId } from '../src/lib/shortId';

////////////////////////////////////////////////////////////////////////////////

let currentSsrsx: SsrsxContext | undefined = undefined;

const getCurrentSsrsx = <C = unknown>(): SsrsxContext<C> | undefined => {
  return currentSsrsx as SsrsxContext<C>;
};

////////////////////////////////////////////////////////////////////////////////

const parseAttributes = (tagname: string, attributes: {[key:string]: unknown} | undefined, ssrsx: SsrsxContext): string | undefined => {
  //
  if(!attributes){
    return;
  }
  //
  const uid = shortId('ev');
  //
  let needUid = false;
  const result: string[] = [];
  for(const key in attributes){
    const attribute = attributes[key];
    //
    if(attribute === undefined || attribute === null){
      continue;
    }
    if(key === '_ssrsxFunctions'){
      continue;
    }
    //
    if(key === 'href' ||
      key === 'src' ||
      (tagname === 'form' && key === 'action') ||
      key === 'formAction' ||
      key === 'icon'
    ){
      const baseUrl = ssrsx.baseUrl;
      const value = String(attribute);
      const href = (value.slice(0,1) === '/')?`${baseUrl}${value}` : value;
      result.push(`${key}="${href}"`);
      continue;
    }
    //
    if(key.slice(0, 2) === 'on'){
      if(String(attribute).indexOf('js://') === 0){
        const jsLink = String(attribute).slice(5);
        //if(String(attribute).indexOf('javascript:') === 0){
        // inline js
        //const js = String(attribute).slice(11);


        //result.push(`${key}="${js}"`);
        /*}else*/
        //if(String(attribute).indexOf('js:') === 0){
        //  jsLink = String(attribute).slice(3);


        //result.push(`${key}="${js}"`);
        //}


        const target = uid;
        const event = key.slice(2).toLowerCase();
        const [module, f] = jsLink.split('.');
        ssrsx.events.push({target, event, module, f: f ?? key});
        needUid = true;



      }else{
        // inline js
        result.push(`${key}="${String(attribute)}"`);
      }
      /*
      if(String(attribute).indexOf('javascript:') === 0){
        // inline js
        const js = String(attribute).slice(11);


        result.push(`${key}="${js}"`);
      }else if(String(attribute).indexOf('js:') === 0){
        // inline js
        const js = String(attribute).slice(3);


        result.push(`${key}="${js}"`);
      }else{
        const target = uid;
        const event = key.slice(2).toLowerCase();
        const [module, f] = String(attribute).split('.');
        ssrsx.events.push({target, event, module, f: f ?? key});
        needUid = true;
      }
      */
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
  if(needUid){
    result.push(`data-ssrsx-event="${uid}"`);
  }
  if(result.length === 0){
    return '';
  }
  return ` ${result.join(' ')}`;
};

////////////////////////////////////////////////////////////////////////////////

interface ElementEvent {
  target: string,
  event: string,
  //
  module: string,
  f: string,
}

interface GlobalParseContext {
  redirect?: boolean;
}

interface SsrsxContext<C = unknown> {
  baseUrl: string;
  context?: C;
  parseContext: {
    global: GlobalParseContext;
    [key: string]: unknown
  };
  server: HttpServer;
  //
  styles: string[];
  events: ElementEvent[];
  //
}

interface SsrsxFunctions {
  finalize: () => VirtualChildren | Promise<VirtualChildren> | void | Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////

const parseCore = async (root: VirtualChildren, ssrsx: SsrsxContext): Promise<string> => {
  if(!root){
    return '';
  }

  if(Array.isArray(root)){
    const result: string[] = [];
    for(const child of root as VirtualChildren[]){
      result.push(await parseCore(child, ssrsx));
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
    return await parseCore(ve.children, ssrsx);
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
    const result = await parseCore(funcResult, ssrsx);
    //
    const finalResult = _ssrsxFunctions.finalize();
    if(finalResult){
      return await parseCore(finalResult, ssrsx);
    }
    return result;
  }
  if(ve.tag){
    return `<${ve.tag}${parseAttributes(ve.tag, ve.attributes, ssrsx)}>${await parseCore(ve.children, ssrsx)}</${ve.tag}>`;
  }

  return '';
};

const parse = async (root: JSX.Children, httpServer: HttpServer, userContext: unknown, baseUrl: string): Promise<{body: string, context: SsrsxContext}> => {
  //
  resetShortId();
  //
  const ssrsx: SsrsxContext = {
    baseUrl,
    context: userContext,
    parseContext: {
      global: {},
    },
    server: httpServer,
    //
    styles: [],
    events: [],
  };
  currentSsrsx = ssrsx;
  return {
    body: await parseCore(root, ssrsx),
    context: ssrsx
  };
};

////////////////////////////////////////////////////////////////////////////////

export { Fragment, parse };
export type { SsrsxContext, SsrsxFunctions, GlobalParseContext, ElementEvent };
export { getCurrentSsrsx };
