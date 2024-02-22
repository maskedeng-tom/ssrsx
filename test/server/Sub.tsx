import { Redirect, setScopedStyle, routerPath, getKoa } from '../../index';
import { getLoginUser } from './session';
import { UserContext } from './AppRouter';

const App = () => {

  const koa = getKoa();

  const user = getLoginUser(koa.ctx);
  if(!user?.username){
    return <Redirect to="/"/>;
  }

  const scope = setScopedStyle({
    'div':{
      color: 'red'
    }
  });

  return <>
    <div {...scope}>
      SUB - {user?.username}
    </div>
    <div>
      <a href={routerPath('/logout')}>Logout</a>
    </div>
    <div>
      <a href={routerPath('/app')}>App</a>
    </div>
  </>;
};

export default App;
export { App };