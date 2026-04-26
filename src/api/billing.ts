/**
 * Billing API
 * Routes: /billing/*
 * Docs: api-contract.json → endpoints.billing
 */
import client from "./client";
import { BILLING_ROUTES } from "./routes";

export const billingApi = {
  /** GET /billing → { subscription, usage, limits, payments, plans } */
  show: () => client.get(BILLING_ROUTES.show),

  /** POST /billing/subscribe */
  subscribe: (data: FormData | { plan_id: number; payment_method_id?: number; transaction_reference?: string }) =>
    client.post(BILLING_ROUTES.subscribe, data),

  /** POST /billing/cancel */
  cancel: () => client.post(BILLING_ROUTES.cancel),
};
