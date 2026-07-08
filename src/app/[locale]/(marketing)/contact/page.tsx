import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";
import ContactForm from "@/components/marketing/ContactForm";

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
          <h2>أرسل لنا رسالة</h2>
          <p>املأ النموذج وسنعود إليك.</p>
          <ContactForm locale={params.locale} />
          <h2>أو راسلنا مباشرة</h2>
          <p>بريد: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <p>عادةً نردّ خلال يوم عمل واحد.</p>
        </>
      ) : (
        <>
          <h2>Send us a message</h2>
          <p>Fill the form and we'll get back to you.</p>
          <ContactForm locale={params.locale} />
          <h2>Or email us directly</h2>
          <p>Email: <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a></p>
          <p>We usually reply within one business day.</p>
        </>
      )}
    </MarketingDoc>
  );
}
