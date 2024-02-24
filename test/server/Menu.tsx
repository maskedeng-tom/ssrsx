import { getLoginUser } from './session';
import { useScopedStyle, Redirect, Link } from '../../index';

const Menu = () => {

  const scope = useScopedStyle({
    '.menu':{
      'li':{
        color: 'green'
      },
      'li.active':{
        color: 'red'
      }
    }
  });

  const user = getLoginUser();
  if(!user?.username){
    return <Redirect to="/"/>;
  }

  return <>
    <ul {...scope} className="menu">
      <hr/>
      <Link {...scope} tag="li" to={'/app'}>App</Link>
      <Link {...scope} tag="li" to={'/sub?a=d'}>SUB</Link>
      <hr/>
      <Link
        {...scope}
        tag="li"
        to={'./app'}
        style={(isActive:boolean)=>isActive ? {color:'blue'} : null}
      >./App</Link>
      <Link
        {...scope}
        tag="li"
        to={'./sub'}
        className={(isActive:boolean)=>isActive ? 'active' : null}
      >./SUB</Link>
      <hr/>
      <Link {...scope} tag="li" to={'/app'}>
        {(isActive:boolean)=>isActive ? '[App]' : 'App'}
      </Link>
      <Link {...scope} tag="li" to={'/sub?a=d'}>
        {(isActive:boolean)=>isActive ? '[Sub]' : 'Sub'}
      </Link>
    </ul>
  </>;
};

export default Menu;
