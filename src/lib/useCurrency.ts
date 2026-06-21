"use client";

import { useQuery } from "@tanstack/react-query";
import client from "@/api/client";

export type CurrencyInfo = {
  country: string;
  currency: "USD" | "EGP";
  rate: number;
  symbol: string;
};

const FALLBACK: CurrencyInfo = { country: "", currency: "USD", rate: 1, symbol: "$" };

/**
 * Resolves the visitor's display currency from their IP (Egypt → EGP, else USD)
 * and returns a formatter. Plan prices are stored in USD; `format()` multiplies
 * by the rate and renders with the right symbol. Egyptian visitors see EGP,
 * everyone else sees USD. Paymob always collects EGP server-side regardless.
 *
 * Usage: const { format } = useCurrency(); format(29) → "$29" or "1,740 EGP"
 */
export function useCurrency() {
  const { data } = useQuery({
    queryKey: ["geo-currency"],
    queryFn: () => client.get("/geo/currency").then((r) => r.data as CurrencyInfo),
    staleTime: 60 * 60 * 1000, // 1h — country rarely changes within a session
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const info = data ?? FALLBACK;

  /** Format a USD base price in the resolved currency. */
  const format = (usd: number, opts?: { decimals?: number }) => {
    const value = (Number(usd) || 0) * info.rate;
    const decimals = opts?.decimals ?? (Number.isInteger(value) ? 0 : 2);
    const amount = value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return info.currency === "USD" ? `$${amount}` : `${amount} EGP`;
  };

  return { ...info, format };
}
