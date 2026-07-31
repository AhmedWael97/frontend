import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Check, X, ShieldCheck, Zap, BarChart3, Cookie } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Website Analytics Without the Cookie Banner | EYE",
    metaDesc: "Cookieless, GDPR-ready website analytics — no consent popup, no personal data. See 100% of your traffic with heatmaps, funnels & live visitors. Free 30-day trial.",
    cta: "Start free — no credit card",
    ctaShort: "Create free account",
    trust: "30-day free trial · No cookies · GDPR ready",
    heroH: "Website analytics without the cookie banner.",
    heroSub: "EYE tracks visitors, conversions, and behavior with zero cookies and zero personal data. GDPR compliant out of the box — no consent popup, no legal headache.",
    probH: "Consent banners are killing your data.",
    probP: "Every visitor who clicks “Reject” is a visitor Google Analytics never sees. You’re making decisions on half your traffic — and annoying users with popups on the other half.",
    benefits: [
      { icon: Cookie, h: "No cookies, no banner", p: "EYE stores no personal data and uses no cookies. You can legally track every visitor without asking permission first." },
      { icon: BarChart3, h: "All your data, not a sample", p: "Because there’s no consent step, you see 100% of visits — real numbers, real trends, real conversion rates." },
      { icon: Zap, h: "Everything GA gives you, clearer", p: "Live visitors, traffic sources, conversion funnels, and a plain-English daily digest — in one dashboard that doesn’t feel like homework." },
    ],
    cmpH: "EYE vs. Google Analytics",
    cmpRows: [
      ["Cookie banner required", false, true, "No", "Yes (in EU)"],
      ["Sees rejected-consent visitors", true, false, "Yes", "No"],
      ["Individual visitor journeys", true, false, "Yes", "No (aggregates only)"],
      ["Heatmaps included", true, false, "Yes", "No"],
      ["Setup time", true, false, "2 minutes", "Hours"],
    ],
    setupH: "Live in 2 minutes.",
    setupP: "One 2KB script tag. Works with WordPress, Shopify, React — anything. Data starts flowing in seconds.",
    faqH: "Frequently asked",
    faq: [
      ["Do I need a cookie consent banner?", "No. EYE is cookieless and stores no personal data, so no consent banner is required."],
      ["Will it slow down my site?", "No. The tracking script is under 2KB and loads asynchronously."],
      ["Is it really GDPR compliant?", "Yes — no personal data is stored and no cookies are used."],
    ],
    finalH: "Stop guessing with half your data.",
    finalNote: "Free plan: 10,000 events/day. No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "تحليلات المواقع بدون شريط موافقة الكوكيز | EYE",
    metaDesc: "تحليلات مواقع بدون كوكيز ومتوافقة مع GDPR — بلا نافذة موافقة وبلا بيانات شخصية. شاهد 100% من زياراتك مع خرائط حرارية وقمع تحويل وزوّار مباشرين. تجربة مجانية 30 يومًا.",
    cta: "ابدأ مجانًا — بدون بطاقة ائتمان",
    ctaShort: "أنشئ حسابك المجاني",
    trust: "تجربة مجانية ٣٠ يومًا · بدون كوكيز · متوافق مع GDPR",
    heroH: "تحليلات لموقعك — بدون شريط الموافقة على الكوكيز.",
    heroSub: "EYE يتتبّع الزوّار والتحويلات وسلوك المستخدمين بدون أي كوكيز وبدون تخزين بيانات شخصية. متوافق مع GDPR تلقائيًا — بلا نافذة موافقة، وبلا صداع قانوني.",
    probH: "شريط الموافقة يضيّع نصف بياناتك.",
    probP: "كل زائر يضغط “رفض” هو زائر لن يظهر أبدًا في Google Analytics. أنت تتخذ قراراتك بناءً على نصف الزيارات فقط — وتزعج النصف الآخر بنوافذ منبثقة.",
    benefits: [
      { icon: Cookie, h: "بدون كوكيز، بدون شريط موافقة", p: "EYE لا يخزّن بيانات شخصية ولا يستخدم كوكيز. تتبّع كل زائر بشكل قانوني دون طلب إذن." },
      { icon: BarChart3, h: "كل بياناتك، وليس عيّنة منها", p: "لأنه لا توجد خطوة موافقة، ترى ١٠٠٪ من الزيارات — أرقام حقيقية ومعدلات تحويل حقيقية." },
      { icon: Zap, h: "كل ما يقدمه Google Analytics، لكن أوضح", p: "زوّار مباشرون، مصادر الزيارات، قمع التحويل، وملخص يومي بلغة بسيطة — في لوحة واحدة سهلة الفهم." },
    ],
    cmpH: "EYE مقابل Google Analytics",
    cmpRows: [
      ["يتطلب شريط موافقة", false, true, "لا", "نعم (في أوروبا)"],
      ["يرى الزوّار الرافضين للموافقة", true, false, "نعم", "لا"],
      ["رحلات الزوّار الفردية", true, false, "نعم", "لا (إجماليات فقط)"],
      ["خرائط حرارية مدمجة", true, false, "نعم", "لا"],
      ["وقت التركيب", true, false, "دقيقتان", "ساعات"],
    ],
    setupH: "جاهز خلال دقيقتين.",
    setupP: "سطر كود واحد بحجم 2KB. يعمل مع WordPress وShopify وReact — وأي منصة. البيانات تبدأ بالتدفق خلال ثوانٍ.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل أحتاج شريط موافقة كوكيز؟", "لا. EYE بدون كوكيز ولا يخزّن بيانات شخصية، لذا لا حاجة لأي شريط موافقة."],
      ["هل سيبطئ موقعي؟", "لا. سكربت التتبّع أقل من 2KB ويُحمّل بشكل غير متزامن."],
      ["هل هو متوافق فعلًا مع GDPR؟", "نعم — لا يتم تخزين أي بيانات شخصية ولا تُستخدم كوكيز."],
    ],
    finalH: "توقف عن التخمين بنصف بياناتك.",
    finalNote: "الخطة المجانية: ١٠٬٠٠٠ حدث يوميًا. بدون بطاقة ائتمان.",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/cookieless-analytics`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    keywords: ["cookieless analytics", "GDPR analytics", "Google Analytics alternative", "analytics without cookie banner", "analytics without cookies", "cookie-free analytics", "privacy analytics", "تحليلات بدون كوكيز", "بديل جوجل أناليتكس"],
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}/en/cookieless-analytics`, ar: `${SITE_URL}/ar/cookieless-analytics` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}/${params.locale}/opengraph-image`] },
  };
}

export default function CookielessLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = `/${params.locale}/auth/register`;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-xl bg-primary text-on-primary px-7 py-3.5 text-base font-bold hover:opacity-90 transition-opacity">
      {label}
    </Link>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Minimal header — logo only, no nav (dedicated landing) */}
      <header className="border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link href={`/${params.locale}`} className="flex items-center gap-2" aria-label="EYE home">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></span>
            <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <section className="text-center py-16 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-5"><ShieldCheck className="w-3.5 h-3.5" />GDPR</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p>
          <CTA label={t.cta} />
          <p className="text-sm text-on-surface-variant/80 mt-4">{t.trust}</p>
        </section>

        {/* Problem */}
        <section className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">{t.probH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.probP}</p>
        </section>

        {/* Benefits */}
        <section className="py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {t.benefits.map((b) => (
            <div key={b.h} className="rounded-2xl border border-outline-variant/15 p-6">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-primary" /></span>
              <h3 className="font-black text-lg mb-2">{b.h}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{b.p}</p>
            </div>
          ))}
        </section>

        {/* Comparison */}
        <section className="py-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-6 text-center">{t.cmpH}</h2>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/15 bg-surface-container/40">
                  <th className="text-start px-4 py-3"></th>
                  <th className="px-4 py-3 font-black text-primary">EYE</th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant">Google Analytics</th>
                </tr>
              </thead>
              <tbody>
                {t.cmpRows.map((r) => (
                  <tr key={r[0] as string} className="border-b border-outline-variant/10 last:border-0">
                    <td className="px-4 py-3 text-on-surface-variant">{r[0]}</td>
                    <td className="px-4 py-3 text-center">
                      {["Yes", "No", "نعم", "لا"].includes(String(r[3]))
                        ? (r[1] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />)
                        : <span className="font-semibold text-on-surface">{r[3]}</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">
                      {["Yes", "No", "نعم", "لا"].includes(String(r[4]))
                        ? (r[2] ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />)
                        : r[4]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Setup */}
        <section className="py-12 text-center border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.setupH}</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{t.setupP}</p>
        </section>

        {/* FAQ */}
        <section className="py-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-6">{t.faqH}</h2>
          <div className="space-y-4 max-w-3xl">
            {t.faq.map(([q, a]) => (
              <div key={q} className="rounded-xl border border-outline-variant/15 p-5">
                <p className="font-bold text-on-surface mb-1">{q}</p>
                <p className="text-on-surface-variant">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center border-t border-outline-variant/10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">{t.finalH}</h2>
          <CTA label={t.ctaShort} />
          <p className="text-sm text-on-surface-variant/80 mt-4">{t.finalNote}</p>
        </section>
      </main>

      <footer className="border-t border-outline-variant/10 py-8 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} EYE Analytics · <a href="mailto:info@eye-analysis.online" className="hover:text-on-surface">info@eye-analysis.online</a>
      </footer>
    </div>
  );
}
