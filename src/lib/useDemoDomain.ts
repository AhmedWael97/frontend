"use client";

import { useQuery } from "@tanstack/react-query";
import { domainsApi } from "@/lib/api";

/**
 * The one shared sandbox domain (real Postgres row + seeded ClickHouse data).
 * Cached under a stable query key so every component that needs "is this the
 * demo domain?" shares one fetch instead of each re-requesting it.
 */
export function useDemoDomain() {
  const { data } = useQuery({
    queryKey: ["demo-domain"],
    queryFn: () => domainsApi.demo().then((r) => (r.data?.data ?? r.data) as { id: number; domain: string }),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  return data ?? null;
}
