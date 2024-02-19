const Html = ({ header, children }:{ header?: JSX.Children, children?: JSX.Children }) => {
  return (<>
    <html>
      <head>
        {header}
      </head>
      <body>
        {children}
      </body>
    </html>
  </>);
};

export { Html };