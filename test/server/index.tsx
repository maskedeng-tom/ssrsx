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
    'body': {
      'background-color': '#f0f0f0',
      'font-family': 'Arial, sans-serif',
      'padding': '20px',
    },
    'form': {
      'border': '1px solid #e0e0e0',
      'padding': '20px',
      'background-color': '#ffffff',
      'box-shadow': '0px 0px 10px #e0e0e0',
    },
    'input': {
      'width': '100%',
      'padding': '10px',
      'margin': '10px 0px',
      'border': '1px solid #e0e0e0',
      'border-radius': '5px',
    },
    'input[type=submit]': {
      'background-color': '#007bff',
      'color': '#ffffff',
      'cursor': 'pointer',
    },
  });

  ctx.body = <>
    <Html header={<Head title='Login'/>}>
      <div>
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
    </Html>
  </>;
};

export default handler;
export type { LoginInfo };
