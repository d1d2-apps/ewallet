export const mockSignUpErrorMessage = [
  'name should not be empty',
  'name must be a string',
  'email should not be empty',
  'email must be an email',
  'password should not be empty',
  'password must be longer than or equal to 6 characters',
  'password must be a string',
  'passwordConfirmation should not be empty',
  'passwordConfirmation must be longer than or equal to 6 characters',
  'passwordConfirmation must be a string',
];

export const mockSignInErrorMessage = [
  'email should not be empty',
  'email must be a string',
  'password should not be empty',
  'password must be a string',
];

export const mockForgotPasswordErrorMessage = ['email should not be empty', 'email must be an email'];

export const mockResetPasswordErrorMessage = [
  'token should not be empty',
  'token must be a UUID',
  'password should not be empty',
  'password must be longer than or equal to 6 characters',
  'password must be a string',
  'passwordConfirmation should not be empty',
  'passwordConfirmation must be longer than or equal to 6 characters',
  'passwordConfirmation must be a string',
];
