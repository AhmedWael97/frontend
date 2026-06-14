/**
 * API Route Constants
 * All backend paths in one place — update here, changes everywhere.
 * Path parameters are expressed as functions returning the full string.
 *
 * Base:  /api/v1  (set in client.ts via NEXT_PUBLIC_API_URL + NEXT_PUBLIC_API_VERSION)
 */

// ── Public / No-auth ─────────────────────────────────────────────────────────
export const PUBLIC_ROUTES = {
  health: "/health",
  theme: "/theme",
  track: "/track",
  trackOptout: "/track/optout",
  publicReport: (token: string) => `/public/report/${token}`,
  notificationUnsubscribe: (token: string) => `/notifications/unsubscribe/${token}`,
} as const;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  me: "/auth/me",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  emailVerify: (id: string, hash: string) => `/auth/email/verify/${id}/${hash}`,
  resendVerification: "/auth/email/resend-verification",
  twoFactorSetup: "/auth/two-factor/setup",
  twoFactorEnable: "/auth/two-factor/enable",
  twoFactorDisable: "/auth/two-factor/disable",
  twoFactorVerify: "/auth/two-factor/verify",
} as const;

// ── Profile ──────────────────────────────────────────────────────────────────
export const PROFILE_ROUTES = {
  show: "/profile",
  update: "/profile",
  delete: "/profile",
  changePassword: "/profile/password",
  apiKeyShow: "/profile/api-key",
  apiKeyRegenerate: "/profile/api-key/regenerate",
  sessions: "/profile/sessions",
  sessionRevoke: (tokenId: number) => `/profile/sessions/${tokenId}`,
  preferences: "/profile/preferences",
  twoFactorStatus: "/profile/two-factor/status",
  twoFactorEnable: "/profile/two-factor/enable",
  twoFactorConfirm: "/profile/two-factor/confirm",
  twoFactorDisable: "/profile/two-factor/disable",
} as const;

// ── Onboarding ───────────────────────────────────────────────────────────────
export const ONBOARDING_ROUTES = {
  show: "/onboarding",
  markStep: (step: string) => `/onboarding/${step}`,
} as const;

// ── Notifications ────────────────────────────────────────────────────────────
export const NOTIFICATION_ROUTES = {
  list: "/notifications",
  clearRead: "/notifications",
  markRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: "/notifications/read-all",
  delete: (id: string) => `/notifications/${id}`,
  unsubscribe: (token: string) => `/notifications/unsubscribe/${token}`,
} as const;

export const NOTIFICATION_PREF_ROUTES = {
  list: "/notification-preferences",
  update: "/notification-preferences",
} as const;

// ── Billing ───────────────────────────────────────────────────────────────────
export const BILLING_ROUTES = {
  show: "/billing",
  subscribe: "/billing/subscribe",
  cancel: "/billing/cancel",
} as const;

// ── GDPR ─────────────────────────────────────────────────────────────────────
export const GDPR_ROUTES = {
  deleteVisitor: "/gdpr/visitor",
  optoutStatus: "/gdpr/optout-status",
} as const;

// ── Exports ───────────────────────────────────────────────────────────────────
export const EXPORT_ROUTES = {
  list: "/exports",
  create: "/exports",
  show: (id: number) => `/exports/${id}`,
  download: (id: number) => `/exports/${id}/download`,
} as const;

// ── Sitemap Creator ───────────────────────────────────────────────────────────
export const SITEMAP_ROUTES = {
  generate: "/tools/sitemap/generate",
  history: "/tools/sitemap/history",
  status: (jobId: number) => `/tools/sitemap/${jobId}`,
  download: (jobId: number, format: string) =>
    `/tools/sitemap/${jobId}/download?format=${format}`,
} as const;

// ── Shared Reports ────────────────────────────────────────────────────────────
export const REPORT_ROUTES = {
  list: (domainId: number) => `/shared-reports/${domainId}`,
  create: "/shared-reports",
  delete: (id: number) => `/shared-reports/${id}`,
  publicView: (token: string) => `/public/report/${token}`,
} as const;

