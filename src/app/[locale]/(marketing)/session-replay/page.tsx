import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, Flag, GitBranch, Check } from "lucide-react";
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
  const url = `${SITE_URL}${localePath(params.locale, "/session-replay")}`;
  return {
    title: t.metaTitle, description: t.metaDesc,
    keywords: ["session replay tool", "session replay software", "visitor recording", "screen recording analytics", "Hotjar alternative", "rrweb session replay", "إعادة تشغيل الجلسات", "تسجيل الزوار"],
    alternates: { canonical: url, languages: { en: `${SITE_URL}${localePath("en", "/session-replay")}`, ar: `${SITE_URL}${localePath("ar", "/session-replay")}` } },
    openGraph: { title: t.metaTitle, description: t.metaDesc, url, type: "website", images: [`${SITE_URL}${localePath(params.locale, "/opengraph-image")}`] },
  };
}

export default function SessionReplayLanding({ params }: Props) {
  const ar = params.locale === "ar";
  const t = C[ar ? "ar" : "en"];
  const reg = `/${params.locale}/auth/register`;
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: t.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const mono = { fontFamily: "var(--font-mono-marketing)" };
  const CTA = ({ label }: { label: string }) => (
    <Link href={reg} className="inline-flex items-center justify-center rounded-none bg-[#00E5FF] hover:bg-[#33EAFF] text-black shadow-none px-7 py-3.5 text-base font-bold transition-colors">{label}</Link>
  );
  const Badge = ({ label }: { label: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-green-400 mb-6" style={mono}>
      <Check className="w-3.5 h-3.5" /> {label}
    </span>
  );

  return (
    <div dir={t.dir} className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden text-center pt-16 sm:pt-20 pb-16 sm:pb-24 bg-black">
          <GradientBlobs />
          <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-8">
            {/* Above-the-fold hero: renders at full opacity immediately, no
                scroll-triggered Reveal — whileInView wasn't reliably firing
                for content already in the viewport on cold load, leaving a
                washed-out ~30%-opacity hero until the visitor scrolled. */}
            <Badge label={t.badge} />
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5 text-white">{t.heroH}</h1>
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-8">{t.heroSub}</p>
            <CTA label={t.cta} />

            <div className="mt-14 sm:mt-16 max-w-3xl mx-auto">
              <BrowserFrame url={t.previewLabel}>
                <div className="relative w-full aspect-[16/9] bg-black border border-[#262626] overflow-hidden flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-[#00E5FF]" />
                  </div>
                  <div className="absolute inset-x-6 top-4 h-3 w-1/3 bg-white/10" />
                </div>
                {/* Timeline with flagged moments */}
                <div className="relative mt-4 h-2 bg-[#171717] overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-[62%] bg-[#00E5FF]/60" />
                </div>
                <div className="flex justify-between mt-2 flex-wrap gap-1">
                  {t.previewMarkers.map((m, i) => (
                    <span key={m} className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400" style={mono}>
                      <Flag className="w-3 h-3" /> {m} <span className="text-neutral-500 font-normal">· 0:{12 + i * 9}s</span>
                    </span>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">{t.probH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.probP}</p>
          </Reveal>
        </section>

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

        <section className="py-16 sm:py-20 bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.cmpH}</h2>
            <p className="text-lg text-neutral-400 max-w-3xl">{t.cmpP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-black">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.useH}</h2></Reveal>
            <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#262626] border border-[#262626]">
              {t.uses.map(([h, p]) => (
                <RevealItem key={h} className="bg-black p-5 hover:bg-[#0A0A0A] transition-colors">
                  <p className="font-bold text-[#00E5FF] mb-1">{h}</p>
                  <p className="text-sm text-neutral-400">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="py-16 sm:py-20 text-center bg-[#0A0A0A] border-y border-[#262626]">
          <Reveal className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{t.setupH}</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">{t.setupP}</p>
          </Reveal>
        </section>

        <section className="py-16 sm:py-20 bg-black">
          <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">{t.faqH}</h2></Reveal>
            <RevealGroup className="border border-[#262626] bg-[#0A0A0A]">
              {t.faq.map(([q, a]) => (
                <RevealItem key={q} className="p-5 border-b border-[#262626] last:border-b-0">
                  <p className="font-bold text-white mb-1">{q}</p>
                  <p className="text-neutral-400">{a}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="relative isolate overflow-hidden py-20 sm:py-24 text-center bg-[#0A0A0A] border-t border-[#262626]">
          <GradientBlobs variant="compact" />
          <div className="relative max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-[1.08] text-white">{t.finalH}</h2></Reveal>
            <Reveal delay={0.1}><CTA label={t.ctaFinal} /></Reveal>
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
