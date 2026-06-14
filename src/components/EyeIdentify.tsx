"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

/**
 * Tells our own EYE tracker who the logged-in user is, so they appear under
 * Known Visitors / Identities (instead of anonymous). Waits for the async
 * tracker to load, then calls EYE.identify(email, traits). No-op when logged
 * out or when the tracker isn't present (e.g. localhost, where it's skipped).
 */
export function EyeIdentify() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.email) return;
    let tries = 0;
    let cancelled = false;

    const fire = () => {
      if (cancelled) return;
      const eye = (window as unknown as { EYE?: { identify?: (id: string, traits?: Record<string, unknown>) => void } }).EYE;
      if (eye?.identify) {
        eye.identify(user.email, {
          user_id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else if (tries++ < 50) {
        setTimeout(fire, 200); // wait up to ~10s for the async tracker
      }
    };
    fire();

    return () => { cancelled = true; };
  }, [user?.id, user?.email, user?.name, user?.role]);

  return null;
}
