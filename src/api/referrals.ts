/**
 * Invite & earn — referral rows are created at registration; this is read-only.
 */
import client from "./client";

export interface ReferralRow {
  name: string | null;
  email: string;
  status: "pending" | "rewarded";
  created_at: string;
  rewarded_at: string | null;
}

export const referralsApi = {
  /** GET /referrals */
  mine: () => client.get("/referrals"),
};
