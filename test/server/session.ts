import { v4 } from 'uuid';
import { useSession } from '../../';

////////////////////////////////////////////////////////////////////////////////

interface SessionData {
  key?: string;
}

////////////////////////////////////////////////////////////////////////////////

const loginUsers: { [key: string]: {username: string} } = {};

const getLoginUser = () => {
  const s = useSession<SessionData>();
  if(!s.key){
    return undefined;
  }
  return loginUsers[s.key];
};

const loginUser = (params: {username: string}) => {
  const s = useSession<SessionData>();
  const key = v4();
  s.key = key;
  loginUsers[key] = params;
};

const logoutUser = () => {
  const s = useSession<SessionData>();
  if(!s.key){
    return;
  }
  delete loginUsers[s.key];
  s.key = '';
};

////////////////////////////////////////////////////////////////////////////////

export { getLoginUser, loginUser, logoutUser };
