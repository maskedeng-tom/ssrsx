import { Redirect, useScopedStyle, useLocation } from '../../index';
import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import Menu from './Menu';

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
      SUB - {user?.username}
    </div>
    <div>
      <a href='/logout'>Logout</a>
    </div>
    <div>
      <a href='/app'>App</a>
    </div>
    <div>
      <Menu/>
    </div>
  </>;
};

export default App;
export { App };