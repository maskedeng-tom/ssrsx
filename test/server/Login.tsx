import { Redirect, getKoa } from '../../index';
import { loginUser } from './session';
import { LoginInfo } from './Index';
import { UserContext } from './AppRouter';

const Login = () => {
  const koa = getKoa();
  loginUser(koa.ctx, {username: String((koa.ctx.request.body as LoginInfo).username)});
  return <Redirect to="/app"/>;
};

export default Login;