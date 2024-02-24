# Server Side Renderer with tsx,jsx

[![npm version](https://badge.fury.io/js/%40maskedeng-tom%2Fssrsx.svg)](https://badge.fury.io/js/%40maskedeng-tom%2Fssrsx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Basic Usage with Koa](#basic-usage-with-koa)
- [with express](#with-express)
- [with Router](#with-router)
- [with client script](#with-client-script)
- [with jQuery](#with-jquery)
- [with jQuery with CDN](#with-jquery-with-cdn)
- [Contributing](#contributing)
- [Credits](#credits)
- [Authors](#authors)
- [Show your support](#show-your-support)
- [License](#license)

<br/>

## Basic Usage with Koa

### install

```bash
npm install @maskedeng-tom/ssrsx
npm install koa @types/koa
```

### tsconfig.json

- change `jsx` and `jsxImportSource` to `react-jsx` and `jsx` respectively.

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

### server side

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

### start

```bash
npm install
npm run start
```

and access to [http://localhost:3000/](http://localhost:3000/)

<br/>

## with express

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

<br/>

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
            <Route path="page1"><Page1/></Route>
            <Route path="page2"><Page2/></Route>
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

<br/>

## with client script

### create client script folder

```bash
mkdir src
mkdir src/client
```

### client script

- `[client module name].client.js` is a client script file.

```ts
// src/client/test.client.js
const onClick = (e: Event) => {
  alert('from js://test.onClick');
};

export { onClick }; // need export! important!
```

- server side

  - `js://` is a protocol to call client script function from ssrsx.

    `js://[client module name].[exported function name]`

```tsx
// index.tsx
import Koa from 'koa';
import { ssrsxKoa, useGlobalStyle } from '@maskedeng-tom/ssrsx';

const App = () => {

  useGlobalStyle({
    '.clickable': {
      cursor: 'pointer',
      color: 'blue',
      textDecoration: 'underline',
    },
  });

  return <html lang="en">
    <head>
      <meta charSet="UTF-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <div>

        <div onClick="alert('inline js')" className="clickable">
          Run inline js
        </div>
        <div onClick="js://test.onClick" className="clickable" >
          Run outside client js (src/client/test.client.js -&gt; onClick)
        </div>

      </div>
    </body>
  </html>;
};

const app = new Koa();

app.use(ssrsxKoa({
  development: true,
  clientRoot: 'src/client', // client script root
  app: <App/>
}));

app.listen(3000);
```

<br/>

## with jQuery

This is a sample using jQuery. External libraries are loaded using requirejs. Specify the root folder of the client script in clientRoot and the path to place modules such as jQuery in requireJsRoot.

- [requirejs](https://requirejs.org/)
- [requirejs with jQuery](https://requirejs.org/docs/jquery.html)

### install jQuery and create client script folder

```bash
npm install @maskedeng-tom/ssrsx
npm install koa @types/koa
npm install jquery @types/jquery

mkdir src
mkdir src/client
```

### copy jQuery script to client script folder

```bash
cp node_modules/jquery/dist/jquery.min.js src/client
```

### client script with jQuery

```ts
// src/client/test.client.js
import $ from 'jquery';

const onClick = (e: Event) => {
  const input = $('#username');
  alert(input.val());
};

export { onClick };
```

### server side with jQuery

```tsx
// index.tsx
import Koa from 'koa';
import { ssrsxKoa } from '@maskedeng-tom/ssrsx';

const App = () => {
  return <html lang="en">
    <head>
      <meta charSet="UTF-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <div>

        <div>
          <input type="text" id="username" name="username" value="foo"/>
        </div>

        <button type="text" onClick="js://test.onClick">
          Show input tag value!
        </button>

      </div>
    </body>
  </html>;
};

const app = new Koa();

app.use(ssrsxKoa({
  development: true,
  clientRoot: 'src/client',
  requireJsRoot: 'src/client',  // for requirejs
  requireJsPaths: {             // for requirejs.config paths
    'jquery': 'jquery.min',     // define for jquery (cut '.js' extension)
  },
  app: <App/>
}));

app.listen(3000);
```

<br/>

## with jQuery with CDN

If you want to use a CDN, specify the same version of jQuery as the one you installed with `npm install jquery`.

```tsx
// index.tsx
...
app.use(ssrsxKoa({
  development: true,
  clientRoot: 'src/client',
  requireJsRoot: 'src/client',
  requireJsPaths: {
    'jquery': 'https://code.jquery.com/jquery-3.7.1.min',
  },
  app: <App/>
}));
...
```

<br/>

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md)をお読みください。ここには行動規範やプルリクエストの提出手順が詳細に記載されています。

1. フォークする  
2. フィーチャーブランチを作成する：`git checkout -b my-new-feature`  
3. 変更を追加：`git add .`  
4. 変更をコミット：`git commit -am 'Add some feature'`  
5. ブランチをプッシュ：`git push origin my-new-feature`  
6. プルリクエストを提出 :sunglasses:  

> Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
>
> 1. Fork it!
> 2. Create your feature branch: `git checkout -b my-new-feature`
> 3. Add your changes: `git add .`
> 4. Commit your changes: `git commit -am 'Add some feature'`
> 5. Push to the branch: `git push origin my-new-feature`
> 6. Submit a pull request :sunglasses:

<br/>

## Credits

昨今の複雑化していく開発現場にシンプルな力を！ :muscle:

> Simplify the complex development landscape of today! :muscle:

<br/>

## Authors

**Maskedeng Tom** - *Initial work* - [Maskedeng Tom](https://github.com/maskedeng-tom)

:smile: [プロジェクト貢献者リスト](https://github.com/maskedeng-tom/ssrsx/contributors) :smile:

> See also the list of [contributors](https://github.com/maskedeng-tom/ssrsx/contributors) who participated in this project.

<br/>

## Show your support

お役に立った場合はぜひ :star: を！

> Please :star: this repository if this project helped you!

<br/>

## License

[MIT License](https://github.com/maskedeng-tom/ssrsx/blob/main/LICENSE.txt) © Maskedeng Tom
