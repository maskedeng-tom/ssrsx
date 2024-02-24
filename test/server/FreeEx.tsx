import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { useScopedStyle, Redirect, useLocation, Link, useParams } from '../../index';

const Free = () => {

  const params = useParams<object>();

  return <>
    <div>
      FreeEx : {JSON.stringify(params)}
    </div>
    <div>
      <img src='/assets/image.jpg'/>
    </div>
    <div>
      <Link tag="a" to={'/logout'}>Logout</Link>
    </div>
    <div>
      <Link tag="a" to={'/app'}>App</Link>
    </div>
  </>;
};

export default Free;
