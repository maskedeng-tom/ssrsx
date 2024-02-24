declare namespace JSX {

  //////////////////////////////////////////////////////////////////////////////

  // virtual element
  type Element = import('./jsx/jsx-runtime').VirtualElement;

  // style props
  type CssProps = import('./src/styleToString/cssTypes').CssProps;

  // child nodes
  type Children = import('./jsx/jsx-runtime').VirtualChildren;

  // ext contexts
  type SsrsxContext = import('./jsx/jsx-parser').SsrsxContext;

  //////////////////////////////////////////////////////////////////////////////

  interface ElementChildrenAttribute {
    children: Children;
  }

  //////////////////////////////////////////////////////////////////////////////

  interface IntrinsicElements {
    [elementName: string]: {
      style?: string | CssProps;
      className?: string | string[] | {[name: string]: boolean};
      [key:string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  //////////////////////////////////////////////////////////////////////////////
}
