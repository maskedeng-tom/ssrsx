import Koa from 'koa';
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
