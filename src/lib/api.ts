import axios from "axios";

// Strip any accidental trailing /api from the env var to avoid /api/api/v1
const apiHost = (process.env.NEXT_PUBLIC_API_URL || "http://localhost").replace(/\/api\/?$/, "");
const baseURL = `${apiHost}/api/${process.env.NEXT_PUBLIC_API_VERSION || "v1"}`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // API keys are NOT sent from the browser — they are added server-side in the /api/collect proxy
    // to avoid CORS preflight failures and to keep the keys out of browser network tabs
  },
});

// Attach auth token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eye_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("eye_token");
      window.location.href = "/en/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/profile"),                                             // GET /api/profile
  updateProfile: (data: { name?: string; email?: string; timezone?: string }) =>
    api.patch("/profile", data),
  changePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    api.put("/profile/password", data),                                      // PUT /api/profile/password
  rotateApiKey: () => api.post("/profile/api-key/regenerate"),              // POST /api/profile/api-key/regenerate
  getApiKey: () => api.get("/profile/api-key"),
  verifyEmail: (id: string, hash: string, params: Record<string, string>) =>
    api.get(`/auth/email/verify/${id}/${hash}`, { params }),                 // GET (not POST)
  resendVerification: () => api.post("/auth/email/resend-verification"),    // correct endpoint name
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
    api.post("/auth/reset-password", data),
  twoFactorEnable: () => api.post("/profile/two-factor/enable"),            // profile-scoped
  twoFactorConfirm: (code: string) => api.post("/profile/two-factor/confirm", { code }),
  twoFactorDisable: (data: { code: string; password: string }) =>
    api.post("/profile/two-factor/disable", data),                          // POST disable (profile alias)
  twoFactorChallenge: (data: { code?: string; recovery_code?: string }) =>
    api.post("/auth/two-factor/verify", data),                              // POST /api/auth/two-factor/verify
  updatePreferences: (data: { locale?: string; appearance?: string }) =>
    api.patch("/profile/preferences", data),
};

// ─── Domains ───────────────────────────────────────────────────────────────────
export const domainsApi = {
  list: () => api.get("/domains"),
  create: (domain: string) => api.post("/domains", { domain }),
  show: (id: number) => api.get(`/domains/${id}`),
  delete: (id: number) => api.delete(`/domains/${id}`),
  getScript: (id: number) => api.get(`/domains/${id}/snippet`),             // /snippet not /script
  verify: (id: number) => api.post(`/domains/${id}/verify-script`),         // POST verify-script
  rotateToken: (id: number) => api.post(`/domains/${id}/rotate-token`),
  getExclusions: (id: number) => api.get(`/domains/${id}/exclusions`),
  addExclusion: (id: number, data: { type: string; value: string }) =>
    api.post(`/domains/${id}/exclusions`, data),
  deleteExclusion: (domainId: number, exclusionId: number) =>
    api.delete(`/domains/${domainId}/exclusions/${exclusionId}`),
};

// ─── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/overview`, { params }),
  realtime: (domainId: number) => api.get(`/analytics/${domainId}/realtime`),
  visitors: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/visitors`, { params }),
  pages: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/pages`, { params }),
  countries: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/countries`, { params }),
  devices: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/devices`, { params }),
  funnels: (domainId: number, pipelineId: number) =>
    api.get(`/analytics/${domainId}/funnels/${pipelineId}`),
  customEvents: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/custom-events`, { params }),
  identities: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/identities`, { params }),
  companies: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/companies`, { params }),
  trafficSources: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/referrers`, { params }),               // /referrers not /sources
  utmStats: (domainId: number, params?: Record<string, string>) =>
    api.get(`/analytics/${domainId}/referrers`, { params: { ...params, type: "utm" } }),
};

