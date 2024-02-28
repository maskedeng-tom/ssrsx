# Server Side Renderer with tsx

[![npm version](https://badge.fury.io/js/%40maskedeng-tom%2Fssrsx.svg)](https://badge.fury.io/js/%40maskedeng-tom%2Fssrsx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

-----

## Table of Contents

- [Basic Usage with Koa](#basic-usage-with-koa)
  - [install](#install)
  - [tsconfig.json](#tsconfigjson)
  - [server side](#server-side)
  - [start application](#start-application)
- [with express](#with-express)
- [with Router](#with-router)
- [with Client script](#with-client-script)
- [with jQuery](#with-jquery)
- [with jQuery from CDN](#with-jquery-from-cdn)
- [use POST method](#use-post-method)
  - [express body parser](#express-body-parser)
- [use session](#use-session)
- [with CSP (Content Security Policy)](#with-csp-content-security-policy)
  - [CSP with Koa](#csp-with-koa)
  - [CSP with express](#csp-with-express)
- [user Context](#user-context)
  - [for Koa](#for-koa)
  - [for Express](#for-express)
- [async Component](#async-component)
- [Contributing](#contributing)
- [Credits](#credits)
- [Authors](#authors)
- [Show your support](#show-your-support)
- [License](#license)

-----

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

### start application

```bash
npm install
npm run start
```

and access to [http://localhost:3000/](http://localhost:3000/)

-----

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

-----

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

-----

## with Client script

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

### server side

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

-----

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

-----

## with jQuery from CDN

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

-----

## use POST method

You can get the data sent by the POST method by using the `useBody` function.
and You need to add a `body parser` to get the data sent by the POST method.

```tsx
// index.tsx
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';  // add body parser
import { ssrsxKoa, Router, Routes, Route, Link, useBody } from '../';

////////////////////////////////////////////////////////////////////////////////

const LoginCheck = () => {
  // post body data
  const body = useBody<{username: string, password: string}>();
  //
  return <>
    <h1>Login Post Result</h1>
    <div>
      <div>Username: {body.username}</div>
      <div>Password: {body.password}</div>
    </div>
    <Link to="/">Top</Link>
  </>;
};

const LoginForm = () => {
  return <>
    <h1>Login Form</h1>
    <form method="post" action="/login">
      <div>
        <label>
          username: <input type="text" name="username" />
        </label>
      </div>
      <div>
        <label>
          password: <input type="password" name="password" />
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
  </>;
};

const App = () => {
  return <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <Router>
        <Routes>
          <Route path="/"><LoginForm /></Route>
          <Route path="/login"><LoginCheck /></Route>
        </Routes>
      </Router>
    </body>
  </html>;
};

const app = new Koa();

// body parser
app.use(bodyParser());

app.use(ssrsxKoa({
  development: true,
  clientRoot: 'test/client',
  app: <App/>
}));

app.listen(3000);
```

### express body parser

```tsx
// index.tsx
...
// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
...
```

-----

## use session

```tsx
// index.tsx
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';  // add body parser
import session from 'koa-session';        // add session  
//
import { ssrsxKoa, ssrsxExpress, useSearch } from '../';
import { Router, Routes, Route, Link, Navigate, useBody, useSession } from '../';

////////////////////////////////////////////////////////////////////////////////

interface SessionContext {
  username?: string;
}

const Authorized = () => {
  // session
  const session = useSession<SessionContext>();
  if(!session.username){
    // not authorized
    return <Navigate to="/"/>;
  }
  // authorized
  return <>
    <h1>Authorized</h1>
    <div>
      <div>Authorized Username: {session.username}</div>
    </div>
    <Link to="/logout">Logout</Link>
  </>;
};

const Login = () => {
  // session
  const session = useSession<SessionContext>();
  // post body data
  const body = useBody<{username: string, password: string}>();
  // check username and password
  if(body.username === 'admin' && body.password === 'admin'){
    session.username = body.username;
    return <Navigate to="/authorized"/>;
  }
  // authorization failed
  return <Navigate to="/?message=authorization_failed"/>;
};

const Logout = () => {
  // set session
  const session = useSession<SessionContext>();
  // session clear
  session.username = undefined;
  // redirect to top
  return <Navigate to="/"/>;
};

const LoginForm = () => {
  // get search(query parameter) data (?message=...)
  const search = useSearch<{message: string}>();
  // set session
  const session = useSession<SessionContext>();
  if(session.username){
    // already authorized
    return <Navigate to="/authorized"/>;
  }
  // login form
  return <>
    <h1>Login Form</h1>
    <form method="post" action="/login">
      <div>
        <label>
          username: <input type="text" name="username" />
        </label>
      </div>
      <div>
        <label>
          password: <input type="password" name="password" />
        </label>
      </div>
      {
        search.message && <div>{search.message}</div>
      }
      <button type="submit">Login</button>
    </form>
  </>;
};

const App = () => {
  return <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <title>Ssrsx</title>
    </head>
    <body>
      <Router>
        <Routes>
          <Route path="/"><LoginForm /></Route>
          <Route path="/login"><Login /></Route>
          <Route path="/logout"><Logout /></Route>
          <Route path="/authorized"><Authorized /></Route>
        </Routes>
      </Router>
    </body>
  </html>;
};

const app = new Koa();

app.keys = ['your custom secret'];  // session key
app.use(session(app));              // add session

app.use(bodyParser());

app.use(ssrsxKoa({
  development: true,
  clientRoot: 'test/client',
  app: <App/>
}));

app.listen(3000);
```

-----

## with CSP (Content Security Policy)

Setting CSP (Content Security Policy) requires allowing `ws://` to communicate with WebSocket for ssrsx HotReload (`development: true`).

Also, because inline scripts are used internally, you need to allow `'unsafe-inline'` or `'nonce-${nonce}'`.

### CSP with Koa

```tsx
// index.tsx
import helmet from 'koa-helmet';
import crypto from 'crypto';
...
if(process.env.NODE_ENV === 'production'){
  app.use(helmet());
  app.use((ctx, next) => {
    // set nonce to state
    ctx.state.nonce = crypto.randomBytes(16).toString('base64');
    //
    return helmet.contentSecurityPolicy({ directives: {
      defaultSrc: ['\'self\'','ws'],        // add 'ws'
      connectSrc: ['\'self\'','ws://*:*'],  // add 'ws://*:*'
      scriptSrc: [
        '\'self\'',
        `'nonce-${ctx.state.nonce}'`,       // add 'nonce-??' or 'unsafe-inline'
      ],
    }})(ctx, next) as Koa.Middleware;
  });
}
```

### CSP with express

```tsx
// index.tsx
import helmet from 'helmet';
import crypto from 'crypto';
...
if(process.env.NODE_ENV === 'production'){
  app.use(helmet());
  app.use((req, res, next) => {
    // set nonce to locals
    (res as express.Response).locals.nonce = crypto.randomBytes(16).toString('base64');
    //
    helmet.contentSecurityPolicy({ directives: {
      defaultSrc: ['\'self\'','ws'],        // add 'ws'
      connectSrc: ['\'self\'','ws://*:*'],  // add 'ws://*:*'
      scriptSrc: [
        '\'self\'',
        // add 'nonce-??' or 'unsafe-inline'
        (req, res) => `'nonce-${(res as express.Response).locals?.nonce}'`,
      ],
    }})(req, res, next);
  });
}
...
```

-----

## User Context

User context can be set with the `context` property of the `ssrsx(Koa or Express)` function.

The `context` function is called every time it is rendered.

You can use the `useContext` function to get the user context value.

### for Koa

```tsx
interface UserContext {
  lang: string;
}

const App = () => {
  const user = useContext<{UserContext}>();
  return <div>Lang: {user.lang}</div>;
};

...

app.use(ssrsxKoa({
  ...
  context: (ctx, next): UserContext => {
    return {
      lang: 'en',
    };
  },
}));
```

### for Express

```tsx
interface UserContext {
  lang: string;
}

const App = () => {
  const user = useContext<{UserContext}>();
  return <div>Lang: {user.lang}</div>;
};

...

app.use(ssrsxExpress({
  ...
  context: (req, res, next): UserContext => {
    return {
      lang: 'en',
    };
  },
}));
```

-----

## async Component

In Ssrsx, you cannot perform asynchronous processing using `useState` or `useEffect` etc. , but you can create asynchronous components.

The ssrsx `context` function is called every time it is rendered, so when specifying something like a database instance, create the instance externally and specify it in the `context` function.

```tsx
import { Redis } from 'ioredis';

interface UserContext {
  redis: Redis;
}

const isAuthorized = async (username: string, password: string) => {
  const context = useContext<UserContext>();
  const value = await context.redis.get(username);
  return value === password;
};

// async component
const LoginCheck = async () => {
  // post body data
  const body = useBody<{username: string, password: string}>();

  // check login
  const isLogin = await isAuthorized(body.username, body.password);
  if(!isLogin){
    return <Navigate to="/"/>;
  }

  return <>
    <h1>Login OK !</h1>
    <div>
      <div>Username: {body.username}</div>
      <div>Password: {body.password}</div>
    </div>
    <Link to="/">Top</Link>
  </>;
};

...

// create redis instance
const redis = new Redis();

app.use(ssrsxKoa({
  ...
  context: (ctx, next): UserContext => {
    return {
      redis,
    };
  },
}));

```

-----

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

-----

## Credits

昨今の複雑化していく開発現場にシンプルな力を！ :muscle:

> Simplify the complex development landscape of today! :muscle:

-----

## Authors

**Maskedeng Tom** - *Initial work* - [Maskedeng Tom](https://github.com/maskedeng-tom)

:smile: [プロジェクト貢献者リスト](https://github.com/maskedeng-tom/ssrsx/contributors) :smile:

> See also the list of [contributors](https://github.com/maskedeng-tom/ssrsx/contributors) who participated in this project.

-----

## Show your support

お役に立った場合はぜひ :star: を！

> Please :star: this repository if this project helped you!

-----

## License

[MIT License](https://github.com/maskedeng-tom/ssrsx/blob/main/LICENSE.txt) © Maskedeng Tom

## TODOs

BugFix

- [x] `/(.*)`
- [x] event-loader.js:12 Uncaught TypeError: Cannot read properties of undefined (reading 'requireJsConfig')

Change

- [x] ignore favicon.ico
- [x] hot reload wait for ws started
- [x] support Last-Modified
- [x] useHead support
- [x] nested css support -> useCSSNesting
