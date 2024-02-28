import { SassStyles, ignorePixelStyle } from './cssTypes';
import { camel2Kebabu, kebabu2Camel } from './changeCase';

////////////////////////////////////////////////////////////////////////////////

const convertToCssValue = (selector: string, value: number | string): string => {
  if(typeof value === 'number'){
    const enableAppendPx = (ignorePixelStyle.indexOf(kebabu2Camel(selector)) < 0) && (ignorePixelStyle.indexOf(selector) < 0);
    return enableAppendPx? `${value}px`: String(value);
  }
  return value;
};

////////////////////////////////////////////////////////////////////////////////

const convertToCss = (selector: string, value: number | string | (number | string)[]): string => {
  if(typeof value === 'string' || typeof value === 'number'){
    return `${camel2Kebabu(selector)}:${convertToCssValue(selector, value)};`;
  }
  const styleValue = value.map(v => convertToCssValue(selector, v)).join((' '));
  return `${camel2Kebabu(selector)}:${styleValue};`;
};

////////////////////////////////////////////////////////////////////////////////

const nestedStyleToStringCore = (sass: SassStyles): string => {
  //
  if (typeof sass === 'string') {
    return sass;
  }

  const result: string[] = [];

  for (const key in sass) {
    const value = sass[key as keyof SassStyles];
    if(typeof value === 'boolean' || value === undefined || value === null){
      continue;
    }

    if(Array.isArray(value)){
      const values: string[] = [];
      for(const item of value){
        if(item){
          values.push(convertToCssValue(key, item));
        }
      }
      result.push(convertToCss(key, values.join(' ')));
    }else if (typeof value === 'object') {
      result.push(`${key}{${nestedStyleToStringCore(value)}}`);
    }else if(typeof value === 'number'){
      result.push(convertToCss(key, value));
    }else if(typeof value === 'string'){
      result.push(convertToCss(key, value));
    }
  }

  //
  return result.join('');
};

////////////////////////////////////////////////////////////////////////////////

const nestedStyleToString = (sass: SassStyles, scope?: string): string => {
  const result = nestedStyleToStringCore(sass);
  return result.replace(/::v-scope/g, `[${scope}]`).replace(/::v-deep/g, `[${scope}]`);
};

////////////////////////////////////////////////////////////////////////////////

export { nestedStyleToString };