// ─── Pipelines ─────────────────────────────────────────────────────────────────
export const pipelinesApi = {
  list: (domainId: number) => api.get(`/domains/${domainId}/pipelines`),
  create: (domainId: number, data: { name: string; description?: string }) =>
    api.post(`/domains/${domainId}/pipelines`, data),
  update: (domainId: number, id: number, data: { name?: string; description?: string }) =>
    api.put(`/domains/${domainId}/pipelines/${id}`, data),
  delete: (domainId: number, id: number) => api.delete(`/domains/${domainId}/pipelines/${id}`),
  addStep: (domainId: number, id: number, data: { name: string; url_pattern: string; order: number }) =>
    api.post(`/domains/${domainId}/pipelines/${id}/steps`, data),
  removeStep: (domainId: number, pipelineId: number, stepId: number) =>
    api.delete(`/domains/${domainId}/pipelines/${pipelineId}/steps/${stepId}`),
};

// ─── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  segments: (domainId: number) => api.get(`/ai/${domainId}/segments`),
  suggestions: (domainId: number) => api.get(`/ai/${domainId}/suggestions`),
  analyze: (domainId: number) => api.post(`/ai/${domainId}/analyze`),
  dismissSuggestion: (id: number) => api.patch(`/ai/suggestions/${id}/dismiss`),
  quota: (domainId: number) => api.get(`/ai/${domainId}/quota`),
};

// ─── UX ────────────────────────────────────────────────────────────────────────
export const uxApi = {
  score: (domainId: number) => api.get(`/ux/${domainId}/score`),
  scores: (domainId: number) => api.get(`/ux/${domainId}/score`),
  issues: (domainId: number, params?: Record<string, string>) =>
    api.get(`/ux/${domainId}/issues`, { params }),
  heatmap: (domainId: number, params?: Record<string, string>) =>
    api.get(`/ux/${domainId}/heatmap`, { params }),
  errors: (domainId: number, params?: Record<string, string>) =>
    api.get(`/ux/${domainId}/errors`, { params }),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params?: Record<string, string>) => api.get("/notifications", { params }),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete("/notifications"),
  getPreferences: () => api.get("/notification-preferences"),
  updatePreferences: (data: Array<{ type: string; in_app: boolean; email: boolean }>) =>
    api.patch("/notification-preferences", data),
};

// ─── Alert Rules ───────────────────────────────────────────────────────────────
export const alertRulesApi = {
  list: (domainId: number) => api.get(`/domains/${domainId}/alert-rules`),
  create: (domainId: number, data: Record<string, unknown>) =>
    api.post(`/domains/${domainId}/alert-rules`, data),
  update: (domainId: number, id: number, data: Record<string, unknown>) =>
    api.patch(`/domains/${domainId}/alert-rules/${id}`, data),
  delete: (domainId: number, id: number) => api.delete(`/domains/${domainId}/alert-rules/${id}`),
};

// ─── Webhooks ──────────────────────────────────────────────────────────────────
export const webhooksApi = {
  list: (domainId: number) => api.get(`/domains/${domainId}/webhooks`),
  create: (domainId: number, data: { url: string; events: string[]; secret: string }) =>
    api.post(`/domains/${domainId}/webhooks`, data),
  update: (domainId: number, id: number, data: Record<string, unknown>) =>
    api.patch(`/domains/${domainId}/webhooks/${id}`, data),
  delete: (domainId: number, id: number) => api.delete(`/domains/${domainId}/webhooks/${id}`),
  test: (domainId: number, id: number) => api.post(`/domains/${domainId}/webhooks/${id}/test`),
};

// ─── Exports ───────────────────────────────────────────────────────────────────
export const exportsApi = {
  list: (domainId: number) => api.get(`/exports`, { params: { domain_id: domainId } }),
  create: (data: { domain_id: number; type: string; format: string; filters?: Record<string, string> }) =>
    api.post("/exports", data),
  status: (id: number) => api.get(`/exports/${id}`),
  download: (id: number) => api.get(`/exports/${id}/download`, { responseType: "blob" }),
};

// ─── Shared Reports ────────────────────────────────────────────────────────────
export const sharedReportsApi = {
  list: (domainId: number) => api.get(`/shared-reports/${domainId}`),
  create: (data: { domain_id: number; label?: string; allowed_pages?: string[]; expires_at?: string }) =>
    api.post("/shared-reports", data),
  delete: (id: number) => api.delete(`/shared-reports/${id}`),
  revoke: (token: string) => api.delete(`/shared-reports/token/${token}`),
  getPublic: (token: string) => api.get(`/public/report/${token}`),
  view: (token: string) => api.get(`/public/report/${token}`),
};

