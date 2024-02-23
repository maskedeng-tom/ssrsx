////////////////////////////////////////////////////////////////////////////////

// 仮想Element定義
interface VirtualElement_ {
  tag?: string;
  f?: FunctionComponent;
  fragment?: boolean;
  props?: Props;
  attributes?: {[key:string]: unknown};
  key?: string | number;
  children?: VirtualChildren;
}

type VirtualElement = VirtualElement_ | Promise<VirtualElement_>;

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

const jsx = (
  tag: string | FunctionComponent,
  props: Props | undefined,
  _key?: string | number,
): VirtualElement => {
  const {children, ...attributes} = props || {};
  if (typeof tag === 'function') {
    return {f: tag, props};
  }
  return {tag, attributes, children};
};

////////////////////////////////////////////////////////////////////////////////

const jsxs = (
  tag: string | FunctionComponent,
  props: Props | undefined,
  key?: string | number,
): VirtualElement => {
  return jsx(tag, props, key);
};

////////////////////////////////////////////////////////////////////////////////

const Fragment = (
  props: Props | undefined,
): VirtualElement => {
  const {children, key, ..._rest} = props || {};
  return {fragment: true, children, key: key as string | number};
};

////////////////////////////////////////////////////////////////////////////////

export { jsx, jsxs, Fragment };
export { VirtualElement_, VirtualElement, VirtualChildren };
