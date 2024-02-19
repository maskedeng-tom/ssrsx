import Koa from 'koa';
import { getLoginUser } from './lib/session';
import { Html } from './components/Html';
import { Head } from './components/Head';

const handler = (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => {

  const user = getLoginUser(ctx);
  if(!user?.username){
    ctx.redirect('/');
    return;
  }

  ctx.body = <>
    <Html header={<Head title='App'/>}>
      <div>
        APP - {user?.username}
      </div>
      <div>
        <a href="/logout">Logout</a>
      </div>
    </Html>
  </>;
};

export default handler;