import type { Metadata } from "next";
import Link from "next/link";
import { Eye, PlayCircle, Flag, GitBranch } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

type Props = { params: { locale: string } };

const C = {
  en: {
    dir: "ltr",
    metaTitle: "Session Replay Software | Watch Real Visitor Recordings | EYE",
    metaDesc: "Session replay included in your analytics — watch real visitor recordings, flagged at the exact moment of rage clicks, errors, or drop-off. Cookieless, privacy-safe, free plan.",
    cta: "Get session replay free", ctaFinal: "Start free — session replay included",
    trust: "Free plan includes session replay · No cookies · 2-minute setup",
    heroH: "Watch real visitor sessions — see exactly what went wrong.",
    heroSub: "Session replay recreates real visits so you can watch where people got stuck, rage-clicked, or abandoned a form — instead of guessing from a drop-off percentage.",
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
    finalNote: "No credit card required.",
  },
  ar: {
    dir: "rtl",
    metaTitle: "برنامج إعادة تشغيل الجلسات | شاهد تسجيلات زوّار حقيقية | EYE",
    metaDesc: "إعادة تشغيل الجلسات مدمجة في تحليلاتك — شاهد تسجيلات حقيقية للزوّار، مع تمييز لحظة نقرات الغضب والأخطاء والتسرّب. بدون كوكيز، آمن للخصوصية، خطة مجانية.",
    cta: "احصل على إعادة تشغيل الجلسات مجانًا", ctaFinal: "ابدأ مجانًا — إعادة تشغيل الجلسات مشمولة",
    trust: "الخطة المجانية تشمل إعادة تشغيل الجلسات · بدون كوكيز · تركيب خلال دقيقتين",
    heroH: "شاهد جلسات زوّار حقيقية — واعرف بالضبط أين حدثت المشكلة.",
    heroSub: "تعيد إعادة تشغيل الجلسات بناء الزيارات الحقيقية لتشاهد أين توقف الزوّار أو نقروا بغضب أو تخلّوا عن نموذج — بدلًا من التخمين من نسبة تسرّب.",
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
    finalNote: "بدون بطاقة ائتمان.",
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
    <Link href={reg} className="inline-flex items-center justify-center rounded-xl bg-primary text-on-primary px-7 py-3.5 text-base font-bold hover:opacity-90 transition-opacity">{label}</Link>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-background text-on-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <header className="border-b border-outline-variant/10"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
        <Link href={`/${params.locale}`} className="flex items-center gap-2" aria-label="EYE home">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"><Eye className="w-4 h-4 text-white" /></span>
          <span className="text-lg font-black tracking-tighter text-primary uppercase">EYE</span>
        </Link>
      </div></header>

      <main className="max-w-5xl mx-auto px-4">
        <section className="text-center py-16 sm:py-24">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-5">{t.heroH}</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">{t.heroSub}</p>
          <CTA label={t.cta} />
          <p className="text-sm text-on-surface-variant/80 mt-4">{t.trust}</p>
        </section>

        <section className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">{t.probH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.probP}</p>
        </section>

        <section className="py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {t.benefits.map((b) => (
            <div key={b.h} className="rounded-2xl border border-outline-variant/15 p-6">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><b.icon className="w-5 h-5 text-primary" /></span>
              <h3 className="font-black text-lg mb-2">{b.h}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{b.p}</p>
            </div>
          ))}
        </section>

        <section className="py-12 border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.cmpH}</h2>
          <p className="text-lg text-on-surface-variant max-w-3xl">{t.cmpP}</p>
        </section>

        <section className="py-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-6">{t.useH}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {t.uses.map(([h, p]) => (
              <div key={h} className="rounded-xl border border-outline-variant/15 p-5">
                <p className="font-bold text-primary mb-1">{h}</p>
                <p className="text-sm text-on-surface-variant">{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 text-center border-t border-outline-variant/10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.setupH}</h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">{t.setupP}</p>
        </section>

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

        <section className="py-20 text-center border-t border-outline-variant/10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">{t.finalH}</h2>
          <CTA label={t.ctaFinal} />
          <p className="text-sm text-on-surface-variant/80 mt-4">{t.finalNote}</p>
        </section>
      </main>

      <footer className="border-t border-outline-variant/10 py-8 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} EYE Analytics · <a href="mailto:info@eye-analysis.online" className="hover:text-on-surface">info@eye-analysis.online</a>
      </footer>
    </div>
  );
}
