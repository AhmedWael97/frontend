/**
 * Marketing conversion tracking — fires TikTok Pixel + Google Ads events.
 *
 * Safe to call anywhere: no-ops on the server and never throws if a pixel
 * script hasn't loaded (e.g. blocked by an ad-blocker). One place so we don't
 * sprinkle `window.ttq` / `window.gtag` calls across the app.
 */
type Props = Record<string, unknown>;

declare global {
  interface Window {
    ttq?: { track: (event: string, props?: Props) => void; page?: () => void };
    gtag?: (...args: unknown[]) => void;
    EYE?: {
      track?: (event: string, props?: Props) => void;
      identify?: (id: string, traits?: Props) => void;
      purchase?: (value: number, currency?: string, orderId?: string) => void;
    };
  }
}

/**
 * Fire a custom event into EYE's OWN tracker (dogfooding). No-ops if the tracker
 * hasn't loaded. Used to measure our own activation funnel.
 */
export function eyeTrack(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.EYE?.track?.(event, props);
  } catch {
    /* tracker not loaded — ignore */
  }
}

/** Fire a TikTok standard event. */
export function ttTrack(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.ttq?.track(event, props);
  } catch {
    /* pixel not loaded / blocked — ignore */
  }
}

/** Fire a Google Ads / GA event. */
export function gaEvent(event: string, params: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* gtag not loaded — ignore */
  }
}

/** Signup completed — the primary conversion. */
export function trackSignup(): void {
  ttTrack("CompleteRegistration");
  gaEvent("sign_up");
  // Google Ads "Add domain / signup" conversion.
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL
    || "AW-18257861903/W4tKCIvSycocEI-6g4JE";
  gaEvent("conversion", { send_to: label, value: 1.0, currency: "EGP" });
}

/** Viewed a plan / pricing — top of funnel. */
export function trackViewPlans(): void {
  ttTrack("ViewContent", { content_type: "product", content_name: "plans" });
}

/** Started an upgrade / subscribe flow — mid funnel. */
export function trackInitiateCheckout(planName?: string): void {
  ttTrack("InitiateCheckout", planName ? { content_name: planName } : {});
}
