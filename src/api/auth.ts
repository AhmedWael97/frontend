/**
 * Auth API
 * Routes: /auth/*
 * Docs: api-contract.json → endpoints.public (auth section) + endpoints.auth
 */
import client from "./client";
import { AUTH_ROUTES } from "./routes";

export const authApi = {
  /** POST /auth/register */
  register: (data: {
    name: string;
    email: string;
    password: string;
    locale?: string;
    timezone?: string;
  }) => client.post(AUTH_ROUTES.register, data),

  /** POST /auth/login → { user, token } or { two_factor_required, two_factor_token } */
  login: (data: { email: string; password: string }) =>
    client.post(AUTH_ROUTES.login, data),

  /** POST /auth/logout  (requires Bearer token) */
  logout: () => client.post(AUTH_ROUTES.logout),

  /** GET /auth/me  (requires Bearer token) */
  me: () => client.get(AUTH_ROUTES.me),

  /** POST /auth/forgot-password */
  forgotPassword: (email: string) =>
    client.post(AUTH_ROUTES.forgotPassword, { email }),

  /** POST /auth/reset-password */
  resetPassword: (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => client.post(AUTH_ROUTES.resetPassword, data),

  /** GET /auth/email/verify/{id}/{hash} */
  verifyEmail: (id: string, hash: string, params: Record<string, string>) =>
    client.get(AUTH_ROUTES.emailVerify(id, hash), { params }),

  /** POST /auth/email/resend-verification  (requires Bearer token) */
  resendVerification: () => client.post(AUTH_ROUTES.resendVerification),

  /** POST /auth/two-factor/setup  (requires Bearer token) → { secret, qr_code_url } */
  twoFactorSetup: () => client.post(AUTH_ROUTES.twoFactorSetup),

  /** POST /auth/two-factor/enable  (requires Bearer token, confirms TOTP code) */
  twoFactorEnable: (code: string) =>
    client.post(AUTH_ROUTES.twoFactorEnable, { code }),

  /** DELETE /auth/two-factor/disable  (requires Bearer token) */
  twoFactorDisable: (code: string) =>
    client.delete(AUTH_ROUTES.twoFactorDisable, { data: { code } }),

  /** POST /auth/two-factor/verify  (no Bearer, uses two_factor_token from login) */
  twoFactorVerify: (data: { code?: string; recovery_code?: string }) =>
    client.post(AUTH_ROUTES.twoFactorVerify, data),
};
