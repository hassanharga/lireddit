import { __ } from 'i18n';
import { UsernamePasswordInput } from 'src/resolvers/UsernamePasswordInput';

export const validateRegister = (payload: UsernamePasswordInput) => {
  // check for email length
  if (!payload.email.includes('@')) {
    return [
      {
        field: 'email',
        message: __('error.email.inValid'),
      },
    ];
  }

  // check for email length
  if (payload.username.includes('@')) {
    return [
      {
        field: 'username',
        message: __('error.username.inValid'),
      },
    ];
  }

  if (payload.username.length < 2) {
    return [
      {
        field: 'username',
        message: __('error.username.length', { number: '2' }),
      },
    ];
  }

  // check for password length
  if (payload.password.length < 2) {
    return [
      {
        field: 'password',
        message: __('error.password.length', { number: '2' }),
      },
    ];
  }

  return null;
};
