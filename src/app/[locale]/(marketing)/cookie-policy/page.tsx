import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiePolicyPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc locale={params.locale} title={ar ? "سياسة الكوكيز" : "Cookie Policy"} subtitle={ar ? "تحليلاتنا بلا كوكيز إعلانية." : "Our analytics are cookie-free."}>
      {ar ? (
        <>
          <h2>تتبّع الزوّار</h2>
          <p>أداة تتبّع EYE على مواقع عملائنا <strong>لا تستخدم كوكيز</strong> ولا تتبّعًا عبر المواقع. نعتمد على مُعرّف مجهول غير شخصي.</p>
          <h2>لوحة التحكم</h2>
          <p>نستخدم تخزينًا محليًا ضروريًا فقط (localStorage) لإبقائك مسجّلاً وحفظ تفضيلات مثل اللغة والوضع الليلي.</p>
          <h2>موقعنا التسويقي</h2>
          <p>قد تستخدم صفحاتنا التسويقية بيكسلات قياس لحملاتنا الإعلانية فقط، ولا تُستخدم لتتبّع زوّار عملائنا.</p>
          <p>راجع أيضًا <a href={`/${params.locale}/privacy`}>سياسة الخصوصية</a>.</p>
        </>
      ) : (
        <>
          <h2>Visitor tracking</h2>
          <p>The EYE tracker on our customers' sites uses <strong>no cookies</strong> and no cross-site tracking. It relies on an anonymous, non-identifying visitor hash.</p>
          <h2>Dashboard</h2>
          <p>We use essential browser storage (localStorage) only to keep you signed in and remember preferences like language and theme.</p>
          <h2>Our marketing site</h2>
          <p>Our marketing pages may use measurement pixels for our own ad campaigns only — never to track our customers' visitors.</p>
          <p>See also our <a href={`/${params.locale}/privacy`}>Privacy Policy</a>.</p>
        </>
      )}
    </MarketingDoc>
  );
}