// ── Domains ───────────────────────────────────────────────────────────────────
export const DOMAIN_ROUTES = {
  list: "/domains",
  create: "/domains",
  show: (domain: number | string) => `/domains/${domain}`,
  update: (domain: number | string) => `/domains/${domain}`,
  delete: (domain: number | string) => `/domains/${domain}`,
  rotateToken: (domain: number | string) => `/domains/${domain}/rotate-token`,
  verify: (domain: number | string) => `/domains/${domain}/verify`,
  snippet: (domain: number | string) => `/domains/${domain}/snippet`,
  // Exclusions
  exclusionsList: (domain: number | string) => `/domains/${domain}/exclusions`,
  exclusionsCreate: (domain: number | string) => `/domains/${domain}/exclusions`,
  exclusionsDelete: (domain: number | string, exclusion: number) =>
    `/domains/${domain}/exclusions/${exclusion}`,
  // Webhooks
  webhooksList: (domain: number | string) => `/domains/${domain}/webhooks`,
  webhooksCreate: (domain: number | string) => `/domains/${domain}/webhooks`,
  webhooksUpdate: (domain: number | string, webhook: number) =>
    `/domains/${domain}/webhooks/${webhook}`,
  webhooksDelete: (domain: number | string, webhook: number) =>
    `/domains/${domain}/webhooks/${webhook}`,
  webhooksTest: (domain: number | string, webhook: number) =>
    `/domains/${domain}/webhooks/${webhook}/test`,
  webhooksLogs: (domain: number | string, webhook: number) =>
    `/domains/${domain}/webhooks/${webhook}/logs`,
  // Alert Rules
  alertRulesList: (domain: number | string) => `/domains/${domain}/alert-rules`,
  alertRulesCreate: (domain: number | string) => `/domains/${domain}/alert-rules`,
  alertRulesUpdate: (domain: number | string, rule: number) =>
    `/domains/${domain}/alert-rules/${rule}`,
  alertRulesDelete: (domain: number | string, rule: number) =>
    `/domains/${domain}/alert-rules/${rule}`,
  alertRulesApplyDefaults: () => `/alert-rules/apply-defaults`,
  // Pipelines
  pipelinesList: (domain: number | string) => `/domains/${domain}/pipelines`,
  pipelinesCreate: (domain: number | string) => `/domains/${domain}/pipelines`,
  pipelinesUpdate: (domain: number | string, pipeline: number) =>
    `/domains/${domain}/pipelines/${pipeline}`,
  pipelinesDelete: (domain: number | string, pipeline: number) =>
    `/domains/${domain}/pipelines/${pipeline}`,
  pipelineStepAdd: (domain: number | string, pipeline: number) =>
    `/domains/${domain}/pipelines/${pipeline}/steps`,
  pipelineStepRemove: (domain: number | string, pipeline: number, step: number) =>
    `/domains/${domain}/pipelines/${pipeline}/steps/${step}`,
  pipelineStepsReorder: (domain: number | string, pipeline: number) =>
    `/domains/${domain}/pipelines/${pipeline}/reorder`,
  // Saved Views
  savedViewsList: (domain: number | string) => `/domains/${domain}/saved-views`,
  savedViewsCreate: (domain: number | string) => `/domains/${domain}/saved-views`,
  savedViewsDelete: (domain: number | string, view: number) =>
    `/domains/${domain}/saved-views/${view}`,
} as const;

