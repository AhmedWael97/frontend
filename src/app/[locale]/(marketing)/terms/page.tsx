import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { FileText } from "lucide-react";

const CONTENT = {
  en: {
    title: "Terms of Use",
    updated: "Last updated: June 29, 2026",
    intro:
      "These Terms of Use govern your access to and use of EYE Analytics (“EYE”, “we”, “us”) and the service at eye-analsyis.live. By creating an account or using the service, you agree to these terms.",
    sections: [
      { h: "1. Acceptance of Terms", p: [
        "By accessing or using EYE, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the service.",
      ]},
      { h: "2. Description of Service", p: [
        "EYE provides website visitor analytics — including live visitors, heatmaps, conversion funnels, session insights, and AI summaries — delivered through a tracker script and a web dashboard.",
      ]},
      { h: "3. Eligibility & Accounts", p: [
        "You must be at least 18 years old and able to form a binding contract. You are responsible for keeping your account credentials secure and for all activity under your account.",
        "You agree to provide accurate information and to keep it up to date.",
      ]},
      { h: "4. Free Trial, Subscriptions & Payments", p: [
        "New accounts include a 30-day free trial. After the trial, continued use of paid features requires an active subscription.",
        "Paid plans are billed through our payment provider (Paymob). Prices may be shown in USD and charged in the local currency (e.g. EGP) as disclosed at checkout. Subscriptions renew for the chosen period unless cancelled.",
        "You can cancel at any time; cancellation stops future charges. Except where required by law, payments already made are non-refundable.",
      ]},
      { h: "5. Acceptable Use", p: [
        "You agree not to misuse the service: no unlawful activity, no attempts to breach security or disrupt the service, no reverse engineering, and no use that infringes the rights of others.",
        "You may not use EYE to collect data in violation of applicable law or any third party’s rights.",
      ]},
      { h: "6. Your Data & Responsibilities", p: [
        "You retain ownership of the data you collect through EYE. You grant us the limited rights needed to process it solely to provide the service.",
        "You are responsible for installing the tracker only on websites you own or control, for displaying any notices, and for obtaining any consents required by the laws applicable to your visitors.",
      ]},
      { h: "7. Intellectual Property", p: [
        "EYE and all related software, trademarks, and content are owned by us or our licensors. These Terms grant you a limited, non-exclusive, non-transferable right to use the service — no other rights are granted.",
      ]},
      { h: "8. Service Availability & Changes", p: [
        "We work to keep the service available and reliable, but we do not guarantee uninterrupted operation. We may modify, suspend, or discontinue features with reasonable notice where practicable.",
      ]},
      { h: "9. Disclaimers", p: [
        "The service is provided “as is” and “as available” without warranties of any kind, express or implied, including fitness for a particular purpose. We do not warrant that the service will be error-free.",
      ]},
      { h: "10. Limitation of Liability", p: [
        "To the maximum extent permitted by law, EYE shall not be liable for indirect, incidental, or consequential damages, or for lost profits or data. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.",
      ]},
      { h: "11. Termination", p: [
        "You may stop using the service and delete your account at any time. We may suspend or terminate access if you breach these Terms or use the service unlawfully.",
      ]},
      { h: "12. Governing Law", p: [
        "These Terms are governed by the laws of the Arab Republic of Egypt, without regard to conflict-of-law rules.",
      ]},
      { h: "13. Changes to These Terms", p: [
        "We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance of the updated Terms.",
      ]},
      { h: "14. Contact Us", p: [
        "Questions about these Terms? Email support@eye-analsyis.live.",
      ]},
    ],
  },
  ar: {
    title: "شروط الاستخدام",
    updated: "آخر تحديث: 29 يونيو 2026",
    intro:
      "تحكم شروط الاستخدام هذه وصولك إلى EYE Analytics (“EYE”، “نحن”) واستخدامك للخدمة على eye-analsyis.live. بإنشائك حسابًا أو استخدامك للخدمة، فإنك توافق على هذه الشروط.",
    sections: [
      { h: "1. قبول الشروط", p: [
        "بوصولك إلى EYE أو استخدامك لها، فإنك توافق على الالتزام بهذه الشروط وسياسة الخصوصية لدينا. إذا لم توافق، فلا تستخدم الخدمة.",
      ]},
      { h: "2. وصف الخدمة", p: [
        "تقدّم EYE تحليلات لزوار المواقع — تشمل الزوار المباشرين والخرائط الحرارية وقمع التحويل ورؤى الجلسات وملخصات الذكاء الاصطناعي — عبر أداة تتبع ولوحة تحكم على الويب.",
      ]},
      { h: "3. الأهلية والحسابات", p: [
        "يجب أن يكون عمرك 18 عامًا على الأقل وقادرًا على إبرام عقد ملزم. أنت مسؤول عن الحفاظ على سرية بيانات دخولك وعن كل نشاط يتم عبر حسابك.",
        "توافق على تقديم معلومات دقيقة والحفاظ على تحديثها.",
      ]},
      { h: "4. التجربة المجانية والاشتراكات والمدفوعات", p: [
        "تتضمن الحسابات الجديدة تجربة مجانية لمدة 30 يومًا. وبعد التجربة، يتطلب استمرار استخدام الميزات المدفوعة اشتراكًا فعّالًا.",
        "تُحصَّل الباقات المدفوعة عبر مزوّد الدفع (Paymob). قد تُعرض الأسعار بالدولار وتُحصَّل بالعملة المحلية (مثل الجنيه المصري) كما يُوضَّح عند الدفع. وتتجدد الاشتراكات للمدة المختارة ما لم يتم الإلغاء.",
        "يمكنك الإلغاء في أي وقت؛ ويوقف الإلغاء أي رسوم مستقبلية. وباستثناء ما يقتضيه القانون، تُعدّ المدفوعات التي تمت غير قابلة للاسترداد.",
      ]},
      { h: "5. الاستخدام المقبول", p: [
        "توافق على عدم إساءة استخدام الخدمة: لا نشاط غير قانوني، ولا محاولات لاختراق الأمن أو تعطيل الخدمة، ولا هندسة عكسية، ولا استخدام ينتهك حقوق الآخرين.",
        "لا يجوز استخدام EYE لجمع بيانات بما يخالف القانون المعمول به أو حقوق أي طرف ثالث.",
      ]},
      { h: "6. بياناتك ومسؤولياتك", p: [
        "تحتفظ بملكية البيانات التي تجمعها عبر EYE. وتمنحنا الحقوق المحدودة اللازمة لمعالجتها فقط بغرض تقديم الخدمة.",
        "أنت مسؤول عن تثبيت أداة التتبع على المواقع التي تملكها أو تتحكم بها فقط، وعن عرض أي إشعارات، والحصول على أي موافقات يقتضيها القانون المطبّق على زوارك.",
      ]},
      { h: "7. الملكية الفكرية", p: [
        "تعود ملكية EYE وكل البرمجيات والعلامات التجارية والمحتوى المرتبط بها لنا أو لمرخّصينا. وتمنحك هذه الشروط حقًا محدودًا وغير حصري وغير قابل للنقل لاستخدام الخدمة — ولا تُمنح أي حقوق أخرى.",
      ]},
      { h: "8. توفّر الخدمة والتغييرات", p: [
        "نعمل على إبقاء الخدمة متاحة وموثوقة، لكننا لا نضمن تشغيلًا دون انقطاع. وقد نعدّل ميزات أو نوقفها مؤقتًا أو نلغيها مع إشعار معقول حيثما أمكن.",
      ]},
      { h: "9. إخلاء المسؤولية", p: [
        "تُقدَّم الخدمة “كما هي” و“حسب توفّرها” دون أي ضمانات، صريحة أو ضمنية، بما في ذلك الملاءمة لغرض معيّن. ولا نضمن خلو الخدمة من الأخطاء.",
      ]},
      { h: "10. حدود المسؤولية", p: [
        "إلى أقصى حد يسمح به القانون، لن تكون EYE مسؤولة عن أي أضرار غير مباشرة أو عرضية أو تبعية، أو عن خسارة الأرباح أو البيانات. ولن تتجاوز مسؤوليتنا الإجمالية المبلغ الذي دفعته لنا خلال الـ12 شهرًا السابقة للمطالبة.",
      ]},
      { h: "11. الإنهاء", p: [
        "يمكنك التوقف عن استخدام الخدمة وحذف حسابك في أي وقت. ويجوز لنا تعليق الوصول أو إنهاؤه إذا خالفت هذه الشروط أو استخدمت الخدمة بشكل غير قانوني.",
      ]},
      { h: "12. القانون الحاكم", p: [
        "تخضع هذه الشروط لقوانين جمهورية مصر العربية، دون اعتبار لقواعد تنازع القوانين.",
      ]},
      { h: "13. تغييرات على هذه الشروط", p: [
        "قد نحدّث هذه الشروط من وقت لآخر. ويُعدّ استمرار استخدامك بعد سريان التغييرات قبولًا للشروط المحدّثة.",
      ]},
      { h: "14. تواصل معنا", p: [
        "أسئلة حول هذه الشروط؟ راسلنا على support@eye-analsyis.live.",
      ]},
    ],
  },
};

export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const isAr = params.locale === "ar";
  const title = isAr ? "شروط الاستخدام — EYE" : "Terms of Use — EYE";
  const description = isAr
    ? "شروط استخدام EYE Analytics: الحساب، الاشتراكات والمدفوعات، الاستخدام المقبول، والمسؤوليات."
    : "EYE Analytics terms of use: accounts, subscriptions and payments, acceptable use, and responsibilities.";
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/${params.locale}/terms`, languages: { en: "/en/terms", ar: "/ar/terms" } },
  };
}

export default function TermsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const c = CONTENT[locale === "ar" ? "ar" : "en"];

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen pt-28 sm:pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 mb-6">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
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
