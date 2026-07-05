import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc
      locale={params.locale}
      title={ar ? "تواصل معنا" : "Contact us"}
      subtitle={ar ? "نقرأ كل رسالة." : "We read every message."}
    >
      {ar ? (
        <>
          <h2>الدعم</h2>
          <p>بريد: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <h2>المبيعات</h2>
          <p>للخطط والاتفاقيات: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <p>عادةً نردّ خلال يوم عمل واحد.</p>
        </>
      ) : (
        <>
          <h2>Support</h2>
          <p>Email: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <h2>Sales</h2>
          <p>Plans & partnerships: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <p>We usually reply within one business day.</p>
        </>
      )}
    </MarketingDoc>
  );
}
