import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { setScopedStyle, Redirect, routerPath, getKoa } from '../../index';

const Free = () => {

  return <>
    <div>
      Free
    </div>
    <div>
      <img src="assets/image.jpg?a=3"/>
    </div>
    <div>
      <a href={routerPath('/logout')}>Logout</a>
    </div>
    <div>
      <a href={routerPath('/sub')}>Sub</a>
    </div>
  </>;
};

export default Free;
