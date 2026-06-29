export const users = {
  validUser: {
    email: process.env.TEST_EMAIL ?? 'oa2@demo.local',
    password: process.env.TEST_PASSWORD ?? '',
  },
  invalidUser: {
    email: 'invalid@user.com',
    password: 'wrongpassword',
  },
  mailinatorUser: {
    email: process.env.MAILINATOR_TEST_EMAIL ?? '',
  },
};

export const urls = {
  login: '/auth/login',
  dashboard: '/dashboard',
  forgotPassword: '/auth/forgot-password',
};

export const messages = {
  invalidCredentials: 'Invalid email or password.',
  forgotPasswordSuccess: 'If the email exists, a reset link has been sent.',
  forgotPasswordFieldError: 'Valid email address required',
};

// No API key needed — 1secmail is a free public disposable email service.
// Just register a @1secmail.com address as a user in the CAT portal and set it below.
export const emailTesting = {
  testEmail: process.env.RESET_TEST_EMAIL ?? '',
  isConfigured: !!process.env.RESET_TEST_EMAIL,
};
