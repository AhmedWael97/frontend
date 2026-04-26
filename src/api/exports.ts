/**
 * Exports API
 * Routes: /exports/*
 * Docs: api-contract.json → endpoints.exports
 */
import client from "./client";
import { EXPORT_ROUTES } from "./routes";

export const exportsApi = {
  /** GET /exports?domain_id=X → ExportJobObject[] */
  list: (domainId?: number) =>
    client.get(EXPORT_ROUTES.list, { params: domainId ? { domain_id: domainId } : {} }),

  /** POST /exports → 202 ExportJobObject */
  create: (data: {
    domain_id: number;
    type: "visitors" | "events" | "funnel" | "ai";
    format: "csv" | "excel";
    filters?: Record<string, unknown>;
  }) => client.post(EXPORT_ROUTES.create, data),

  /** GET /exports/{id} → ExportJobObject */
  show: (id: number) => client.get(EXPORT_ROUTES.show(id)),

  /** GET /exports/{id}/download → binary blob */
  download: (id: number) =>
    client.get(EXPORT_ROUTES.download(id), { responseType: "blob" }),
};
