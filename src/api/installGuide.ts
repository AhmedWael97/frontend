/**
 * Public, no-login install guide — keyed by a domain's script_token.
 * Routes: /install-guide/{token}[/verify]
 */
import client from "./client";

export const installGuideApi = {
  /** GET /install-guide/{token} */
  show: (token: string) => client.get(`/install-guide/${token}`),

  /** GET /install-guide/{token}/verify */
  verify: (token: string) => client.get(`/install-guide/${token}/verify`),
};
