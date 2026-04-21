/**
 * Shared Reports API
 * Routes: /shared-reports/*, /public/report/*
 * Docs: api-contract.json → endpoints.shared_reports + endpoints.public.public_shared_report
 */
import client from "./client";
import { REPORT_ROUTES } from "./routes";

export const reportsApi = {
  /** GET /shared-reports/{domainId} */
  list: (domainId: number) => client.get(REPORT_ROUTES.list(domainId)),

  /** POST /shared-reports */
  create: (data: {
    domain_id: number;
    label: string;
    allowed_pages?: string[];
    expires_at?: string;
  }) => client.post(REPORT_ROUTES.create, data),

  /** DELETE /shared-reports/{id} */
  delete: (id: number) => client.delete(REPORT_ROUTES.delete(id)),

  /** GET /public/report/{token}  (no auth required) */
  publicView: (token: string) => client.get(REPORT_ROUTES.publicView(token)),
};
