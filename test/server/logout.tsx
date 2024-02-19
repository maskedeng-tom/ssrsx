import Koa from 'koa';
import { logoutUser } from './lib/session';

const handler = (ctx: Koa.Context, next: Koa.Next, userContext: unknown) => {
  logoutUser(ctx);
  ctx.redirect('/');
};

export default handler;