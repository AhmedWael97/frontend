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
    ttq?: { track: (event: string, props?: Props, options?: { event_id?: string }) => void; page?: () => void };
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
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

/**
 * Fire a TikTok standard event. `eventId`, when given, is passed as TikTok's
 * dedup key (3rd arg) — shared with a server-side Events API send of the same
 * event so TikTok merges them instead of double-counting the conversion.
 */
export function ttTrack(event: string, props: Props = {}, eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.ttq?.track(event, props, eventId ? { event_id: eventId } : undefined);
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

/**
 * Fire a Meta Pixel standard event. `eventId`, when given, is passed as the
 * dedup key — shared with a server-side Conversions API send of the same
 * event so Meta merges them instead of double-counting the conversion.
 */
export function fbTrack(event: string, props: Props = {}, eventId?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("track", event, props, eventId ? { eventID: eventId } : undefined);
  } catch {
    /* pixel not loaded / blocked — ignore */
  }
}

/**
 * Signup completed — the primary conversion.
 * @param userId   used to build a stable event_id shared with the server-side
 *                 TikTok Events API send, so TikTok can dedup the pixel + CAPI
 *                 hit for the same signup instead of double-counting it.
 * @param email    enables Google Ads Enhanced Conversions — gtag hashes it
 *                 client-side before sending, we never send it in plaintext.
 */
export function trackSignup(userId?: number | string, email?: string): void {
  const eventId = userId != null ? `signup_${userId}` : undefined;

  if (email && typeof window !== "undefined") {
    try {
      window.gtag?.("set", "user_data", { email: email.trim().toLowerCase() });
    } catch {
      /* gtag not loaded — ignore */
    }
  }

  ttTrack("CompleteRegistration", {}, eventId);
  fbTrack("CompleteRegistration", {}, eventId);
  gaEvent("sign_up");
  // Google Ads "Add domain / signup" conversion.
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL
    || "AW-18257861903/W4tKCIvSycocEI-6g4JE";
  gaEvent("conversion", { send_to: label, value: 1.0, currency: "EGP" });
}

/** Viewed a plan / pricing — top of funnel. */
export function trackViewPlans(): void {
  ttTrack("ViewContent", { content_type: "product", content_name: "plans" });
  fbTrack("ViewContent", { content_type: "product", content_name: "plans" });
}

/** Started an upgrade / subscribe flow — mid funnel. */
export function trackInitiateCheckout(planName?: string): void {
  ttTrack("InitiateCheckout", planName ? { content_name: planName } : {});
  fbTrack("InitiateCheckout", planName ? { content_name: planName } : {});
}
