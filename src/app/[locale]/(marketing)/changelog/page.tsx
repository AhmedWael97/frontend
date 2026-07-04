import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Changelog" };

const ENTRIES = [
  { date: "Jul 2026", en: ["Period comparison (Today vs Yesterday, week/month).", "User journey on identities.", "Faster mobile load — removed render-blocking fonts + lighter forms."], ar: ["مقارنة الفترات (اليوم مقابل الأمس، أسبوع/شهر).", "رحلة المستخدم في الهويّات.", "تحميل أسرع على الجوال."] },
  { date: "Jun 2026", en: ["Agency workspaces & team seats.", "LTV by source, channel mix, cohort retention.", "Visual A/B testing studio."], ar: ["مساحات عمل الوكالات ومقاعد الفريق.", "القيمة الدائمة حسب المصدر ومزيج القنوات.", "استوديو اختبارات A/B المرئي."] },
];

export default function ChangelogPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc locale={params.locale} title={ar ? "سجل التغييرات" : "Changelog"} subtitle={ar ? "أحدث ما شحنّاه." : "What we've shipped recently."}>
      {ENTRIES.map((e) => (
        <div key={e.date}>
          <h2>{e.date}</h2>
          <ul className="list-disc ms-5 space-y-1">
            {(ar ? e.ar : e.en).map((li, i) => <li key={i}>{li}</li>)}
          </ul>
        </div>
      ))}
    </MarketingDoc>
  );
}
