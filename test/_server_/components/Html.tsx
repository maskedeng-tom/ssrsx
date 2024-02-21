const Html = ({ header, children }:{ header?: JSX.Children, children?: JSX.Children }) => {
  return (<>
    <html lang="ja">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {header}
      </head>
      <body>
        {children}
      </body>
    </html>
  </>);
};

export { Html };