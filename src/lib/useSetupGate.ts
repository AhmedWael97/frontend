"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { domainsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export type GateDomain = {
  id: number;
  domain: string;
  script_token: string;
  script_verified: boolean;
};

/**
 * Whether the account still has setup to finish — no domain, or a domain whose
 * tracking tag has never reported a visitor.
 *
 * The old gate only asked whether a domain had been ADDED, so anyone who typed
 * a URL walked straight into a dashboard of zeros and, believing the free audit
 * in signup was the product, never installed anything. Verified means an event
 * has actually arrived, which is the only evidence the product works at all.
 *
 * Deliberately derived from the server's domain list rather than local state,
 * so logging out and back in resumes at the real step instead of restarting or
 * skipping the wizard.
 */
export function useSetupGate() {
  const { token, user, selectedDomainId, setSelectedDomainId } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["domains"],
    queryFn: () => domainsApi.list().then((r) => (r.data?.data ?? r.data) as GateDomain[]),
    enabled: !!token,
    staleTime: 30_000,
  });

  const domains = data ?? [];
  const verified = domains.filter((d) => d.script_verified);

  // selectedDomainId is persisted in localStorage and survives registering a
  // second account in the same browser, so a new signup inherited the previous
  // account's domain id and every request 404'd with "No query results for
  // model [App\Models\Domain]". Drop an id this account cannot see.
  useEffect(() => {
    if (isLoading || isError || !data) return;
    if (selectedDomainId && !domains.some((d) => d.id === selectedDomainId)) {
      setSelectedDomainId(null);
    }
  }, [data, isLoading, isError, selectedDomainId, setSelectedDomainId, domains]);

  // Superadmins run the platform and are not onboarding onto it.
  const exempt = user?.role === "superadmin";

  return {
    // Never block while the answer is unknown. A failed request must not lock
    // someone out of an account that is perfectly set up.
    loading: isLoading,
    needsSetup: !exempt && !isLoading && !isError && verified.length === 0,
    /** The domain the wizard should resume on, if one was already added. */
    pendingDomain: domains.find((d) => !d.script_verified) ?? null,
    hasDomain: domains.length > 0,
  };
}
