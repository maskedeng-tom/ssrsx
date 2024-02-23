import { useGlobalStyle, Redirect, /*routerPath, */useContext, isKoaServer, useServer, KoaServer, ExpressServer, useLocation } from '../../index';
import { getLoginUser } from './session';
import { UserContext } from './AppRouter';

interface LoginInfo {
  username: string;
  password: string;
}

const Index = () => {

  useGlobalStyle({
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

  const context = useContext<UserContext>();
  console.log('=context=>', context);

  const location = useLocation();
  console.log('=location=>', location);

  /*
  const koa = useServer<KoaServer>();
  console.log('-->', koa?.ctx);
  //
  const express = useServer<ExpressServer>();
  console.log('-->', express?.req);
  */

  const user = getLoginUser();
  if(user?.username){
    return <Redirect to="/app"/>;
  }

  return <>
    <div className="login-form">
      <div style={{textAlign: 'center'}}>Login</div>
      <form method="post" action='/login'>
        <div>
          <label>Username:
            <input type="text" id="username" name="username" onInput="index.onInputUsername" value="def"/>
          </label>
        </div>
        <div>
          <label>Password:
            <input type="password" name="password" onInput="index.onInputPassword"/>
          </label>
        </div>
        <div>
          <input type="submit" name="login" value="login" disabled/>
        </div>
      </form>
    </div>
  </>;
};

export default Index;
export type { LoginInfo };
