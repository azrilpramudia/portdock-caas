import { doubleCsrf } from 'csrf-csrf';

export const {
  generateCsrfToken, // Use this in your routes to provide a CSRF hash cookie and token.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'PortdockCsrfSuperSecret2026', 
  getSessionIdentifier: (req) => 'stateless', // We use stateless JWTs
  cookieName: 'x-csrf-token', // The name of the cookie to be used
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }, 
  size: 64, 
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string, 
});
