import ssrsx, { SsrsxOptions } from './src/';
import { initializeStyles, setStyle, setScopedStyle, getStyles, styleToString } from './src/core/cssSupport';
//
export default ssrsx;
export { ssrsx, SsrsxOptions };
export { initializeStyles, setStyle, setScopedStyle, getStyles, styleToString };

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {

  // 仮想Element定義
  export type Element = import('./src/types/types').VirtualElement;

  // スタイル引数
  export type StyleProps = import('./src/types/types').StyleProps;

  // 仮想子ノード
  export type Children = import('./src/types/types').VirtualChildren;

  // エレメントの子ノードの定義 => children
  export interface ElementChildrenAttribute {
    children: Children;
  }

  //////////////////////////////////////////////////////////////////////////////

  // event for all
  export interface lIntrinsicElementsProps {
    style?: string | StyleProps | {[key:string] : unknown};
    className?: string | string[] | {[name: string]: boolean};
    [key:string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  //////////////////////////////////////////////////////////////////////////////

  // エレメントの定義
  export interface IntrinsicElements {
    [elementName: string]: lIntrinsicElementsProps;
  }

}

export { JSX };
