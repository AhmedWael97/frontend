/**
 * "EYE vs X" / "X alternative" comparison pages — bilingual data, one entry
 * per competitor. Pure data so /alternatives/[slug] can render + build SEO
 * metadata + JSON-LD from it. Every claim here must be something we can
 * actually stand behind (no fabricated stats — see the landing page's
 * "50,000+ websites" removal earlier for why that rule exists).
 */

export type Localized = { en: string; ar: string };

export type ComparisonRow = {
  feature: Localized;
  eye: Localized;
  them: Localized;
  eyeWins: boolean;
};

export type Alternative = {
  slug: string;
  competitorName: string;
  title: Localized;
  metaDescription: Localized;
  intro: Localized;
  rows: ComparisonRow[];
  verdict: Localized;
};

export const ALTERNATIVES_UI = {
  heroBadge: { en: "Comparisons", ar: "مقارنات" },
  heroTitle: { en: "EYE vs. the alternatives", ar: "EYE مقابل البدائل" },
  heroSubtitle: {
    en: "Honest, feature-by-feature comparisons — so you can pick based on what you actually need.",
    ar: "مقارنات صادقة ميزة بميزة — لتختار بناءً على ما تحتاجه فعلاً.",
  },
  featureCol: { en: "Feature", ar: "الميزة" },
  verdictLabel: { en: "Bottom line", ar: "الخلاصة" },
  ctaButton: { en: "Try EYE free for 30 days", ar: "جرّب EYE مجاناً لمدة 30 يوماً" },
};

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "hotjar-alternative",
    competitorName: "Hotjar",
    title: {
      en: "EYE vs. Hotjar — a privacy-first Hotjar alternative",
      ar: "EYE مقابل Hotjar — بديل يحترم الخصوصية",
    },
    metaDescription: {
      en: "Comparing EYE and Hotjar on heatmaps, session replay, pricing, and cookie use — pick the tool that fits how you actually work.",
      ar: "مقارنة بين EYE وHotjar في خرائط الحرارة وإعادة الجلسات والتسعير واستخدام الكوكيز.",
    },
    intro: {
      en: "Hotjar popularized heatmaps and session replay for websites. EYE covers the same ground — plus funnels, revenue attribution, and AI-written reports — built cookieless from day one.",
      ar: "جعلت Hotjar خرائط الحرارة وإعادة الجلسات شائعة لمواقع الويب. يغطي EYE نفس المجال — إضافة إلى القمع وإسناد الإيرادات وتقارير مكتوبة بالذكاء الاصطناعي — وهو خالٍ من الكوكيز منذ البداية.",
    },
    rows: [
      { feature: { en: "Click heatmaps", ar: "خرائط حرارة النقر" }, eye: { en: "Yes, full-page", ar: "نعم، للصفحة كاملة" }, them: { en: "Yes", ar: "نعم" }, eyeWins: false },
      { feature: { en: "Session replay", ar: "إعادة الجلسات" }, eye: { en: "Yes, rrweb-based", ar: "نعم، عبر rrweb" }, them: { en: "Yes", ar: "نعم" }, eyeWins: false },
      { feature: { en: "Cookies required", ar: "تتطلب كوكيز" }, eye: { en: "No — cookieless tracking", ar: "لا — تتبع بدون كوكيز" }, them: { en: "Yes", ar: "نعم" }, eyeWins: true },
      { feature: { en: "Revenue / ROAS attribution", ar: "إسناد الإيرادات / ROAS" }, eye: { en: "Built in (campaigns + ad spend)", ar: "مدمج (الحملات والإنفاق الإعلاني)" }, them: { en: "Not built in", ar: "غير مدمج" }, eyeWins: true },
      { feature: { en: "AI-written insight reports", ar: "تقارير رؤى بالذكاء الاصطناعي" }, eye: { en: "Yes", ar: "نعم" }, them: { en: "Limited", ar: "محدود" }, eyeWins: true },
      { feature: { en: "A/B testing (visual, no code)", ar: "اختبار A/B (بصري، بدون كود)" }, eye: { en: "Yes", ar: "نعم" }, them: { en: "Separate add-on", ar: "إضافة منفصلة" }, eyeWins: true },
      { feature: { en: "Free trial", ar: "تجربة مجانية" }, eye: { en: "30 days, full features", ar: "30 يوماً بكل الميزات" }, them: { en: "Limited free plan", ar: "خطة مجانية محدودة" }, eyeWins: false },
    ],
    verdict: {
      en: "If cookieless tracking and revenue attribution matter to you as much as heatmaps, EYE covers more ground in one subscription.",
      ar: "إذا كان التتبع بدون كوكيز وإسناد الإيرادات يهمانك بقدر خرائط الحرارة، يغطي EYE مجالاً أوسع باشتراك واحد.",
    },
  },
  {
    slug: "google-analytics-alternative",
    competitorName: "Google Analytics",
    title: {
      en: "EYE vs. Google Analytics — a privacy-first GA4 alternative",
      ar: "EYE مقابل Google Analytics — بديل خاص وبسيط",
    },
    metaDescription: {
      en: "GA4 is free but complex and cookie-based. EYE is a simpler, cookieless alternative with heatmaps, replay, and plain-English AI reports built in.",
      ar: "GA4 مجاني لكنه معقد ويعتمد على الكوكيز. EYE بديل أبسط وبدون كوكيز مع خرائط حرارة وإعادة جلسات وتقارير ذكاء اصطناعي بلغة بسيطة.",
    },
    intro: {
      en: "Google Analytics is free and powerful, but built for analysts — dozens of reports, a steep learning curve, and cookie consent banners. EYE is built for founders and marketers who want answers, not a BI tool to learn.",
      ar: "Google Analytics مجاني وقوي، لكنه مصمم للمحللين — عشرات التقارير ومنحنى تعلم حاد وبانرات موافقة كوكيز. EYE مصمم لأصحاب المشاريع والمسوقين الذين يريدون إجابات، لا أداة تحليل يجب تعلمها.",
    },
    rows: [
      { feature: { en: "Price", ar: "السعر" }, eye: { en: "Paid, 30-day free trial", ar: "مدفوع، تجربة مجانية 30 يوماً" }, them: { en: "Free", ar: "مجاني" }, eyeWins: false },
      { feature: { en: "Cookie consent banner needed", ar: "بانر موافقة كوكيز مطلوب" }, eye: { en: "No", ar: "لا" }, them: { en: "Usually yes", ar: "عادة نعم" }, eyeWins: true },
      { feature: { en: "Heatmaps / session replay", ar: "خرائط حرارة / إعادة جلسات" }, eye: { en: "Built in", ar: "مدمج" }, them: { en: "Not available", ar: "غير متوفر" }, eyeWins: true },
      { feature: { en: "Setup complexity", ar: "تعقيد الإعداد" }, eye: { en: "One script tag", ar: "سطر كود واحد" }, them: { en: "Events, tags, GTM config", ar: "أحداث ووسوم وإعداد GTM" }, eyeWins: true },
      { feature: { en: "AI-written plain-English reports", ar: "تقارير ذكاء اصطناعي بلغة بسيطة" }, eye: { en: "Yes", ar: "نعم" }, them: { en: "No", ar: "لا" }, eyeWins: true },
      { feature: { en: "Data ownership / retention control", ar: "ملكية البيانات / التحكم بالاحتفاظ" }, eye: { en: "Your own dashboard, your rules", ar: "لوحتك الخاصة، بقواعدك" }, them: { en: "Google's retention rules", ar: "قواعد احتفاظ جوجل" }, eyeWins: true },
    ],
    verdict: {
      en: "GA4 wins on price. EYE wins on speed-to-insight — if you want to see what's happening on your site today, not learn a reporting tool.",
      ar: "يفوز GA4 بالسعر. يفوز EYE بسرعة الوصول للرؤية — إذا أردت معرفة ما يحدث في موقعك اليوم دون تعلم أداة تقارير.",
    },
  },
  {
    slug: "mixpanel-alternative",
    competitorName: "Mixpanel",
    title: {
      en: "EYE vs. Mixpanel — visitor analytics without the event schema work",
      ar: "EYE مقابل Mixpanel — تحليلات زوار بدون عمل مخطط الأحداث",
    },
    metaDescription: {
      en: "Mixpanel is built for product teams who define custom events. EYE tracks visitor behavior automatically — heatmaps, replay, funnels — with custom events as an option, not a requirement.",
      ar: "Mixpanel مصمم لفرق المنتج التي تعرّف أحداثاً مخصصة. يتتبع EYE سلوك الزوار تلقائياً مع إمكانية إضافة أحداث مخصصة كخيار وليس شرطاً.",
    },
    intro: {
      en: "Mixpanel is excellent once you've defined the events that matter to your product — but that's real upfront work. EYE tracks clicks, scrolls, rage clicks, dead clicks, and funnels automatically, so you get signal from day one.",
      ar: "Mixpanel ممتاز بمجرد أن تعرّف الأحداث المهمة لمنتجك — لكن هذا عمل حقيقي مسبق. يتتبع EYE النقرات والتمرير ونقرات الغضب والنقرات الميتة والقمع تلقائياً، فتحصل على إشارة من اليوم الأول.",
    },
    rows: [
      { feature: { en: "Setup", ar: "الإعداد" }, eye: { en: "Automatic behavior tracking", ar: "تتبع سلوك تلقائي" }, them: { en: "Requires defining events", ar: "يتطلب تعريف الأحداث" }, eyeWins: true },
      { feature: { en: "Heatmaps / session replay", ar: "خرائط حرارة / إعادة جلسات" }, eye: { en: "Built in", ar: "مدمج" }, them: { en: "Not available", ar: "غير متوفر" }, eyeWins: true },
      { feature: { en: "Custom event tracking", ar: "تتبع أحداث مخصصة" }, eye: { en: "Yes, optional", ar: "نعم، اختياري" }, them: { en: "Yes, core to the product", ar: "نعم، جوهر المنتج" }, eyeWins: false },
      { feature: { en: "Cohort / retention analysis", ar: "تحليل الأفواج / الاحتفاظ" }, eye: { en: "Yes", ar: "نعم" }, them: { en: "Yes", ar: "نعم" }, eyeWins: false },
      { feature: { en: "Revenue / ad-spend ROAS", ar: "الإيرادات / ROAS الإنفاق الإعلاني" }, eye: { en: "Built in", ar: "مدمج" }, them: { en: "Requires integration", ar: "يتطلب تكاملاً" }, eyeWins: true },
      { feature: { en: "Best for", ar: "الأنسب لـ" }, eye: { en: "Marketers, founders, agencies", ar: "المسوقون وأصحاب المشاريع والوكالات" }, them: { en: "Product/data teams", ar: "فرق المنتج والبيانات" }, eyeWins: false },
    ],
    verdict: {
      en: "If you have a product team ready to define an event taxonomy, Mixpanel is powerful. If you want visitor insight without that upfront work, EYE gets there faster.",
      ar: "إذا كان لديك فريق منتج جاهز لتعريف مخطط أحداث، فـ Mixpanel قوي. إذا أردت رؤية الزوار دون ذلك العمل المسبق، يصل EYE أسرع.",
    },
  },
];
