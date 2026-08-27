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
 * Read the first-touch ad-attribution cookie set by middleware.ts on
 * landing (utm_source/medium/campaign + gclid/ttclid/fbclid). Register
 * forms spread this into the POST /auth/register body so a signup can be
 * traced back to the ad session that brought it — see
 * signup_utm_source/signup_click_id on the users table.
 */
export function readAcquisitionCookie(): { utm_source?: string; utm_medium?: string; utm_campaign?: string; click_id?: string } {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|; )eye_acq=([^;]+)/);
  if (!match) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as { s?: string; m?: string; c?: string; cid?: string };
    return {
      ...(parsed.s ? { utm_source: parsed.s } : {}),
      ...(parsed.m ? { utm_medium: parsed.m } : {}),
      ...(parsed.c ? { utm_campaign: parsed.c } : {}),
      ...(parsed.cid ? { click_id: parsed.cid } : {}),
    };
  } catch {
    return {};
  }
}

/**
 * Build the query string that carries first-touch attribution (and an optional
 * referral code) through an OAuth round-trip.
 *
 * Google/Facebook hand our backend a fresh server-to-server request that
 * carries neither the eye_acq cookie nor the ad's original query string, so
 * these values have to ride inside the `?redirect=` callback URL — which
 * survives untouched inside the provider's `state` param and is re-parsed by
 * GoogleController/FacebookController. Returns "" when there is nothing to
 * carry, so callers can append it unconditionally.
 */
export function oauthCallbackQuery(referralCode?: string): string {
  const params = new URLSearchParams();
  if (referralCode) params.set("ref", referralCode);
  for (const [key, value] of Object.entries(readAcquisitionCookie())) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
  // Google Ads "Submit lead form" conversion — registration is our lead event.
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL
    || "AW-18376010770/pxCWCOXOid4cEJLYrrpE";
  gaEvent("conversion", { send_to: label, value: 1.0, currency: "EGP" });
  // Named Google Ads conversion action (event-based, tied to the AW-18376010770
  // tag already loaded site-wide — no send_to label needed for this one).
  gaEvent("ads_conversion_Sign_Up_1");
}

/**
 * Paid subscription confirmed — Google Ads "Purchase" conversion.
 * @param value in EGP (Paymob always charges EGP — see billing docs).
 */
export function trackPurchase(value: number, orderId?: string | number): void {
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL
    || "AW-18376010770/9KZ1COLOid4cEJLYrrpE";
  gaEvent("conversion", {
    send_to: label,
    value,
    currency: "EGP",
    transaction_id: orderId != null ? String(orderId) : undefined,
  });
}

/**
 * A domain was actually created (server confirmed it, not a button click or
 * page load) — the real activation signal, per Google Ads' own guidance:
 * fire on success only, so bidding optimizes toward people who finish
 * setup, not everyone who glances at the form.
 */
export function trackDomainAdded(domain?: string): void {
  gaEvent("domain_added", domain ? { domain } : {});
}

/**
 * First tracking event ever received for the account — the "aha moment"
 * proving the snippet actually works. Google Ads conversion action (manual,
 * not a send_to label because it has none set — fires as a plain named event
 * like ads_conversion_Sign_Up_1).
 */
export function trackFirstVisitor(): void {
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_FIRST_VISITOR_LABEL
    || "AW-18376010770/eCvCCJ-3wuIcEJLYrrpE";
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
