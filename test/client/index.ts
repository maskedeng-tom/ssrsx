import $ from 'jquery';

const username = $('input[name="username"]');
const password = $('input[name="password"]');
const submit = $('input[name="login"]');

const check = () => {
  if(username.val() && password.val()) {
    submit.prop('disabled', false);
  }else{
    submit.prop('disabled', true);
  }
  setTimeout(() => {
    throw new Error('test');
  }, 1000);
};
check();

const onInputUsername = (_e: Event) => {
  check();
};

const onInputPassword = (_e: Event) => {
  check();
};

export { onInputUsername, onInputPassword };
