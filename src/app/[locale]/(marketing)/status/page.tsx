import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Status" };

export default function StatusPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  const services = ar
    ? ["واجهة التتبّع (استقبال البيانات)", "لوحة التحكم", "واجهة API", "التقارير والذكاء الاصطناعي"]
    : ["Tracking ingest", "Dashboard", "API", "Reports & AI"];
  return (
    <MarketingDoc
      locale={params.locale}
      title={ar ? "حالة النظام" : "System status"}
      subtitle={ar ? "حالة خدمات EYE اللحظية." : "Live status of EYE services."}
    >
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 font-bold text-emerald-500">
        {ar ? "جميع الأنظمة تعمل" : "All systems operational"}
      </div>
      <ul className="divide-y divide-outline-variant/15 rounded-xl border border-outline-variant/15">
        {services.map((s) => (
          <li key={s} className="flex items-center justify-between px-4 py-3">
            <span className="text-on-surface">{s}</span>
            <span className="inline-flex items-center gap-2 text-sm text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500" />{ar ? "يعمل" : "Operational"}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm">{ar ? "لأي انقطاع، راسلنا:" : "Report an incident:"} <a href="mailto:support@eye-analsyis.live">support@eye-analsyis.live</a></p>
    </MarketingDoc>
  );
}
