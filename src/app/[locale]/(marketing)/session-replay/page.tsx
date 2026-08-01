import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, Flag, GitBranch, Check } from "lucide-react";
import { SITE_URL } from "@/lib/seo";
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
    metaTitle: "Session Replay Software | Watch Real Visitor Recordings | EYE",
    metaDesc: "Session replay included in your analytics — watch real visitor recordings, flagged at the exact moment of rage clicks, errors, or drop-off. Cookieless, privacy-safe, free plan.",
    cta: "Get session replay free", ctaFinal: "Start free — session replay included",
    badge: "30-day free trial — no credit card, ever",
    heroH: "Watch real visitor sessions — see exactly what went wrong.",
    heroSub: "Session replay recreates real visits so you can watch where people got stuck, rage-clicked, or abandoned a form — instead of guessing from a drop-off percentage.",
    previewLabel: "recording-4f2a.replay",
    previewMarkers: ["Rage click", "Form abandoned", "JS error"],
    probH: "Your funnel report says visitors dropped off. It doesn't show you why.",
    probP: "A 40% drop-off between step 2 and step 3 tells you something is wrong. It doesn't tell you the date picker was broken on mobile. Session replay does.",
    benefits: [
      { icon: PlayCircle, h: "Only the sessions that matter", p: "EYE doesn't record everything and hope you have time to watch it. It saves sessions with a real signal — rage clicks, errors, abandoned forms, quick exits — plus genuinely engaged visits. Less scrubbing, more finding." },
      { icon: Flag, h: "Marked on the timeline for you", p: "Rage clicks, dead clicks, and JS errors show up as flags right on the playback bar. Skip straight to the moment things broke instead of watching the whole session." },
      { icon: GitBranch, h: "Linked to your funnels", p: "See a drop after a specific funnel step, click through, and watch the actual sessions that dropped there. Straight from the number to the recording." },
    ],
    cmpH: "Session replay, without the wall",
    cmpP: "Most tools sell replay as a separate paid tier on top of analytics. In EYE, it comes with your existing plan — same script tag, same dashboard, no extra bill.",
    useH: "Built for your use case",
    uses: [
      ["Checkout drop-off", "Watch sessions that abandoned checkout and see exactly where they hesitated."],
      ["Broken forms", "Spot the field that keeps getting abandoned before you get a single support ticket about it."],
      ["New feature launch", "Watch how real users interact with a new page in its first days live."],
    ],
    setupH: "One line of code. No separate integration.",
    setupP: "Add data-replay=\"true\" to the same tracker snippet you already use for analytics. Recording starts immediately, no extra script to load.",
    faqH: "Frequently asked",
    faq: [
      ["Does session replay slow my site down?", "No — the replay recorder loads lazily and asynchronously, after your page's own scripts."],
      ["Is it private and GDPR-safe?", "Yes. Add the eye-mask class to any element (password fields, payment forms) to exclude it from recordings, and EYE only uploads sessions that meet a quality bar — not a permanent recording of every click."],
      ["Do I need to record every session to get value?", "No — that's the point. EYE only keeps sessions with a friction signal or real engagement, so you're not paying storage or scrubbing time on empty recordings."],
    ],
    finalH: "Stop guessing why visitors leave. Watch them.",
    finalNote: "Free plan available. No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "برنامج إعادة تشغيل الجلسات | شاهد تسجيلات زوّار حقيقية | EYE",
    metaDesc: "إعادة تشغيل الجلسات مدمجة في تحليلاتك — شاهد تسجيلات حقيقية للزوّار، مع تمييز لحظة نقرات الغضب والأخطاء والتسرّب. بدون كوكيز، آمن للخصوصية، خطة مجانية.",
    cta: "احصل على إعادة تشغيل الجلسات مجانًا", ctaFinal: "ابدأ مجانًا — إعادة تشغيل الجلسات مشمولة",
    badge: "تجربة مجانية 30 يومًا — بدون بطاقة ائتمان أبدًا",
    heroH: "شاهد جلسات زوّار حقيقية — واعرف بالضبط أين حدثت المشكلة.",
    heroSub: "تعيد إعادة تشغيل الجلسات بناء الزيارات الحقيقية لتشاهد أين توقف الزوّار أو نقروا بغضب أو تخلّوا عن نموذج — بدلًا من التخمين من نسبة تسرّب.",
    previewLabel: "recording-4f2a.replay",
    previewMarkers: ["نقرة غضب", "نموذج مهجور", "خطأ برمجي"],
    probH: "تقرير القمع يقول إن الزوّار تسرّبوا. لا يخبرك لماذا.",
    probP: "تسرّب ٤٠٪ بين الخطوة ٢ والخطوة ٣ يخبرك أن هناك مشكلة. لا يخبرك أن منتقي التاريخ كان معطّلاً على الجوال. إعادة تشغيل الجلسات تفعل.",
    benefits: [
      { icon: PlayCircle, h: "فقط الجلسات المهمة", p: "لا يسجّل EYE كل شيء أملاً أن يكون لديك وقت لمشاهدته. يحفظ الجلسات التي فيها إشارة حقيقية — نقرات غضب، أخطاء، نماذج مهجورة، خروج سريع — بالإضافة للزيارات المتفاعلة فعليًا." },
      { icon: Flag, h: "مُعلَّمة على الخط الزمني", p: "نقرات الغضب والنقرات الميتة وأخطاء الجافاسكريبت تظهر كعلامات على شريط التشغيل. انتقل مباشرة للحظة حدوث المشكلة بدل مشاهدة الجلسة كاملة." },
      { icon: GitBranch, h: "مرتبطة بقمع التحويل", p: "شاهد تسرّبًا بعد خطوة معينة في القمع، اضغط، وشاهد الجلسات الفعلية التي تسرّبت هناك. من الرقم مباشرة إلى التسجيل." },
    ],
    cmpH: "إعادة تشغيل الجلسات، بدون حاجز",
    cmpP: "معظم الأدوات تبيع إعادة التشغيل كخطة منفصلة مدفوعة فوق التحليلات. في EYE، هي مشمولة في خطتك الحالية — نفس سطر الكود، نفس اللوحة، بدون فاتورة إضافية.",
    useH: "مصمّم لحالتك",
    uses: [
      ["تسرّب الدفع", "شاهد الجلسات التي تخلّت عن الدفع واعرف بالضبط أين ترددوا."],
      ["نماذج معطّلة", "اكتشف الحقل الذي يُهجَر باستمرار قبل أن تصلك أول تذكرة دعم عنه."],
      ["إطلاق ميزة جديدة", "شاهد كيف يتفاعل المستخدمون الحقيقيون مع صفحة جديدة في أيامها الأولى."],
    ],
    setupH: "سطر كود واحد. بدون تكامل منفصل.",
    setupP: "أضف data-replay=\"true\" لنفس سكربت التتبّع الذي تستخدمه للتحليلات. يبدأ التسجيل فورًا، بدون سكربت إضافي.",
    faqH: "الأسئلة الشائعة",
    faq: [
      ["هل تُبطئ إعادة تشغيل الجلسات موقعي؟", "لا — مسجّل الجلسات يُحمّل بشكل كسول وغير متزامن، بعد سكربتات صفحتك الخاصة."],
      ["هل هي خاصة وآمنة لـ GDPR؟", "نعم. أضف الفئة eye-mask لأي عنصر (حقول كلمات المرور، نماذج الدفع) لاستثنائه من التسجيلات، ولا يرفع EYE إلا الجلسات التي تحقق معيار جودة — وليس تسجيلًا دائمًا لكل نقرة."],
      ["هل أحتاج لتسجيل كل جلسة للاستفادة؟", "لا — هذا بالضبط الهدف. يحتفظ EYE فقط بالجلسات التي فيها إشارة احتكاك أو تفاعل حقيقي، فلا تدفع تخزينًا أو وقت مشاهدة لتسجيلات فارغة."],
    ],
    finalH: "توقف عن تخمين سبب مغادرة الزوّار. شاهدهم.",
    finalNote: "خطة مجانية متاحة. بدون بطاقة ائتمان.",
  },
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const t = C[params.locale === "ar" ? "ar" : "en"];
  const url = `${SITE_URL}/${params.locale}/session-replay`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["session replay tool", "session replay software", "visitor recording", "screen recording analytics", "Hotjar alternative", "rrweb session replay", "إعادة تشغيل الجلسات", "تسجيل الزوار"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}/en/session-replay`, ar: `${SITE_URL}/ar/session-replay` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}/${params.locale}/opengraph-image`] },
  };
}

