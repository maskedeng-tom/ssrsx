import { getLoginUser } from './session';
import { UserContext } from './AppRouter';
import { setScopedStyle, Redirect, routerPath, getKoa } from '../../index';

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
      APP - {user?.username}
    </div>
    <div>
      <a href={routerPath('/logout')}>Logout</a>
    </div>
    <div>
      <a href={routerPath('/sub')}>Sub</a>
    </div>
  </>;
};

export default App;
