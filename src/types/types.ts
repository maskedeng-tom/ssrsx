import { CSSStyle } from './cssTypes';

////////////////////////////////////////////////////////////////////////////////

// 仮想Element定義
type VirtualElement = string;

////////////////////////////////////////////////////////////////////////////////

// text node
type VirtualTextNode = string | number | boolean | Date | object;

////////////////////////////////////////////////////////////////////////////////

// 仮想子ノード
type VirtualChildNode = VirtualElement | VirtualTextNode | null | undefined;
type VirtualChildNodes = VirtualChildNode[];
type VirtualChildren = VirtualChildNodes | VirtualChildNode;

////////////////////////////////////////////////////////////////////////////////

// 関数コンポーネント引数
type Props = {
  children?: VirtualChildren;
  [key:string]: unknown;
};

// 関数コンポーネント 定義
type FunctionComponent<T = Props | null | undefined> = (props: T) => VirtualElement;

////////////////////////////////////////////////////////////////////////////////

// スタイル 定義
type StyleProps = CSSStyle & {[key:string]: string | number | undefined | null | (string | number)[]};
type SassStyleProps = CSSStyle | {[key:string]: SassStyleProps | string | number | undefined | null | (string | number)[]};

//////////////////////////////////////////////////////////////////////////////

export { VirtualElement, VirtualChildren };
export { FunctionComponent, Props };
export { StyleProps, SassStyleProps };
