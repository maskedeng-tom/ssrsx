declare namespace JSX {

  // 仮想Element定義
  type Element = import('./src/types/types').VirtualElement;

  // スタイル引数
  type StyleProps = import('./src/types/types').StyleProps;

  // 仮想子ノード
  type Children = import('./src/types/types').VirtualChildren;

  // エレメントの子ノードの定義 => children
  interface ElementChildrenAttribute {
    children: Children;
  }

  //////////////////////////////////////////////////////////////////////////////

  // event for all
  interface lIntrinsicElementsProps {
    style?: string | StyleProps | {[key:string] : unknown};
    className?: string | string[] | {[name: string]: boolean};
    [key:string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  //////////////////////////////////////////////////////////////////////////////

  // エレメントの定義
  interface IntrinsicElements {
    [elementName: string]: lIntrinsicElementsProps;
  }

}