// ─── Saved Views ───────────────────────────────────────────────────────────────
export const savedViewsApi = {
  list: (domainId: number) => api.get(`/saved-views/${domainId}`),
  create: (domainId: number, data: { name: string; filters: Record<string, unknown> }) =>
    api.post(`/saved-views/${domainId}`, data),
  delete: (id: number) => api.delete(`/saved-views/${id}`),
};

// ─── Onboarding ────────────────────────────────────────────────────────────────
export const onboardingApi = {
  status: () => api.get("/onboarding"),
  markStep: (step: string) => api.patch(`/onboarding/${step}`),
};

// ─── Theme ─────────────────────────────────────────────────────────────────────
export const themeApi = {
  get: () => api.get("/theme"),
  adminGet: () => api.get("/admin/theme"),
  adminUpdate: (data: Record<string, string>) => api.put("/admin/theme", data),
  adminUploadLogo: (formData: FormData) =>
    api.post("/admin/theme/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/admin/stats"),
  users: (params?: Record<string, unknown>) => api.get("/admin/users", { params }),
  plans: () => api.get("/admin/plans"),
  subscriptions: (params?: Record<string, unknown>) => api.get("/admin/subscriptions", { params }),
  payments: (params?: Record<string, unknown>) => api.get("/admin/payments", { params }),
  domains: (params?: Record<string, unknown>) => api.get("/admin/domains", { params }),
  banUser: (id: number) => api.post(`/admin/users/${id}/block`),
  // Users
  listUsers: (params?: Record<string, string>) => api.get("/admin/users", { params }),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data),
  blockUser: (id: number) => api.post(`/admin/users/${id}/block`),
  unblockUser: (id: number) => api.post(`/admin/users/${id}/unblock`),
  impersonateUser: (id: number) => api.post(`/admin/users/${id}/impersonate`),
  endImpersonation: () => api.delete("/admin/impersonate"),
  // Plans
  listPlans: () => api.get("/admin/plans"),
  createPlan: (data: Record<string, unknown>) => api.post("/admin/plans", data),
  updatePlan: (id: number, data: Record<string, unknown>) => api.put(`/admin/plans/${id}`, data),
  deletePlan: (id: number) => api.delete(`/admin/plans/${id}`),
  togglePlanVisibility: (id: number) => api.patch(`/admin/plans/${id}/toggle-visibility`),
  // Subscriptions
  listSubscriptions: (params?: Record<string, string>) =>
    api.get("/admin/subscriptions", { params }),
  upgradeSubscription: (id: number, planId: number) =>
    api.post(`/admin/subscriptions/${id}/upgrade`, { plan_id: planId }),
  cancelSubscription: (id: number) => api.post(`/admin/subscriptions/${id}/cancel`),
  // Payments
  listPayments: (params?: Record<string, string>) => api.get("/admin/payments", { params }),
  refundPayment: (id: number) => api.post(`/admin/payments/${id}/refund`),
  // Domains
  listDomains: (params?: Record<string, string>) => api.get("/admin/domains", { params }),
  deleteDomain: (id: number) => api.delete(`/admin/domains/${id}`),
  // Audit log
  auditLog: (params?: Record<string, string>) => api.get("/admin/audit-log", { params }),
  // Payment methods (gateways)
  listPaymentMethods: () => api.get("/admin/payment-methods"),
  updatePaymentMethod: (gateway: string, data: Record<string, unknown>) =>
    api.put(`/admin/payment-methods/${gateway}`, data),
  togglePaymentMethod: (gateway: string) =>
    api.patch(`/admin/payment-methods/${gateway}/toggle`),
};

export const gdprApi = {
  deleteVisitor: (data: { domain_id: number; visitor_id: string }) =>
    api.delete("/gdpr/visitor", { data }),
  optoutStatus: (params: { domain_id: number; visitor_id: string }) =>
    api.get("/gdpr/optout-status", { params }),
};
