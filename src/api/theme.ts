/**
 * Theme API
 * Routes: /theme  (public), /admin/theme  (admin)
 * Docs: api-contract.json → endpoints.public.theme + endpoints.admin.theme_*
 */
import client from "./client";
import { THEME_ROUTES, ADMIN_ROUTES } from "./routes";

export const themeApi = {
  /** GET /theme  (public, no auth) */
  get: () => client.get(THEME_ROUTES.get),

  /** GET /admin/theme  (superadmin) */
  adminGet: () => client.get(ADMIN_ROUTES.themeShow),

  /** PUT /admin/theme  (superadmin) */
  adminUpdate: (settings: Array<{ key: string; value: string }>) =>
    client.put(ADMIN_ROUTES.themeUpdate, { settings }),

  /** POST /admin/theme/logo  (superadmin, multipart/form-data) */
  adminUploadLogo: (formData: FormData) =>
    client.post(ADMIN_ROUTES.themeUploadLogo, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
