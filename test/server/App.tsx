import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { useScopedStyle, Redirect, Link, useLocation, useContext } from '../../index';
import Menu from './Menu';

const App = () => {

  const scope = useScopedStyle({
    'div':{
      color: 'red'
    }
  });

  const context = useContext<UserContext>();

  const user = getLoginUser();
  if(!user?.username){
    return <Redirect to="/"/>;
  }

  return <>
    <div {...scope}>
      APP - {user?.username} - {JSON.stringify(context)}
    </div>
    <div>
      <Link to='/logout' area-context="aaa">Logout</Link>
    </div>
    <div>
      <Link tag="button" to={'/sub'}>SUB</Link>
    </div>
    <div>
      <Menu/>
    </div>
  </>;
};

export default App;
