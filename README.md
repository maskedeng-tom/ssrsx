# Server Side Renderer with tsx,jsx

## Table of Contents

- [Basic Usage with Koa](#basic-usage-with-koa)
- [Basic Usage with express](#basic-usage-with-express)
- [with Router](#with-router)



## Basic Usage with Koa

```bash
npm install @maskedeng-tom/ssrsx
npm install koa @types/koa
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",
    "jsx": "react-jsx",       // !important
    "jsxImportSource": "jsx", // !important
    "module": "CommonJS",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

```tsx
// index.tsx
import Koa from 'koa';
import { ssrsxKoa } from '@maskedeng-tom/ssrsx';

const App = () => {
  return <>
    <div>
      Hello Ssrsx world !
    </div>
  </>;
};

const app = new Koa();

app.use(ssrsxKoa({
  development: true,
  app: <App/>
}));

app.listen(3000);

```

```bash
npm install
npm run start
```

[http://localhost:3000/](http://localhost:3000/)

## Basic Usage with express

```bash
npm install @maskedeng-tom/ssrsx
npm install express @types/express
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",
    "jsx": "react-jsx",       // !important
    "jsxImportSource": "jsx", // !important
    "module": "CommonJS",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

```tsx
// index.tsx
import express from 'express';
import { ssrsxExpress } from '@maskedeng-tom/ssrsx';

const App = () => {
  return <>
    <div>
      Hello Ssrsx world !
    </div>
  </>;
};

const app = express();

app.use(ssrsxExpress({
  development: true,
  app: <App/>
}));

app.listen(3000);

```

```bash
npm install
npm run start
```

[http://localhost:3000/](http://localhost:3000/)

## with Router

```tsx
// index.tsx
import Koa from 'koa';
import { ssrsxKoa, Router, Routes, Route, Link } from '@maskedeng-tom/ssrsx';

const Page1 = () => {
  return <div>
    <div>Page1</div>
    <div><Link to="/page2">Link to Page2</Link></div>
    <div><Link to="/">Top</Link></div>
  </div>;
};

const Page2 = () => {
  return <div>
    <div>Page2</div>
    <div><Link to="/page1">Link to Page1</Link></div>
    <div><Link to="/">Top</Link></div>
  </div>;
};

const App = () => {
  return <html lang="en">
    <head>
      <meta charSet="UTF-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <div>
        <Router>
          <Routes>
            <Route path="/">
              <div>
                <div>Hello Ssrsx world !</div>
                <div><Link to="/page1">Link to Page1</Link></div>
                <div><Link to="/page2">Link to Page2</Link></div>
              </div>
            </Route>
            <Route path="/page1"><Page1/></Route>
            <Route path="/page2"><Page2/></Route>
          </Routes>
        </Router>
      </div>
    </body>
  </html>;
};

const app = new Koa();

app.use(ssrsxKoa({
  development: true,
  app: <App/>
}));

app.listen(3000);

```

## with client script

```bash
mkdir src
mkdir src/client
```

```ts




```

```tsx
// index.tsx
```

```tsx
// index.tsx
```