export default function SessionReplayLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = `/${params.locale}/auth/register`;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-xl bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/30 px-7 py-3.5 text-base font-bold transition-colors">{label}</Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-6">
      <Check className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden text-center pt-28 sm:pt-36 pb-16 sm:pb-24 bg-surface">
          <GradientBlobs />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><Badge label={t.badge} /></Reveal>
            <Reveal delay={0.06}><h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1></Reveal>
            <Reveal delay={0.14}><p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p></Reveal>
            <Reveal delay={0.22}><CTA label={t.cta} /></Reveal>

            <Reveal delay={0.3} className="mt-14 sm:mt-16 max-w-3xl mx-auto">
              <BrowserFrame url={t.previewLabel}>
                <div className="relative w-full aspect-[16/9] rounded-lg bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div className="absolute inset-x-6 top-4 h-3 w-1/3 rounded bg-on-surface/10" />
                </div>
                {/* Timeline with flagged moments */}
                <div className="relative mt-4 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-[62%] bg-violet-500/60 rounded-full" />
                </div>
                <div className="flex justify-between mt-2 flex-wrap gap-1">
                  {t.previewMarkers.map((m, i) => (
                    <span key={m} className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                      <Flag className="w-3 h-3" /> {m} <span className="text-on-surface-variant/60 font-normal">· 0:{12 + i * 9}s</span>
                    </span>
                  ))}
                </div>
              </BrowserFrame>
            </Reveal>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-surface-container/15">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">{t.probH}</h2>
            <p className="text-lg text-on-surface-variant max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <RevealGroup className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.benefits.map((b) => (
              <RevealItem key={b.h} className="rounded-2xl border border-outline-variant/15 p-6 hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 bg-surface-container/20">
                <span className="w-11 h-11 rounded-xl bg-violet-500/12 flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-violet-500 dark:text-violet-400" /></span>
                <h3 className="font-black text-lg mb-2">{b.h}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.p}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="py-16 sm:py-20 bg-surface-container/15">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.cmpH}</h2>
            <p className="text-lg text-on-surface-variant max-w-3xl">{t.cmpP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.useH}</h2></Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.uses.map(([h, p]) => (
                <RevealItem key={h} className="rounded-xl border border-outline-variant/15 p-5 hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300">
                  <p className="font-bold text-violet-500 dark:text-violet-400 mb-1">{h}</p>
                  <p className="text-sm text-on-surface-variant">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="py-16 sm:py-20 text-center bg-surface-container/15">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.setupH}</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{t.setupP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-surface">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-black mb-6">{t.faqH}</h2></Reveal>
            <RevealGroup className="space-y-4">
              {t.faq.map(([q, a]) => (
                <RevealItem key={q} className="rounded-xl border border-outline-variant/15 p-5">
                  <p className="font-bold text-on-surface mb-1">{q}</p>
                  <p className="text-on-surface-variant">{a}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="relative isolate overflow-hidden py-20 sm:py-24 text-center bg-surface">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl sm:text-5xl font-black mb-6 leading-[1.08]">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaFinal} /></Reveal>
            <Reveal delay={0.18}><p className="text-sm text-on-surface-variant/80 mt-4">{t.finalNote}</p></Reveal>
          </div>
        </section>
      </main>

      <Footer locale={params.locale} />
      <MobileCtaBar />
      <SignupPopup />
    </div>
  );
}
