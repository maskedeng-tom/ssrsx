import { setStyle } from '../../index';
import { Router, Routes, Route } from '../../index';

////////////////////////////////////////////////////////////////////////////////

import Index from './Index';
import Login from './Login';
import Logout from './Logout';
import App from './App';
import Sub from './Sub';
import Free from './Free';

////////////////////////////////////////////////////////////////////////////////

interface UserContext {
  db: string;
}

const AppRouter = () => {
  //
  setStyle({
    html:{
      width: '100%',
      height: '100%',
    },
    body:{
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      '*' : {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }
    },
    '.container': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      '.inner': {
        width: 'auto',
        padding: 20,
        backgroundColor: '#ffffff',
      },
    },
  });
  //
  return <>
    <Router>
      <html lang="ja">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title></title>
        </head>
        <body>
          <div className="container">
            <div className="inner">
              <Routes>

                <Route path="/">
                  <Index/>
                </Route>

                <Route path="free">
                  <Free/>
                </Route>

                <Route path="login">
                  <Login/>
                </Route>

                <Route path="logout">
                  <Logout/>
                </Route>

                <Route path="app">
                  <App/>
                </Route>

                <Route path="sub">
                  <Sub/>
                </Route>

                <Route path="*">
                  <div>404</div>
                </Route>

              </Routes>
            </div>
          </div>
        </body>
      </html>
    </Router>
  </>;
  //
};

export default AppRouter;
export { AppRouter };
export type { UserContext };
