import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc locale={params.locale} title={ar ? "المدوّنة" : "Blog"} subtitle={ar ? "قريبًا." : "Coming soon."}>
      {ar ? (
        <p>نجهّز مقالات عن تحليلات الخصوصية، تحسين التحويل، وأداء الجوال. للإشعار عند النشر راسلنا على <a href="mailto:support@eye-analsyis.live">support@eye-analsyis.live</a>.</p>
      ) : (
        <p>We're preparing articles on privacy analytics, conversion optimization, and mobile performance. Want a ping when we publish? Email <a href="mailto:support@eye-analsyis.live">support@eye-analsyis.live</a>.</p>
      )}
    </MarketingDoc>
  );
}
