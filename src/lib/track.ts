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
  // Optional Google Ads conversion: set the label once you create the
  // conversion action in Google Ads (e.g. "AW-18257861903/abc123").
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;
  if (label) gaEvent("conversion", { send_to: label });
}

/** Viewed a plan / pricing — top of funnel. */
export function trackViewPlans(): void {
  ttTrack("ViewContent", { content_type: "product", content_name: "plans" });
}

/** Started an upgrade / subscribe flow — mid funnel. */
export function trackInitiateCheckout(planName?: string): void {
  ttTrack("InitiateCheckout", planName ? { content_name: planName } : {});
}
