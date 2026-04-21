/**
 * Admin API
 * Routes: /admin/*
 * Docs: api-contract.json → endpoints.admin
 * All endpoints require superadmin middleware.
 */
import client from "./client";
import { ADMIN_ROUTES } from "./routes";

export const adminApi = {
  // ── Dashboard Stats ─────────────────────────────────────────────────────────
  /** GET /admin/stats */
  stats: () => client.get(ADMIN_ROUTES.stats),

  // ── Users ───────────────────────────────────────────────────────────────────
  /** GET /admin/users */
  listUsers: (params?: { search?: string; status?: string; plan?: string }) =>
    client.get(ADMIN_ROUTES.usersList, { params }),

  /** GET /admin/users/{id} */
  getUser: (id: number) => client.get(ADMIN_ROUTES.usersShow(id)),

  /** PATCH /admin/users/{id} */
  updateUser: (
    id: number,
    data: { name?: string; email?: string; role?: string; status?: string }
  ) => client.patch(ADMIN_ROUTES.usersUpdate(id), data),

  /** DELETE /admin/users/{id} */
  deleteUser: (id: number) => client.delete(ADMIN_ROUTES.usersDelete(id)),

  /** POST /admin/users/{id}/block */
  blockUser: (id: number) => client.post(ADMIN_ROUTES.usersBlock(id)),

  /** POST /admin/users/{id}/unblock */
  unblockUser: (id: number) => client.post(ADMIN_ROUTES.usersUnblock(id)),

  /** POST /admin/users/{id}/impersonate → { token, target_user, expires_at } */
  impersonateUser: (id: number) => client.post(ADMIN_ROUTES.usersImpersonate(id)),

  /** DELETE /admin/impersonate */
  endImpersonation: () => client.delete(ADMIN_ROUTES.usersEndImpersonate),

  /** POST /admin/users/{id}/verify-email */
  verifyUserEmail: (id: number) => client.post(ADMIN_ROUTES.usersVerifyEmail(id)),

  /** POST /admin/users/{id}/disable-2fa */
  disableUser2fa: (id: number) => client.post(ADMIN_ROUTES.usersDisable2fa(id)),

  /** POST /admin/users/{id}/toggle-admin */
  toggleUserAdmin: (id: number) => client.post(ADMIN_ROUTES.usersToggleAdmin(id)),

  /** POST /admin/users/{id}/subscriptions */
  assignUserSubscription: (
    id: number,
    data: { plan_id: number; payment_method_id?: number; notes?: string }
  ) => client.post(ADMIN_ROUTES.usersAssignSubscription(id), data),

  // ── Plans ────────────────────────────────────────────────────────────────────
  /** GET /admin/plans */
  listPlans: () => client.get(ADMIN_ROUTES.plansList),

  /** POST /admin/plans */
  createPlan: (data: {
    name: string;
    price: number;
    limits: Record<string, unknown>;
    features?: Record<string, unknown>;
    is_public?: boolean;
  }) => client.post(ADMIN_ROUTES.plansCreate, data),

  /** GET /admin/plans/{id} */
  getPlan: (id: number) => client.get(ADMIN_ROUTES.plansShow(id)),

  /** PUT /admin/plans/{id} */
  updatePlan: (id: number, data: Record<string, unknown>) =>
    client.put(ADMIN_ROUTES.plansUpdate(id), data),

  /** DELETE /admin/plans/{id} */
  deletePlan: (id: number) => client.delete(ADMIN_ROUTES.plansDelete(id)),

  /** PATCH /admin/plans/{id}/toggle-visibility */
  togglePlanVisibility: (id: number) =>
    client.patch(ADMIN_ROUTES.plansToggleVisibility(id)),

  // ── Payment Methods ──────────────────────────────────────────────────────────
  /** GET /admin/payment-methods */
  listPaymentMethods: () => client.get(ADMIN_ROUTES.paymentMethodsList),

  /** POST /admin/payment-methods */
  createPaymentMethod: (data: {
    name: string;
    name_ar?: string;
    type: string;
    config?: Record<string, unknown>;
    is_active?: boolean;
  }) => client.post(ADMIN_ROUTES.paymentMethodsCreate, data),

  /** PUT /admin/payment-methods/{id} */
  updatePaymentMethod: (id: number, data: Record<string, unknown>) =>
    client.put(ADMIN_ROUTES.paymentMethodsUpdate(id), data),

  /** DELETE /admin/payment-methods/{id} */
  deletePaymentMethod: (id: number) =>
    client.delete(ADMIN_ROUTES.paymentMethodsDelete(id)),

  // ── Subscriptions ────────────────────────────────────────────────────────────
  /** GET /admin/subscriptions */
  listSubscriptions: (params?: { status?: string; plan?: string; search?: string }) =>
    client.get(ADMIN_ROUTES.subscriptionsList, { params }),

  /** GET /admin/subscriptions/{id} */
  getSubscription: (id: number) => client.get(ADMIN_ROUTES.subscriptionsShow(id)),

  /** POST /admin/subscriptions/{id}/upgrade */
  upgradeSubscription: (id: number, plan_id: number) =>
    client.post(ADMIN_ROUTES.subscriptionsUpgrade(id), { plan_id }),

  /** POST /admin/subscriptions/{id}/cancel */
  cancelSubscription: (id: number) =>
    client.post(ADMIN_ROUTES.subscriptionsCancel(id)),

  /** POST /admin/subscriptions/{id}/pause */
  pauseSubscription: (id: number) =>
    client.post(ADMIN_ROUTES.subscriptionsPause(id)),

  /** POST /admin/subscriptions/{id}/resume */
  resumeSubscription: (id: number) =>
    client.post(ADMIN_ROUTES.subscriptionsResume(id)),

  // ── Payments ─────────────────────────────────────────────────────────────────
  /** GET /admin/payments */
  listPayments: (params?: {
    status?: string;
    method?: string;
    from?: string;
    to?: string;
  }) => client.get(ADMIN_ROUTES.paymentsList, { params }),

  /** GET /admin/payments/{id} */
  getPayment: (id: number) => client.get(ADMIN_ROUTES.paymentsShow(id)),

  /** POST /admin/payments/{id}/refund */
  refundPayment: (id: number) => client.post(ADMIN_ROUTES.paymentsRefund(id)),

  // ── Domains ───────────────────────────────────────────────────────────────────
  /** GET /admin/domains */
  listDomains: (params?: { search?: string }) =>
    client.get(ADMIN_ROUTES.domainsList, { params }),

  /** DELETE /admin/domains/{id} */
  deleteDomain: (id: number) => client.delete(ADMIN_ROUTES.domainsDelete(id)),

  // ── Audit Log ─────────────────────────────────────────────────────────────────
  /** GET /admin/audit-log */
  auditLog: (params?: {
    admin_id?: number;
    action?: string;
    from?: string;
    to?: string;
  }) => client.get(ADMIN_ROUTES.auditLog, { params }),
};
