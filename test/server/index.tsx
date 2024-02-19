import Koa from 'koa';
import { setStyle } from '../../index';
import { getLoginUser } from './lib/session';
import { Html } from './components/Html';
import { Head } from './components/Head';

interface LoginInfo {
  username: string;
  password: string;
}

const handler = (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => {

  const user = getLoginUser(ctx);
  if(user?.username){
    ctx.redirect('/app');
    return;
  }

  setStyle({
    'html': {
      width: '100%',
      height: '100%',
    },
    'body': {
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
    },
    '.login-form': {
      width: 300,
      padding: 20,
      backgroundColor: '#ffffff',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0px',
    },
  });

  ctx.body = <>
    <Html header={<Head title='Login'/>}>
      <div className="container">
        <div className="login-form">
          <div style={{textAlign: 'center'}}>Login</div>
          <form method="post" action="/login">
            <div>
              <label>Username:
                <input type="text" name="username" onInput="index.onInputUsername"/>
              </label>
            </div>
            <div>
              <label>Password:
                <input type="password" name="password" onInput="index.onInputPassword"/>
              </label>
            </div>
            <div>
              <input type="submit" name="login" value="login" />
            </div>
          </form>
        </div>
      </div>
    </Html>
  </>;
};

export default handler;
export type { LoginInfo };