// ── Analytics ─────────────────────────────────────────────────────────────────
// Two base paths in the contract:
//   /domains/{domain}/analytics/*  — stats, pages, referrers, devices, geo, events, funnel, realtime
//   /analytics/{domainId}/*        — overview, visitors, identities, companies
export const ANALYTICS_ROUTES = {
  stats: (domain: number | string) => `/domains/${domain}/analytics/stats`,
  pages: (domain: number | string) => `/domains/${domain}/analytics/pages`,
  referrers: (domain: number | string) => `/domains/${domain}/analytics/referrers`,
  devices: (domain: number | string) => `/domains/${domain}/analytics/devices`,
  geo: (domain: number | string) => `/domains/${domain}/analytics/geo`,
  customEvents: (domain: number | string) => `/domains/${domain}/analytics/custom-events`,
  customEventsStore: (domain: number | string) => `/domains/${domain}/analytics/custom-events/store`,
  funnel: (domain: number | string, pipeline: number | string) =>
    `/domains/${domain}/analytics/pipelines/${pipeline}/funnel`,
  realtime: (domain: number | string) => `/domains/${domain}/analytics/realtime`,
  // /analytics/{domainId}/* group
  overview: (domainId: number) => `/analytics/${domainId}/overview`,
  visitorsList: (domainId: number) => `/analytics/${domainId}/visitors`,
  visitorsShow: (domainId: number, visitorId: string) =>
    `/analytics/${domainId}/visitors/${visitorId}`,
  identitiesList: (domainId: number) => `/analytics/${domainId}/identities`,
  identitiesShow: (domainId: number, externalId: string) =>
    `/analytics/${domainId}/identities/${externalId}`,
  companiesList: (domainId: number) => `/analytics/${domainId}/companies`,
  companiesShow: (domainId: number, companyDomain: string) =>
    `/analytics/${domainId}/companies/${companyDomain}`,
  portfolioOverview: () => `/portfolio/overview`,
  portfolioTriage: () => `/portfolio/triage`,
  campaigns: (domainId: number) => `/analytics/${domainId}/campaigns`,
  retention: (domainId: number) => `/analytics/${domainId}/retention`,
  experiments: (domainId: number) => `/analytics/${domainId}/experiments`,
  experimentResults: (domainId: number, id: number) => `/analytics/${domainId}/experiments/${id}/results`,
  experimentDelete: (domainId: number, id: number) => `/analytics/${domainId}/experiments/${id}`,
  gbStatus: (domainId: number) => `/analytics/${domainId}/experiments/growthbook/status`,
  gbList: (domainId: number) => `/analytics/${domainId}/experiments/growthbook`,
  gbResults: (domainId: number, id: string) => `/analytics/${domainId}/experiments/growthbook/${id}/results`,
  adSpend: (domainId: number) => `/analytics/${domainId}/ad-spend`,
  adSpendImport: (domainId: number) => `/analytics/${domainId}/ad-spend/import`,
  adSpendDelete: (domainId: number, id: number) => `/analytics/${domainId}/ad-spend/${id}`,
  engagedVisitors: (domainId: number) => `/analytics/${domainId}/engaged-visitors`,
  summary: (domainId: number) => `/analytics/${domainId}/summary`,
  botStats: (domainId: number) => `/analytics/${domainId}/bot-stats`,
} as const;

// ── UX Intelligence ───────────────────────────────────────────────────────────
export const UX_ROUTES = {
  score: (domainId: number) => `/ux/${domainId}/score`,
  issues: (domainId: number) => `/ux/${domainId}/issues`,
  heatmap: (domainId: number) => `/ux/${domainId}/heatmap`,
  errors: (domainId: number) => `/ux/${domainId}/errors`,
  scrollDepth: (domainId: number) => `/ux/${domainId}/scroll-depth`,
  webVitals: (domainId: number) => `/ux/${domainId}/web-vitals`,
  performance: (domainId: number) => `/ux/${domainId}/performance`,
} as const;

// ── Session Replay ────────────────────────────────────────────────────────────
export const REPLAY_ROUTES = {
  sessions: (domainId: number) => `/replay/${domainId}/sessions`,
  funnelDrops: (domainId: number) => `/replay/${domainId}/funnel-drops`,
  events:   (domainId: number, sessionId: string) => `/replay/${domainId}/sessions/${sessionId}`,
  markers:  (domainId: number, sessionId: string) => `/replay/${domainId}/sessions/${sessionId}/markers`,
  destroy:  (domainId: number, sessionId: string) => `/replay/${domainId}/sessions/${sessionId}`,
} as const;

