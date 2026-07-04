import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  const items = ar
    ? ["روبوت دردشة ذكي داخل اللوحة", "موصلات إعلانات (Google / Meta) تلقائية", "تتبّع ترتيب SEO آلي", "شراء رصيد الذكاء الاصطناعي"]
    : ["In-dashboard AI assistant chatbot", "Automatic ad connectors (Google / Meta)", "Automated SEO rank tracking", "AI credits purchase flow"];
  return (
    <MarketingDoc locale={params.locale} title={ar ? "خارطة الطريق" : "Roadmap"} subtitle={ar ? "ما نعمل عليه قادمًا." : "What we're building next."}>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3 rounded-xl border border-outline-variant/15 px-4 py-3">
            <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-on-surface">{i}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm">{ar ? "اقترح ميزة:" : "Suggest a feature:"} <a href="mailto:support@eye-analsyis.live">support@eye-analsyis.live</a></p>
    </MarketingDoc>
  );
}
