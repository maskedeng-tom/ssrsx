import path from 'path';

////////////////////////////////////////////////////////////////////////////////

const addHref = (pathname: string, href: string) => {
  let targetFullUrl = href;
  if((href.slice(0,1) !== '/')){
    if(pathname.slice(-1) === '/'){
      targetFullUrl = `${pathname}${href}`;
    }else{
      targetFullUrl = `${pathname.split('/').slice(0,-1).join('/')}/${href}`;
    }
  }
  return path.normalize(targetFullUrl);
};

////////////////////////////////////////////////////////////////////////////////

export { addHref };
