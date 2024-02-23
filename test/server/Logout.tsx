import { Redirect } from '../../index';
import { logoutUser } from './session';
import { UserContext } from './AppRouter';

const Logout = () => {
  logoutUser();
  return <Redirect to="/"/>;
};

export default Logout;