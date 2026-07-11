/**
 * Organization (agency/team) API
 * Routes: /organization/*
 */
import client from "./client";
import { ORGANIZATION_ROUTES } from "./routes";

export type OrgMember = {
  id: number;
  user_id: number;
  name: string | null;
  email: string | null;
  role: "owner" | "admin" | "member";
  status: string;
  domain_ids: number[];
};

export type OrgInvitation = { id: number; email: string; role: string; created_at: string };
export type OrgDomain = { id: number; domain: string };

export type Organization = {
  id: number;
  name: string;
  owner_user_id: number;
  is_admin: boolean;
  seat_limit: number;
  seats_used: number;
  domain_limit: number;
  domains: OrgDomain[];
  members: OrgMember[];
  invitations: OrgInvitation[];
};

export const organizationApi = {
  /** GET /organization → { organization: Organization | null } */
  show: () => client.get(ORGANIZATION_ROUTES.show),

  /** POST /organization → create the agency workspace */
  create: (name: string) => client.post(ORGANIZATION_ROUTES.create, { name }),

  /** POST /organization/invitations */
  invite: (data: { email: string; role?: "admin" | "member"; domain_ids?: number[] }) =>
    client.post(ORGANIZATION_ROUTES.invite, data),

  /** POST /organization/invitations/{token}/accept */
  acceptInvite: (token: string) => client.post(ORGANIZATION_ROUTES.acceptInvite(token)),

  /** DELETE /organization/invitations/{id} */
  cancelInvite: (id: number) => client.delete(ORGANIZATION_ROUTES.cancelInvite(id)),

  /** POST /organization/members/{userId}/domains */
  assignDomains: (userId: number, domainIds: number[]) =>
    client.post(ORGANIZATION_ROUTES.assignDomains(userId), { domain_ids: domainIds }),

  /** DELETE /organization/members/{userId} */
  removeMember: (userId: number) => client.delete(ORGANIZATION_ROUTES.removeMember(userId)),

  /** GET /organization/promo-code — auto-generated agency referral code */
  promoCode: () => client.get(ORGANIZATION_ROUTES.promoCode),
};

export type OrgPromoCode = {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  used_count: number;
  is_active: boolean;
};
