import Koa from 'koa';
import { loginUser } from './lib/session';
import { LoginInfo} from './index';

const handler = (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => {
  loginUser(ctx, {username: String((ctx.request.body as LoginInfo).username)});
  ctx.redirect('/app');
};

export default handler;