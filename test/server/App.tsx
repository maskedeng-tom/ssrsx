import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { useScopedStyle, Redirect, /*routerPath, */Link, useLocation } from '../../index';

const App = () => {

  const scope = useScopedStyle({
    'div':{
      color: 'red'
    }
  });

  const user = getLoginUser();
  if(!user?.username){
    return <Redirect to="/"/>;
  }

  return <>
    <div {...scope}>
      APP - {user?.username}
    </div>
    <div>
      <Link href='/logout' area-context="aaa">Logout</Link>
    </div>
    <div>
      <Link tag="button" href={'/sub'}>SUB</Link>
    </div>
  </>;
};

export default App;
