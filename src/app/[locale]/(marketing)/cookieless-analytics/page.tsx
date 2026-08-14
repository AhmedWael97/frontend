import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ShieldCheck, Zap, BarChart3, Cookie } from "lucide-react";
import { SITE_URL, localePath } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem, GradientBlobs } from "@/components/marketing/Reveal";
import { BrowserFrame } from "@/components/marketing/BrowserFrame";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import MobileCtaBar from "@/components/marketing/MobileCtaBar";
import SignupPopup from "@/components/marketing/SignupPopup";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Website Analytics Without the Cookie Banner | EYE",
    metaDesc: "Cookieless, GDPR-ready website analytics — no consent popup, no personal data. See 100% of your traffic with heatmaps, funnels & live visitors. Free 30-day trial.",
    cta: "Start free — no credit card",
    ctaShort: "Create free account",
    badge: "30-day free trial — no credit card, ever",
    heroH: "Website analytics without the cookie banner.",
    heroSub: "EYE tracks visitors, conversions, and behavior with zero cookies and zero personal data. GDPR compliant out of the box — no consent popup, no legal headache.",
    previewH: "Visitors actually counted",
    previewA: "EYE (cookieless)",
    previewB: "Typical cookie-based tool",
    previewNote: "Illustrative — cookie-based tools miss anyone who rejects consent. EYE has nothing to reject.",
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
    badge: "تجربة مجانية 30 يومًا — بدون بطاقة ائتمان أبدًا",
    heroH: "تحليلات لموقعك — بدون شريط الموافقة على الكوكيز.",
    heroSub: "EYE يتتبّع الزوّار والتحويلات وسلوك المستخدمين بدون أي كوكيز وبدون تخزين بيانات شخصية. متوافق مع GDPR تلقائيًا — بلا نافذة موافقة، وبلا صداع قانوني.",
    previewH: "الزوّار المُحتسبون فعليًا",
    previewA: "EYE (بدون كوكيز)",
    previewB: "أداة تعتمد على الكوكيز",
    previewNote: "توضيحي — الأدوات القائمة على الكوكيز تفقد كل من يرفض الموافقة. EYE لا يوجد لديه ما يُرفض.",
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
  const url = `${SITE_URL}${localePath(params.locale, "/cookieless-analytics")}`;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    keywords: ["cookieless analytics", "GDPR analytics", "Google Analytics alternative", "analytics without cookie banner", "analytics without cookies", "cookie-free analytics", "privacy analytics", "تحليلات بدون كوكيز", "بديل جوجل أناليتكس"],
    alternates: {
      canonical: url,
      languages: { en: `${SITE_URL}${localePath("en", "/cookieless-analytics")}`, ar: `${SITE_URL}${localePath("ar", "/cookieless-analytics")}` },
    },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`] },
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

  const mono = { fontFamily: "var(--font-mono-marketing)" };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 py-3.5 text-base font-bold transition-colors">
      {label}
    </Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-green-400 mb-6" style={mono}>
      <ShieldCheck className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
        {/* Hero */}
        <section className="relative isolate overflow-hidden text-center pt-16 sm:pt-20 pb-16 sm:pb-24 bg-black">
          <GradientBlobs />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-8">
            <Reveal><Badge label={t.badge} /></Reveal>
            <Reveal delay={0.06}><h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-white">{t.heroH}</h1></Reveal>
            <Reveal delay={0.14}><p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">{t.heroSub}</p></Reveal>
            <Reveal delay={0.22}><CTA label={t.cta} /></Reveal>

            <Reveal delay={0.3} className="mt-14 sm:mt-16 max-w-2xl mx-auto">
              <BrowserFrame url="dashboard.eye-analysis.online">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4" style={mono}>{t.previewH}</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-white">{t.previewA}</span>
                      <span className="font-bold text-[#00E5FF]" style={mono}>100%</span>
                    </div>
                    <div className="h-3 bg-[#171717] overflow-hidden"><div className="h-full w-full bg-[#00E5FF]" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-500">{t.previewB}</span>
                      <span className="font-bold text-neutral-500" style={mono}>~60%</span>
                    </div>
                    <div className="h-3 bg-[#171717] overflow-hidden"><div className="h-full w-[60%] bg-white/25" /></div>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-4">{t.previewNote}</p>
              </BrowserFrame>
            </Reveal>
          </div>
        </section>

        {/* Problem */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">{t.probH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-20 bg-black">
          <RevealGroup className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
            {t.benefits.map((b) => (
              <RevealItem key={b.h} className="bg-black p-6 hover:bg-[#0A0A0A] transition-colors">
                <span className="w-11 h-11 rounded-none border border-[#262626] bg-[#171717] flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-[#00E5FF]" /></span>
                <h3 className="font-bold text-lg mb-2 text-white">{b.h}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{b.p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Comparison */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">{t.cmpH}</h2></Reveal>
            <Reveal delay={0.1} className="overflow-x-auto border border-[#262626] bg-black">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#171717]">
                    <th className="text-start px-4 py-3"></th>
                    <th className="px-4 py-3 font-bold text-[#00E5FF]">EYE</th>
                    <th className="px-4 py-3 font-bold text-neutral-500">Google Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {t.cmpRows.map((r) => (
                    <tr key={r[0] as string} className="border-b border-[#262626] last:border-0">
                      <td className="px-4 py-3 text-neutral-400">{r[0]}</td>
                      <td className="px-4 py-3 text-center">
                        {["Yes", "No", "نعم", "لا"].includes(String(r[3]))
                          ? (r[1] ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />)
                          : <span className="font-semibold text-white">{r[3]}</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-500">
                        {["Yes", "No", "نعم", "لا"].includes(String(r[4]))
                          ? (r[2] ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />)
                          : r[4]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>

        {/* Setup */}
        <section className="py-16 sm:py-20 text-center bg-black">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.setupH}</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">{t.setupP}</p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.faqH}</h2></Reveal>
            <RevealGroup className="border border-[#262626] bg-black">
              {t.faq.map(([q, a]) => (
                <RevealItem key={q} className="p-5 border-b border-[#262626] last:border-b-0">
                  <p className="font-bold text-white mb-1">{q}</p>
                  <p className="text-neutral-400">{a}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative isolate overflow-hidden py-20 sm:py-24 text-center bg-black">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-[1.08] text-white">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaShort} /></Reveal>
            <Reveal delay={0.18}><p className="text-sm text-neutral-500 mt-4">{t.finalNote}</p></Reveal>
          </div>
        </section>
      </main>

      <Footer locale={params.locale} />
      <MobileCtaBar />
      <SignupPopup />
    </div>
  );
}
