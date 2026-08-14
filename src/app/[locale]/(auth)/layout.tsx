import InAppBrowserEscape from "@/components/auth/InAppBrowserEscape";

export default function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const isAr = params?.locale === "ar";
  const base = `/${params?.locale || "en"}`;
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <InAppBrowserEscape />
      {/* Technical grid texture — replaces the soft ambient glows (banned under the brutalist system) */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <a href={base} className="absolute top-6 ltr:left-6 rtl:right-6 z-20 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-none border border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
          <span className="text-[#00E5FF] text-sm font-bold">◉</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">EYE<span className="text-[#00E5FF]">.</span></span>
      </a>
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-6 sm:py-12">
        {children}
      </main>
      <footer className="py-6 px-8 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#262626] relative z-10" style={{ fontFamily: "var(--font-mono-marketing, inherit)" }}>
        <div className="text-sm font-bold text-white uppercase tracking-tighter">EYE<span className="text-[#00E5FF]">.</span></div>
        <div className="flex gap-5 text-xs text-neutral-500">
          <a href={`${base}/privacy`} className="hover:text-[#00E5FF] transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a>
          <a href={`${base}/terms`} className="hover:text-[#00E5FF] transition-colors">{isAr ? "شروط الاستخدام" : "Terms of Use"}</a>
        </div>
        <p className="text-xs text-neutral-600">© {new Date().getFullYear()} EYE Analytics. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
