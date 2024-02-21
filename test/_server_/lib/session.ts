import Koa from 'koa';
import { v4 } from 'uuid';

////////////////////////////////////////////////////////////////////////////////

interface SessionData {
  key?: string;
}

const session = (ctx: Koa.Context) => {
  return (ctx.session as unknown as SessionData);
};

////////////////////////////////////////////////////////////////////////////////

const loginUsers: { [key: string]: {username: string} } = {};

const getLoginUser = (ctx: Koa.Context) => {
  const s = session(ctx);
  if(!s.key){
    return undefined;
  }
  return loginUsers[s.key];
};

const loginUser = (ctx: Koa.Context, params: {username: string}) => {
  const s = session(ctx);
  const key = v4();
  s.key = key;
  loginUsers[key] = params;
};

const logoutUser = (ctx: Koa.Context) => {
  const s = session(ctx);
  if(!s.key){
    return;
  }
  delete loginUsers[s.key];
  s.key = '';
};

////////////////////////////////////////////////////////////////////////////////

export { /*session, SessionData, */getLoginUser, loginUser, logoutUser };
