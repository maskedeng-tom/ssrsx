import { setStyle, Redirect, routerPath, getKoa } from '../../index';
import { getLoginUser } from './session';
import { UserContext } from './AppRouter';

interface LoginInfo {
  username: string;
  password: string;
}

const Index = () => {
  const koa = getKoa();

  const user = getLoginUser(koa.ctx);
  if(user?.username){
    return <Redirect to="/app"/>;
  }

  setStyle({
    '.login-form': {
      width: 300,
      padding: 20,
      backgroundColor: '#ffffff',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0px',
    },
  });

  return <>
    <div className="login-form">
      <div style={{textAlign: 'center'}}>Login</div>
      <form method="post" action={routerPath('/login')}>
        <div>
          <label>Username:
            <input type="text" name="username" onInput="index.onInputUsername"/>
          </label>
        </div>
        <div>
          <label>Password:
            <input type="password" name="password" onInput="index.onInputPassword"/>
          </label>
        </div>
        <div>
          <input type="submit" name="login" value="login" />
        </div>
      </form>
    </div>
  </>;
};

export default Index;
export type { LoginInfo };
