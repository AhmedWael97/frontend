"use client";

import { useLocale } from "next-intl";

// Floating WhatsApp contact button. Shown site-wide via the locale layout.
// Number is env-overridable (NEXT_PUBLIC_WHATSAPP_NUMBER) but defaults to the
// support line. wa.me expects the number in international format, digits only.
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201009569092").replace(/\D/g, "");

export function WhatsAppButton() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const label = isAr ? "تواصل معنا على واتساب" : "Chat with us on WhatsApp";
  const text = isAr ? "تواصل معنا" : "Chat with us";

  // Pre-filled greeting so the conversation opens with context.
  const greeting = encodeURIComponent(isAr ? "مرحباً، لديّ سؤال حول EYE." : "Hi, I have a question about EYE.");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${greeting}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed bottom-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-3.5 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 ltr:right-5 rtl:left-5"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.16-1.55a12 12 0 0 0 3.88.64h.01C22.68 28.09 28 22.69 28 16.05 28 8.4 22.68 3 16.04 3Zm0 21.93h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.85.73.78-3.75-.24-.39a9.92 9.92 0 0 1-1.52-5.27c0-5.49 4.47-9.95 9.96-9.95 2.66 0 5.16 1.04 7.04 2.92a9.86 9.86 0 0 1 2.91 7.04c0 5.49-4.47 9.96-9.95 9.96Zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">{text}</span>
    </a>
  );
}
