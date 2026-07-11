"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

// WhatsApp's own rule: country code + local number, no +, no leading zeros.
// Source number +0201009569092 -> strip non-digits -> strip leading zeros.
const RAW_PHONE = "+0201009569092";
const WA_PHONE = RAW_PHONE.replace(/\D/g, "").replace(/^0+/, "");

/**
 * Persistent WhatsApp quick-chat button — skips the support-chat widget
 * entirely for pre-sales questions, which matters for a mostly-Egypt/Saudi,
 * WhatsApp-first audience. Separate from SupportChatBubble (that's for
 * existing/signed-up users; this is for someone who hasn't decided yet).
 */
export default function WhatsAppButton() {
  const ar = useLocale() === "ar";
  const pathname = usePathname();
  const { token } = useAuthStore();

  // Guest-only: logged-in users already have SupportChatBubble; don't stack
  // two floating buttons on top of each other in the dashboard/admin.
  if (token || pathname?.includes("/admin")) return null;

  const message = ar ? "مرحباً، عندي سؤال عن EYE Analytics" : "Hi, I have a question about EYE Analytics";
  const href = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 start-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.98s.74-2.11 1-2.4c.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z" />
      </svg>
    </a>
  );
}
