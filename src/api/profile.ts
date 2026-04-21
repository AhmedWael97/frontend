/**
 * Profile API
 * Routes: /profile/*
 * Docs: api-contract.json → endpoints.profile
 */
import client from "./client";
import { PROFILE_ROUTES } from "./routes";

export const profileApi = {
  /** GET /profile */
  show: () => client.get(PROFILE_ROUTES.show),

  /** PATCH /profile */
  update: (data: {
    name?: string;
    locale?: string;
    timezone?: string;
    appearance?: string;
  }) => client.patch(PROFILE_ROUTES.update, data),

  /** PATCH /profile/preferences */
  updatePreferences: (data: { locale?: string; appearance?: string; [key: string]: unknown }) =>
    client.patch(PROFILE_ROUTES.preferences, data),

  /** PUT /profile/password → { message, token } */
  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => client.put(PROFILE_ROUTES.changePassword, data),

  /** GET /profile/api-key → { api_key } */
  apiKeyShow: () => client.get(PROFILE_ROUTES.apiKeyShow),

  /** POST /profile/api-key/regenerate → { message, api_key } */
  apiKeyRegenerate: () => client.post(PROFILE_ROUTES.apiKeyRegenerate),

  /** GET /profile/sessions → [{ id, ip, user_agent, last_used_at, current }] */
  sessionsList: () => client.get(PROFILE_ROUTES.sessions),

  /** DELETE /profile/sessions/{tokenId} */
  sessionRevoke: (tokenId: number) =>
    client.delete(PROFILE_ROUTES.sessionRevoke(tokenId)),

  /** DELETE /profile */
  deleteAccount: () => client.delete(PROFILE_ROUTES.delete),

  /** GET /profile/two-factor/status → { enabled } */
  twoFactorStatus: () => client.get(PROFILE_ROUTES.twoFactorStatus),

  /** POST /profile/two-factor/enable  (password-gated) → { qr_code, secret } */
  twoFactorEnable: (password: string) =>
    client.post(PROFILE_ROUTES.twoFactorEnable, { password }),

  /** POST /profile/two-factor/confirm  (TOTP code) → { message, backup_codes } */
  twoFactorConfirm: (code: string) =>
    client.post(PROFILE_ROUTES.twoFactorConfirm, { code }),

  /** POST /profile/two-factor/disable  (password-gated) */
  twoFactorDisable: (password: string) =>
    client.post(PROFILE_ROUTES.twoFactorDisable, { password }),
};