// ── AI ────────────────────────────────────────────────────────────────────────
export const AI_ROUTES = {
  segments:         (domainId: number) => `/ai/${domainId}/segments`,
  suggestions:      (domainId: number) => `/ai/${domainId}/suggestions`,
  report:           (domainId: number) => `/ai/${domainId}/report`,
  reports:          (domainId: number) => `/ai/${domainId}/reports`,
  analyze:          (domainId: number) => `/ai/${domainId}/analyze`,
  quota:            (domainId: number) => `/ai/${domainId}/quota`,
  dismissSuggestion:(id: number)       => `/ai/suggestions/${id}/dismiss`,
  tokenPacks:       "/ai/token-packs",
  purchaseTokens:   "/ai/tokens/purchase",
} as const;

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const CHATBOT_ROUTES = {
  sessions:    (domainId: number)                        => `/chatbot/${domainId}/sessions`,
  showSession: (domainId: number, sessionId: number)     => `/chatbot/${domainId}/sessions/${sessionId}`,
  sendMessage: (domainId: number, sessionId: number)     => `/chatbot/${domainId}/sessions/${sessionId}/message`,
  deleteSession:(domainId: number, sessionId: number)    => `/chatbot/${domainId}/sessions/${sessionId}`,
} as const;

// ── Admin ─────────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  stats: "/admin/stats",
  // Users
  usersList: "/admin/users",
  usersShow: (id: number) => `/admin/users/${id}`,
  usersUpdate: (id: number) => `/admin/users/${id}`,
  usersDelete: (id: number) => `/admin/users/${id}`,
  usersBlock: (id: number) => `/admin/users/${id}/block`,
  usersUnblock: (id: number) => `/admin/users/${id}/unblock`,
  usersImpersonate: (id: number) => `/admin/users/${id}/impersonate`,
  usersEndImpersonate: "/admin/impersonate",
  usersVerifyEmail: (id: number) => `/admin/users/${id}/verify-email`,
  usersDisable2fa: (id: number) => `/admin/users/${id}/disable-2fa`,
  usersToggleAdmin: (id: number) => `/admin/users/${id}/toggle-admin`,
  usersGrantTokens: (id: number) => `/admin/users/${id}/grant-tokens`,
  usersAssignSubscription: (id: number) => `/admin/users/${id}/subscriptions`,
  // Plans
  plansList: "/admin/plans",
  plansCreate: "/admin/plans",
  plansShow: (id: number) => `/admin/plans/${id}`,
  plansUpdate: (id: number) => `/admin/plans/${id}`,
  plansDelete: (id: number) => `/admin/plans/${id}`,
  plansToggleVisibility: (id: number) => `/admin/plans/${id}/toggle-visibility`,
  // Payment Methods
  paymentMethodsList: "/admin/payment-methods",
  paymentMethodsCreate: "/admin/payment-methods",
  paymentMethodsUpdate: (id: number) => `/admin/payment-methods/${id}`,
  paymentMethodsDelete: (id: number) => `/admin/payment-methods/${id}`,
  // Subscriptions
  subscriptionsList: "/admin/subscriptions",
  subscriptionsShow: (id: number) => `/admin/subscriptions/${id}`,
  subscriptionsUpgrade: (id: number) => `/admin/subscriptions/${id}/upgrade`,
  subscriptionsCancel: (id: number) => `/admin/subscriptions/${id}/cancel`,
  subscriptionsPause: (id: number) => `/admin/subscriptions/${id}/pause`,
  subscriptionsResume: (id: number) => `/admin/subscriptions/${id}/resume`,
  subscriptionsExtend: (id: number) => `/admin/subscriptions/${id}/extend`,
  // Payments
  paymentsList: "/admin/payments",
  paymentsShow: (id: number) => `/admin/payments/${id}`,
  paymentsApprove: (id: number) => `/admin/payments/${id}/approve`,
  paymentsRefund: (id: number) => `/admin/payments/${id}/refund`,
  // Domains
  domainsList: "/admin/domains",
  domainsDelete: (id: number) => `/admin/domains/${id}`,
  // Theme
  themeShow: "/admin/theme",
  themeUpdate: "/admin/theme",
  themeUploadLogo: "/admin/theme/logo",
  // Audit
  auditLog: "/admin/audit-log",
} as const;

// ── Theme (public) ────────────────────────────────────────────────────────────
export const THEME_ROUTES = {
  get: "/theme",
} as const;
