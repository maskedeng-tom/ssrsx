import { Redirect, useBody } from '../../index';
import { loginUser } from './session';
import { LoginInfo } from './LoginForm';
import { UserContext } from './AppRouter';

const Login = () => {
  const body = useBody<{username: string}>();
  loginUser({username: body.username});
  return <Redirect to="/app"/>;
};

export default Login;