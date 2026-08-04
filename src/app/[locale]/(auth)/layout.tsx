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
    <div className="min-h-screen bg-surface flex flex-col">
      <InAppBrowserEscape />
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />
      </div>
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-6 sm:py-12">
        {children}
      </main>
      <footer className="py-6 px-8 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-outline-variant/10">
        <div className="text-sm font-bold text-primary uppercase tracking-tighter">EYE</div>
        <div className="flex gap-5 text-xs text-on-surface-variant">
          <a href={`${base}/privacy`} className="hover:text-secondary transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a>
          <a href={`${base}/terms`} className="hover:text-secondary transition-colors">{isAr ? "شروط الاستخدام" : "Terms of Use"}</a>
        </div>
        <p className="text-xs text-on-surface-variant">© {new Date().getFullYear()} EYE Analytics. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
