import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { useScopedStyle, Redirect, useLocation, Link } from '../../index';

const Free = () => {

  return <>
    <div>
      Free
    </div>
    <div>
      <img src="/assets/image.jpg?a=3"/>
    </div>
    <div>
      <Link tag="a" href={'/logout'}>Logout</Link>
    </div>
    <div>
      <Link tag="a" href={'/app'}>App</Link>
    </div>
  </>;
};

export default Free;
