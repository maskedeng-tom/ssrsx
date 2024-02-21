import { createUid, events } from '../src/core/eventSupport';
import { styleToString } from '../src/styleToString/styleToString';
import { SassStyles } from '../src/styleToString/cssTypes';
import { Fragment, VirtualElement, VirtualChildren } from './jsx-runtime';
//import { KoaProps, ExpressProps } from '../src';

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
  context?: C;
  parseContext: P;
}

interface SsrsxFunctions {
  finalize?: () => VirtualChildren | Promise<VirtualChildren> | void | Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////

const parseCore = async (root: VirtualChildren, ssrsx: SsrsxContext, httpServer: object): Promise<string> => {

  //console.log('=------parseContext---------->', parseContext);

  if(Array.isArray(root)){
    const result: string[] = [];
    for(const child of root as VirtualChildren[]){
      result.push(await parseCore(child, ssrsx, httpServer));
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
    return await parseCore(ve.children, ssrsx, httpServer);
  }
  if(ve.f){
    /*
    const ssrsx: SsrsxContext = {
      context: userContext,
      parseContext: parseContext,
      functionComponentContext: {finalize: undefined},
    };
    */
    const _ssrsxFunctions: SsrsxFunctions = {finalize: () => {}};
    const funcResult = await ve.f({ssrsx, _ssrsxFunctions, ...httpServer, ...ve.props});
    const result = await parseCore(funcResult, ssrsx, httpServer);
    //parseContext = ssrsx.parseContext;
    //if(ssrsx.functionComponentContext.finalize){
    const finalResult = _ssrsxFunctions.finalize?.();
    if(finalResult){
      return await parseCore(finalResult, ssrsx, httpServer);
    }
    //}
    //
    return result;
  }
  if(ve.tag){
    return `<${ve.tag}${parseAttributes(ve.attributes)}>${await parseCore(ve.children, ssrsx, httpServer)}</${ve.tag}>`;
  }

  return '';
};

const parse = async (root: JSX.Children, httpServer: object, userContext: unknown): Promise<string> => {
  //console.log('★★★★★★★★★★★★★★★★');
  const ssrsx: SsrsxContext = {
    context: userContext,
    parseContext: {},
    //functionComponentContext: {finalize: undefined},
  };
  //const parseContext = {};
  const result = await parseCore(root, ssrsx, httpServer);
  //console.log('★★★★★★★★★★★★★★★★', parseContext);
  return result;
};

////////////////////////////////////////////////////////////////////////////////

export { Fragment, parse };
export type { SsrsxContext, SsrsxFunctions };
