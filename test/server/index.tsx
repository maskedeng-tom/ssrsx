//import Koa from 'koa';
import { setStyle } from '../../index';
import { KoaProps, SsrsxOptions } from '../../src';
//import { getLoginUser } from './lib/session';
//import { Html } from './components/Html';
//import { Head } from './components/Head';
import { UserContext } from '../index';

interface LoginInfo {
  username: string;
  password: string;
}

const Index = ({koa, ssrsx}: {ssrsx?: SsrsxOptions<UserContext>, koa?: KoaProps}) => {

  //console.log('--------=>', koa);
  //console.log('--------=>', ssrsx);

  /*
  const user = getLoginUser(ctx);
  if(user?.username){
    ctx.redirect('/app');
    return;
  }
  */

  setStyle({
    'html': {
      width: '100%',
      height: '100%',
    },
    'body': {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      '*' : {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }
    },
    '.container': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
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
    <div className="container">
      <div className="login-form">
        <div style={{textAlign: 'center'}}>Login</div>
        <form method="post" action="/login">
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
    </div>
  </>;
};

export default Index;
export type { LoginInfo };
