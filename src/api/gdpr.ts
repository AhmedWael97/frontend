/**
 * GDPR API
 * Routes: /gdpr/*
 * Docs: api-contract.json → endpoints.gdpr
 */
import client from "./client";
import { GDPR_ROUTES } from "./routes";

export const gdprApi = {
  /** DELETE /gdpr/visitor → 202 { message, id } */
  deleteVisitor: (data: { domain_id: number; visitor_id: string }) =>
    client.delete(GDPR_ROUTES.deleteVisitor, { data }),

  /** GET /gdpr/optout-status → { opted_out } */
  optoutStatus: (params: { domain_id: number; visitor_id: string }) =>
    client.get(GDPR_ROUTES.optoutStatus, { params }),
};
