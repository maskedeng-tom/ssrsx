import { Redirect, getKoa } from '../../index';
import { logoutUser } from './session';
import { UserContext } from './AppRouter';

const Logout = () => {
  const koa = getKoa();

  logoutUser(koa.ctx);
  return <Redirect to="/"/>;
};

export default Logout;