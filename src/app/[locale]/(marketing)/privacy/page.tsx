import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ShieldCheck } from "lucide-react";
import { localePath } from "@/lib/seo";

const CONTENT = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: June 29, 2026",
    intro:
      "EYE Analytics (“EYE”, “we”, “us”) operates the website analytics platform at eye-analsyis.live. We are privacy-first by design: our tracker uses no advertising cookies and does not store personal data about your visitors. This policy explains what we collect, why, and your rights.",
    sections: [
      { h: "1. Who We Are", p: [
        "EYE Analytics provides a website analytics service that helps website owners understand visitor behavior — live visitors, heatmaps, funnels, and AI summaries — without cookies or invasive tracking.",
        "For any privacy question or request, contact us at info@eye-analysis.online.",
      ]},
      { h: "2. Information We Collect", p: [
        "Account data: when you create an account we collect your name, email address, and password (stored encrypted). If you subscribe to a paid plan, our payment provider processes your payment details — we do not store full card numbers.",
        "Service usage data: how you use the EYE dashboard (pages viewed, features used) to operate and improve the service.",
        "Visitor analytics data (on behalf of our customers): when a customer installs our tracker on their site, we collect anonymous, aggregated analytics such as page views, clicks, device type, approximate country, and a non-identifying visitor hash. We do not use cookies for this and do not collect names, emails, or precise location of those visitors unless the customer explicitly sends them.",
      ]},
      { h: "3. How We Use Information", p: [
        "To provide, maintain, and secure the service; to process payments and manage subscriptions; to communicate important account and service notices; and to improve features.",
        "We do not sell your personal data, and we do not use your data for third-party advertising.",
      ]},
      { h: "4. Cookies & Tracking Technologies", p: [
        "Our visitor analytics tracker is cookieless. We use essential browser storage (e.g. localStorage) only to keep you signed in and to remember preferences such as language and theme.",
        "Our own marketing site may use measurement pixels (e.g. for our ad campaigns) to understand which campaigns work. These are limited to our marketing pages and never used to track our customers’ visitors.",
      ]},
      { h: "5. Sharing & Third Parties", p: [
        "We share data only with service providers who help us run EYE, under confidentiality obligations: payment processing (Paymob), cloud hosting, and email delivery. We may disclose information if required by law.",
        "We never sell personal data.",
      ]},
      { h: "6. Data Retention", p: [
        "Account data is retained while your account is active. Analytics data is retained according to your plan’s retention period and then deleted. You can request deletion of your account and associated data at any time.",
      ]},
      { h: "7. Your Rights", p: [
        "Depending on your jurisdiction (including GDPR), you may have the right to access, correct, export, or delete your personal data, and to object to or restrict certain processing.",
        "To exercise any right, email info@eye-analysis.online and we will respond within a reasonable time.",
      ]},
      { h: "8. Data Security", p: [
        "We use industry-standard measures — encryption in transit, hashed passwords, and access controls — to protect your data. No method of transmission is 100% secure, but we work continuously to safeguard your information.",
      ]},
      { h: "9. International Transfers", p: [
        "Your data may be processed on servers located in different countries. Where required, we apply appropriate safeguards for such transfers.",
      ]},
      { h: "10. Children’s Privacy", p: [
        "EYE is not intended for individuals under 18, and we do not knowingly collect personal data from children.",
      ]},
      { h: "11. Changes to This Policy", p: [
        "We may update this policy from time to time. The “Last updated” date above reflects the latest version, and material changes will be communicated where appropriate.",
      ]},
      { h: "12. Contact Us", p: [
        "Questions about this Privacy Policy? Email info@eye-analysis.online.",
      ]},
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 29 يونيو 2026",
    intro:
      "تُشغّل EYE Analytics (“EYE”، “نحن”) منصة تحليلات المواقع على eye-analsyis.live. نحن نضع الخصوصية أولًا بحكم التصميم: أداة التتبع لدينا لا تستخدم كوكيز إعلانية ولا تخزّن بيانات شخصية عن زوار موقعك. توضّح هذه السياسة ما نجمعه ولماذا، وما هي حقوقك.",
    sections: [
      { h: "1. من نحن", p: [
        "تقدّم EYE Analytics خدمة تحليلات للمواقع تساعد أصحاب المواقع على فهم سلوك الزوار — الزوار المباشرون، الخرائط الحرارية، القمع، والملخصات بالذكاء الاصطناعي — بدون كوكيز أو تتبع متطفّل.",
        "لأي سؤال أو طلب يخص الخصوصية، تواصل معنا على info@eye-analysis.online.",
      ]},
      { h: "2. المعلومات التي نجمعها", p: [
        "بيانات الحساب: عند إنشاء حساب نجمع اسمك وبريدك الإلكتروني وكلمة المرور (مخزّنة مشفّرة). عند الاشتراك في باقة مدفوعة، يعالج مزوّد الدفع تفاصيل دفعك — ونحن لا نخزّن أرقام البطاقات كاملة.",
        "بيانات استخدام الخدمة: كيفية استخدامك للوحة تحكم EYE (الصفحات والميزات) لتشغيل الخدمة وتحسينها.",
        "بيانات تحليلات الزوار (نيابة عن عملائنا): عند تثبيت العميل لأداة التتبع على موقعه، نجمع تحليلات مجهّلة ومجمّعة مثل مشاهدات الصفحات والنقرات ونوع الجهاز والدولة التقريبية ومعرّف زائر غير شخصي. لا نستخدم كوكيز لذلك ولا نجمع أسماء أو بريد أو موقعًا دقيقًا لهؤلاء الزوار إلا إذا أرسلها العميل صراحةً.",
      ]},
      { h: "3. كيف نستخدم المعلومات", p: [
        "لتقديم الخدمة وصيانتها وتأمينها؛ ومعالجة المدفوعات وإدارة الاشتراكات؛ وإرسال إشعارات مهمة تخص الحساب والخدمة؛ وتحسين الميزات.",
        "نحن لا نبيع بياناتك الشخصية، ولا نستخدم بياناتك لإعلانات طرف ثالث.",
      ]},
      { h: "4. الكوكيز وتقنيات التتبع", p: [
        "أداة تحليلات الزوار لدينا تعمل بدون كوكيز. نستخدم تخزينًا أساسيًا في المتصفح (مثل localStorage) فقط لإبقائك مسجّلًا للدخول وتذكّر تفضيلاتك مثل اللغة والمظهر.",
        "قد يستخدم موقعنا التسويقي بكسلات قياس (مثلًا لحملاتنا الإعلانية) لفهم الحملات الأفضل. تقتصر هذه على صفحاتنا التسويقية ولا تُستخدم أبدًا لتتبع زوار عملائنا.",
      ]},
      { h: "5. المشاركة والأطراف الثالثة", p: [
        "نشارك البيانات فقط مع مزوّدي الخدمات الذين يساعدوننا في تشغيل EYE، وبموجب التزامات سرّية: معالجة المدفوعات (Paymob)، الاستضافة السحابية، وإرسال البريد. وقد نفصح عن معلومات إذا تطلّب القانون ذلك.",
        "نحن لا نبيع البيانات الشخصية إطلاقًا.",
      ]},
      { h: "6. الاحتفاظ بالبيانات", p: [
        "يُحتفظ ببيانات الحساب طالما كان حسابك نشطًا. ويُحتفظ ببيانات التحليلات وفق مدة الاحتفاظ الخاصة بباقتك ثم تُحذف. يمكنك طلب حذف حسابك وبياناتك المرتبطة في أي وقت.",
      ]},
      { h: "7. حقوقك", p: [
        "بحسب ولايتك القضائية (بما في ذلك GDPR)، قد يكون لك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو تصديرها أو حذفها، والاعتراض على معالجة معيّنة أو تقييدها.",
        "لممارسة أي حق، راسلنا على info@eye-analysis.online وسنرد خلال وقت معقول.",
      ]},
      { h: "8. أمن البيانات", p: [
        "نستخدم تدابير وفق معايير الصناعة — التشفير أثناء النقل، وتجزئة كلمات المرور، وضوابط الوصول — لحماية بياناتك. لا توجد طريقة نقل آمنة 100%، لكننا نعمل باستمرار على حماية معلوماتك.",
      ]},
      { h: "9. النقل الدولي للبيانات", p: [
        "قد تتم معالجة بياناتك على خوادم في دول مختلفة. وحيثما يلزم، نطبّق ضمانات مناسبة لمثل هذا النقل.",
      ]},
      { h: "10. خصوصية الأطفال", p: [
        "خدمة EYE غير موجّهة لمن هم دون 18 عامًا، ولا نجمع عن قصد بيانات شخصية من الأطفال.",
      ]},
      { h: "11. تغييرات على هذه السياسة", p: [
        "قد نحدّث هذه السياسة من وقت لآخر. ويعكس تاريخ “آخر تحديث” أعلاه أحدث نسخة، وسيتم إبلاغ التغييرات الجوهرية عند الاقتضاء.",
      ]},
      { h: "12. تواصل معنا", p: [
        "أسئلة حول سياسة الخصوصية؟ راسلنا على info@eye-analysis.online.",
      ]},
    ],
  },
};

export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr ? "سياسة الخصوصية — EYE" : "Privacy Policy — EYE";
  const description = isAr
    ? "سياسة خصوصية EYE Analytics: ما نجمعه، وكيف نستخدمه، وحقوقك. تحليلات تحترم الخصوصية بدون كوكيز."
    : "EYE Analytics privacy policy: what we collect, how we use it, and your rights. Privacy-first, cookieless analytics.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: localePath(params.locale, "/privacy"), languages: { en: localePath("en", "/privacy"), ar: localePath("ar", "/privacy") } },
  };
}

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const c = CONTENT[locale === "ar" ? "ar" : "en"];

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen pt-28 sm:pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
              {c.title}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface mb-2">{c.title}</h1>
          <p className="text-sm text-on-surface-variant mb-8">{c.updated}</p>
          <p className="text-base text-on-surface-variant leading-relaxed mb-10">{c.intro}</p>

          <div className="space-y-8">
            {c.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-lg font-bold text-on-surface mb-3">{s.h}</h2>
                <div className="space-y-3">
                  {s.p.map((para, i) => (
                    <p key={i} className="text-sm sm:text-[15px] text-on-surface-variant leading-relaxed">{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
