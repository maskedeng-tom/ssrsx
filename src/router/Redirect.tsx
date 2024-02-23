import { useNavigate } from './hooks/useNavigate';

////////////////////////////////////////////////////////////////////////////////

const Redirect = ({to}:{to: string,}) => {
  const navigate = useNavigate();
  navigate(to);
  return <></>;
};

export default Redirect;
export { Redirect };