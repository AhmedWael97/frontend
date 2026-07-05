import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "GDPR" };

export default function GdprPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc locale={params.locale} title={ar ? "الامتثال لـ GDPR" : "GDPR Compliance"} subtitle={ar ? "مصمَّمون للخصوصية افتراضيًا." : "Built privacy-first by design."}>
      {ar ? (
        <>
          <p>صُمّم EYE ليساعد أصحاب المواقع على الامتثال للائحة GDPR: تتبّع بلا كوكيز، بلا بيانات شخصية للزوّار افتراضيًا، وتقليل جمع البيانات.</p>
          <h2>حقوقك</h2>
          <p>الوصول، التصحيح، الحذف، والنقل. لممارسة أي حق راسل <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a>.</p>
          <h2>معالجة البيانات</h2>
          <p>نعالج بيانات التحليلات نيابةً عن عملائنا (كمعالِج بيانات). تتوفّر اتفاقية معالجة بيانات (DPA) عند الطلب.</p>
          <h2>حذف البيانات</h2>
          <p>يمكن للعملاء تصدير أو حذف بياناتهم من اللوحة أو بالتواصل معنا.</p>
        </>
      ) : (
        <>
          <p>EYE is built to help site owners stay GDPR-compliant: cookieless tracking, no personal visitor data by default, and data minimization.</p>
          <h2>Your rights</h2>
          <p>Access, rectification, erasure, and portability. To exercise any right, email <a href="mailto:info@eye-analysis.online">info@eye-analysis.online</a>.</p>
          <h2>Data processing</h2>
          <p>We process analytics data on behalf of our customers (as a data processor). A Data Processing Agreement (DPA) is available on request.</p>
          <h2>Data deletion</h2>
          <p>Customers can export or delete their data from the dashboard or by contacting us.</p>
        </>
      )}
    </MarketingDoc>
  );
}
