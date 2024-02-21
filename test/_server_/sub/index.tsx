import Koa from 'koa';
import { getLoginUser } from '../lib/session';
import { Html } from '../components/Html';
import { Head } from '../components/Head';
import { setScopedStyle } from '../../../index';

const handler = (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => {

  const user = getLoginUser(ctx);
  if(!user?.username){
    ctx.redirect('/');
    return;
  }

  const scope = setScopedStyle({
    'div':{
      color: 'red'
    }
  });

  return <>
    <Html header={<Head title='App'/>}>
      <div {...scope}>
        SUB - {user?.username}
      </div>
      <div>
        <a href="/logout">Logout</a>
      </div>
      <div>
        <a href="/app">App</a>
      </div>
    </Html>
  </>;
};

export default handler;