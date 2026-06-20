/**
 * Help Center content — bilingual (English + Arabic).
 *
 * Pure data so the /help page can render, search, and link to any article in
 * either language. Each article is written for non-technical users first:
 * a plain summary, where to find it, numbered steps that name real buttons,
 * and a tip. Add new articles here; the page picks them up automatically.
 */

export type Localized = { en: string; ar: string };
export type LocalizedList = { en: string[]; ar: string[] };

export type HelpArticle = {
  id: string;
  title: Localized;
  summary: Localized;
  where?: Localized;
  steps: LocalizedList;
  tips?: LocalizedList;
};

export type HelpCategory = {
  id: string;
  /** lucide icon name resolved in the page */
  icon: string;
  title: Localized;
  description: Localized;
  articles: HelpArticle[];
};

export const HELP_UI = {
  heroBadge: { en: "Help Center", ar: "مركز المساعدة" },
  heroTitle: { en: "How to use EYE", ar: "كيفية استخدام EYE" },
  heroSubtitle: {
    en: "Simple, step-by-step guides for every feature — written for everyone, not just developers.",
    ar: "أدلة بسيطة خطوة بخطوة لكل ميزة — مكتوبة للجميع وليس للمطورين فقط.",
  },
  searchPlaceholder: { en: "Search the guides…", ar: "ابحث في الأدلة…" },
  whereLabel: { en: "Where to find it", ar: "أين تجدها" },
  stepsLabel: { en: "Steps", ar: "الخطوات" },
  tipLabel: { en: "Tip", ar: "نصيحة" },
  noResults: { en: "No guides match your search.", ar: "لا توجد أدلة مطابقة لبحثك." },
  onThisPage: { en: "Topics", ar: "المواضيع" },
  ctaTitle: { en: "Ready to start?", ar: "جاهز للبدء؟" },
  ctaText: {
    en: "Create a free account and connect your first website in minutes.",
    ar: "أنشئ حساباً مجانياً واربط موقعك الأول في دقائق.",
  },
  ctaButton: { en: "Create free account", ar: "إنشاء حساب مجاني" },
};

export const HELP: HelpCategory[] = [
  {
    id: "getting-started",
    icon: "Rocket",
    title: { en: "Getting started", ar: "البداية" },
    description: { en: "Set up your account and start collecting data.", ar: "جهّز حسابك وابدأ بجمع البيانات." },
    articles: [
      {
        id: "create-account",
        title: { en: "Create your account", ar: "إنشاء حسابك" },
        summary: { en: "Sign up and log in to your EYE dashboard.", ar: "سجّل وادخل إلى لوحة تحكم EYE." },
        steps: {
          en: [
            "Click “Create free account” on the homepage.",
            "Enter your name, email and a password, then submit.",
            "Open the verification email and click the confirm link.",
            "Log in — you’ll land on the dashboard.",
          ],
          ar: [
            "اضغط «إنشاء حساب مجاني» في الصفحة الرئيسية.",
            "أدخل اسمك وبريدك وكلمة المرور ثم أرسل.",
            "افتح بريد التفعيل واضغط على رابط التأكيد.",
            "سجّل الدخول — ستصل إلى لوحة التحكم.",
          ],
        },
        tips: {
          en: ["Turn on two-factor authentication later from Settings → Security for extra protection."],
          ar: ["فعّل التحقق بخطوتين لاحقاً من الإعدادات ← الأمان لحماية إضافية."],
        },
      },
      {
        id: "add-domain",
        title: { en: "Add your website (domain)", ar: "إضافة موقعك (النطاق)" },
        summary: { en: "Register the website you want to track.", ar: "سجّل الموقع الذي تريد تتبّعه." },
        where: { en: "Settings → Domains", ar: "الإعدادات ← النطاقات" },
        steps: {
          en: [
            "Go to Settings → Domains.",
            "Click “Add domain” and type your website address (e.g. example.com).",
            "Save — EYE creates a unique tracking token for that site.",
            "Pick this domain from the selector at the top of the dashboard to view its data.",
          ],
          ar: [
            "اذهب إلى الإعدادات ← النطاقات.",
            "اضغط «إضافة نطاق» واكتب عنوان موقعك (مثل example.com).",
            "احفظ — سيُنشئ EYE رمز تتبّع فريداً لهذا الموقع.",
            "اختر هذا النطاق من القائمة أعلى لوحة التحكم لعرض بياناته.",
          ],
        },
      },
      {
        id: "install-tracker",
        title: { en: "Install the tracking script", ar: "تثبيت سكربت التتبّع" },
        summary: { en: "Add one small snippet so EYE can see visits.", ar: "أضف مقتطفاً صغيراً واحداً ليتمكن EYE من رؤية الزيارات." },
        where: { en: "Settings → Domains → Install Script", ar: "الإعدادات ← النطاقات ← تثبيت السكربت" },
        steps: {
          en: [
            "Open Settings → Domains and click “Install Script” for your site.",
            "Copy the <script> snippet (it already includes your token).",
            "Paste it just before the closing </head> tag on every page of your site.",
            "Publish your site, then open the dashboard — first events arrive within a minute.",
          ],
          ar: [
            "افتح الإعدادات ← النطاقات واضغط «تثبيت السكربت» لموقعك.",
            "انسخ مقتطف <script> (يحتوي رمزك بالفعل).",
            "الصقه قبل وسم </head> مباشرةً في كل صفحات موقعك.",
            "انشر موقعك ثم افتح لوحة التحكم — تصل أول الأحداث خلال دقيقة.",
          ],
        },
        tips: {
          en: ["On WordPress/WooCommerce or Shopify, use our plugin/snippet instead — see the Integrations guides."],
          ar: ["على ووردبريس/ووكومرس أو شوبيفاي، استخدم الإضافة/المقتطف الخاص بنا بدلاً من ذلك — راجع أدلة التكاملات."],
        },
      },
      {
        id: "verify-data",
        title: { en: "Check that data is arriving", ar: "تأكد من وصول البيانات" },
        summary: { en: "Confirm the tracker is working.", ar: "تأكد أن التتبّع يعمل." },
        steps: {
          en: [
            "Select your domain at the top of the dashboard.",
            "Open Analytics → Live Visitors and load your website in another tab.",
            "You should appear as an active visitor within seconds.",
            "If nothing shows, re-check the script is on the page and the domain matches.",
          ],
          ar: [
            "اختر نطاقك أعلى لوحة التحكم.",
            "افتح التحليلات ← الزوار المباشرون وافتح موقعك في تبويب آخر.",
            "يجب أن تظهر كزائر نشط خلال ثوانٍ.",
            "إن لم يظهر شيء، تأكد أن السكربت موجود في الصفحة وأن النطاق مطابق.",
          ],
        },
      },
    ],
  },

  {
    id: "analytics",
    icon: "BarChart3",
    title: { en: "Understanding your analytics", ar: "فهم تحليلاتك" },
    description: { en: "Read your traffic and what the numbers mean.", ar: "اقرأ زياراتك ومعنى الأرقام." },
    articles: [
      {
        id: "dashboard",
        title: { en: "The dashboard & date range", ar: "لوحة التحكم والفترة الزمنية" },
        summary: { en: "Your daily health check: visitors, sessions, bounce, duration.", ar: "فحصك اليومي: الزوار والجلسات والارتداد والمدة." },
        steps: {
          en: [
            "Pick the date range (7 / 30 / 90 days) before reading any chart.",
            "Read the KPI cards at the top for the headline numbers.",
            "Use the trend chart to spot rises or drops over time.",
            "Click into Pages or Funnels when a number looks off, to find the cause.",
          ],
          ar: [
            "اختر الفترة الزمنية (7 / 30 / 90 يوماً) قبل قراءة أي مخطط.",
            "اقرأ بطاقات المؤشرات في الأعلى للأرقام الرئيسية.",
            "استخدم مخطط الاتجاه لرصد الارتفاع أو الانخفاض عبر الوقت.",
            "ادخل إلى الصفحات أو القمع عند ملاحظة رقم غريب لمعرفة السبب.",
          ],
        },
        tips: {
          en: ["Always compare two windows (e.g. 7d vs 30d) before making a decision."],
          ar: ["قارن دائماً بين فترتين (مثلاً 7 أيام مقابل 30 يوماً) قبل اتخاذ القرار."],
        },
      },
      {
        id: "metrics-meaning",
        title: { en: "What the metrics mean", ar: "ماذا تعني المقاييس" },
        summary: { en: "Plain definitions of the common numbers.", ar: "تعريفات بسيطة للأرقام الشائعة." },
        steps: {
          en: [
            "Visitors = unique people in the period. Sessions = separate visits.",
            "Pageviews = total pages opened. Read it with Visitors for depth.",
            "Bounce rate = sessions that viewed only one page (not always bad).",
            "Avg. session duration = time spent per visit — judge it against conversions.",
          ],
          ar: [
            "الزوار = أشخاص فريدون في الفترة. الجلسات = زيارات منفصلة.",
            "مشاهدات الصفحات = إجمالي الصفحات المفتوحة. اقرأها مع الزوار لفهم العمق.",
            "معدل الارتداد = جلسات شاهدت صفحة واحدة فقط (ليس سيئاً دائماً).",
            "متوسط مدة الجلسة = الوقت لكل زيارة — قيّمه مقابل التحويلات.",
          ],
        },
      },
      {
        id: "visitors-pages-referrers",
        title: { en: "Visitors, Pages & Referrers", ar: "الزوار والصفحات والمصادر" },
        summary: { en: "See who visits, what they read, and where they came from.", ar: "اعرف من يزور وماذا يقرأ ومن أين أتى." },
        where: { en: "Analytics → Visitors / Deep Analytics", ar: "التحليلات ← الزوار / التحليلات المعمّقة" },
        steps: {
          en: [
            "Open Analytics → Visitors to browse individual journeys, country and device.",
            "Open Deep Analytics → Pages to find your most-viewed pages.",
            "Open Referrers to see traffic sources (search, social, direct, campaigns).",
            "Improve high-traffic pages first — small wins there affect many sessions.",
          ],
          ar: [
            "افتح التحليلات ← الزوار لتصفّح رحلات الزوار والدولة والجهاز.",
            "افتح التحليلات المعمّقة ← الصفحات لإيجاد أكثر صفحاتك مشاهدة.",
            "افتح المصادر لمعرفة مصادر الزيارات (بحث، سوشيال، مباشر، حملات).",
            "حسّن الصفحات عالية الزيارات أولاً — التحسين البسيط فيها يؤثر على جلسات كثيرة.",
          ],
        },
      },
    ],
  },

  {
    id: "campaigns-revenue",
    icon: "DollarSign",
    title: { en: "Campaigns & revenue", ar: "الحملات والإيرادات" },
    description: { en: "See which campaigns make money, not just clicks.", ar: "اعرف أي حملة تجلب المال وليس النقرات فقط." },
    articles: [
      {
        id: "utm-builder",
        title: { en: "Tag campaign links (UTM builder)", ar: "وسم روابط الحملات (مُنشئ UTM)" },
        summary: { en: "Tag your ad links so campaigns separate correctly.", ar: "وسم روابط إعلاناتك لتُفصل الحملات بشكل صحيح." },
        where: { en: "Tools → UTM Builder", ar: "الأدوات ← مُنشئ UTM" },
        steps: {
          en: [
            "Open Tools → UTM Builder.",
            "Enter your page URL, the source (e.g. facebook), medium (e.g. cpc) and a unique campaign name.",
            "Copy the generated link and use it as your ad’s destination URL.",
            "Give each campaign a different campaign name so they don’t merge.",
          ],
          ar: [
            "افتح الأدوات ← مُنشئ UTM.",
            "أدخل رابط صفحتك، المصدر (مثل facebook)، الوسيط (مثل cpc)، واسم حملة فريد.",
            "انسخ الرابط الناتج واستخدمه كرابط وجهة إعلانك.",
            "أعطِ كل حملة اسماً مختلفاً حتى لا تندمج معاً.",
          ],
        },
        tips: {
          en: ["Untagged campaigns on the same platform cannot be told apart — always tag them."],
          ar: ["لا يمكن التمييز بين حملات غير موسومة على نفس المنصة — وسمها دائماً."],
        },
      },
      {
        id: "campaigns-page",
        title: { en: "Read the Campaigns dashboard", ar: "قراءة لوحة الحملات" },
        summary: { en: "Sessions, revenue, orders, spend, ROAS per campaign.", ar: "الجلسات والإيرادات والطلبات والإنفاق وعائد الإنفاق لكل حملة." },
        where: { en: "Analytics → Campaigns", ar: "التحليلات ← الحملات" },
        steps: {
          en: [
            "Open Analytics → Campaigns and choose a date range.",
            "Use the medium chips (organic, social, email, campaign…) to filter.",
            "Sort the table by Revenue or ROAS to find your best/worst campaigns.",
            "Switch the Attribution selector to compare last-touch vs first-touch and more.",
          ],
          ar: [
            "افتح التحليلات ← الحملات واختر فترة زمنية.",
            "استخدم شارات الوسيط (organic، social، email، campaign…) للتصفية.",
            "رتّب الجدول حسب الإيراد أو ROAS لإيجاد أفضل/أسوأ الحملات.",
            "بدّل محدد الإسناد لمقارنة آخر لمسة مقابل أول لمسة وغيرها.",
          ],
        },
      },
      {
        id: "track-sales",
        title: { en: "Track sales (revenue)", ar: "تتبّع المبيعات (الإيرادات)" },
        summary: { en: "Send each purchase to EYE so it’s credited to a campaign.", ar: "أرسل كل عملية شراء إلى EYE لتُنسب إلى حملة." },
        steps: {
          en: [
            "On your order-confirmation page, call EYE.purchase(value, currency, orderId).",
            "Example: EYE.purchase(199.0, 'USD', 'ORDER-1234').",
            "Or use the WooCommerce plugin / Shopify snippet to do it automatically.",
            "Revenue then appears per campaign in the Campaigns dashboard.",
          ],
          ar: [
            "في صفحة تأكيد الطلب، استدعِ EYE.purchase(value, currency, orderId).",
            "مثال: EYE.purchase(199.0, 'USD', 'ORDER-1234').",
            "أو استخدم إضافة ووكومرس / مقتطف شوبيفاي لفعل ذلك تلقائياً.",
            "ستظهر الإيرادات بعدها لكل حملة في لوحة الحملات.",
          ],
        },
        tips: {
          en: ["Always pass a unique order id so refreshes don’t double-count a sale."],
          ar: ["مرّر دائماً رقم طلب فريداً حتى لا يُحتسب البيع مرتين عند إعادة التحميل."],
        },
      },
      {
        id: "ad-spend-roas",
        title: { en: "Add ad spend → see ROAS & CPA", ar: "أضف إنفاق الإعلانات ← شاهد ROAS و CPA" },
        summary: { en: "Enter spend so EYE computes return on ad spend.", ar: "أدخل الإنفاق ليحسب EYE عائد الإنفاق الإعلاني." },
        where: { en: "Analytics → Campaigns → “Ad Spend”", ar: "التحليلات ← الحملات ← «الإنفاق الإعلاني»" },
        steps: {
          en: [
            "On the Campaigns page click “Ad Spend”.",
            "Add a row (date, source, campaign, spend, currency) — or paste a CSV to import in bulk.",
            "Close the dialog; the Spend, ROAS and CPA columns now fill in.",
            "Use the Budget recommendations card to pause losers and scale winners.",
          ],
          ar: [
            "في صفحة الحملات اضغط «الإنفاق الإعلاني».",
            "أضف صفاً (تاريخ، مصدر، حملة، إنفاق، عملة) — أو الصق ملف CSV للاستيراد دفعة واحدة.",
            "أغلق النافذة؛ ستمتلئ أعمدة الإنفاق و ROAS و CPA.",
            "استخدم بطاقة توصيات الميزانية لإيقاف الخاسر وزيادة الرابح.",
          ],
        },
      },
      {
        id: "channel-mix",
        title: { en: "Channel Mix (all channels at once)", ar: "مزيج القنوات (كل القنوات معاً)" },
        summary: { en: "Compare every channel's spend, revenue and ROAS, and where to move budget.", ar: "قارن إنفاق وإيراد وعائد كل قناة، وأين تنقل الميزانية." },
        where: { en: "Analytics → Channel Mix", ar: "التحليلات ← مزيج القنوات" },
        steps: {
          en: [
            "Open Analytics → Channel Mix.",
            "See each channel (paid, organic, social, email, referral…) with sessions, revenue, spend and ROAS.",
            "Read the “Budget reallocation” card: cut channels below 1× ROAS, scale ones above 3×.",
            "Change the date range to compare periods before deciding.",
          ],
          ar: [
            "افتح التحليلات ← مزيج القنوات.",
            "شاهد كل قناة (مدفوعة، عضوية، سوشيال، بريد، إحالة…) مع الجلسات والإيراد والإنفاق و ROAS.",
            "اقرأ بطاقة «إعادة توزيع الميزانية»: قلّل القنوات تحت 1× وزِد التي فوق 3×.",
            "غيّر الفترة الزمنية لمقارنة الفترات قبل القرار.",
          ],
        },
      },
      {
        id: "ltv",
        title: { en: "Lifetime value by source", ar: "القيمة الدائمة حسب المصدر" },
        summary: { en: "See which channels bring the most valuable customers over time — not just first purchase.", ar: "اعرف أي القنوات تجلب أعلى العملاء قيمةً عبر الوقت — وليس أول عملية شراء فقط." },
        where: { en: "Analytics → Lifetime Value", ar: "التحليلات ← القيمة الدائمة" },
        steps: {
          en: [
            "Open Analytics → Lifetime Value.",
            "Each row is a first-touch acquisition source with its average revenue per visitor (LTV).",
            "Pick the time window (90 / 180 / 365 days).",
            "Invest more in the sources with the highest LTV, not just the cheapest clicks.",
          ],
          ar: [
            "افتح التحليلات ← القيمة الدائمة.",
            "كل صف هو مصدر اكتساب (أول لمسة) مع متوسط الإيراد لكل زائر (LTV).",
            "اختر الفترة الزمنية (90 / 180 / 365 يوماً).",
            "استثمر أكثر في المصادر ذات أعلى LTV وليس الأرخص نقراً فقط.",
          ],
        },
        tips: {
          en: ["LTV needs tracked purchases — make sure EYE.purchase() (or a store plugin) is sending sales."],
          ar: ["تحتاج LTV إلى مشتريات متتبَّعة — تأكد أن EYE.purchase() (أو إضافة المتجر) ترسل المبيعات."],
        },
      },
    ],
  },

  {
    id: "behavior",
    icon: "MousePointerClick",
    title: { en: "Behavior & UX", ar: "السلوك وتجربة المستخدم" },
    description: { en: "See how people actually use your site.", ar: "شاهد كيف يستخدم الناس موقعك فعلياً." },
    articles: [
      {
        id: "heatmaps",
        title: { en: "Heatmaps", ar: "الخرائط الحرارية" },
        summary: { en: "See where visitors click and scroll.", ar: "شاهد أين ينقر الزوار ويُمرّرون." },
        where: { en: "Intelligence → Heatmaps", ar: "الذكاء ← الخرائط الحرارية" },
        steps: {
          en: [
            "Open Intelligence → Heatmaps and enter a page URL.",
            "Wait for the page screenshot with the click overlay to load.",
            "Hot (red) areas get the most clicks; cold areas get few.",
            "Move important buttons into hot zones; fix clicks landing on non-clickable elements.",
          ],
          ar: [
            "افتح الذكاء ← الخرائط الحرارية وأدخل رابط صفحة.",
            "انتظر تحميل لقطة الصفحة مع طبقة النقرات.",
            "المناطق الساخنة (الحمراء) تحصل على أكثر النقرات؛ الباردة قليلة.",
            "انقل الأزرار المهمة إلى المناطق الساخنة؛ وعالج النقرات على عناصر غير قابلة للنقر.",
          ],
        },
      },
      {
        id: "session-replay",
        title: { en: "Session replay (only meaningful sessions)", ar: "إعادة تشغيل الجلسات (الجلسات المهمة فقط)" },
        summary: { en: "Watch real recordings — only ones worth your time, never broken.", ar: "شاهد تسجيلات حقيقية — فقط ما يستحق وقتك، وغير معطوبة أبداً." },
        where: { en: "Intelligence → Replay", ar: "الذكاء ← الإعادة" },
        steps: {
          en: [
            "Enable it by adding data-replay=\"true\" to your tracking script (or toggle it in the WooCommerce plugin).",
            "EYE only keeps a recording when something matters — a rage/dead click, JS error, form abandon, quick-back, purchase, or a genuinely engaged visit. Idle bounces are discarded.",
            "Open Intelligence → Replay; each recording shows a reason badge (e.g. “Rage click”, “Engaged”) so you know what to look for.",
            "Click Play; use speed, “skip inactivity”, and the timeline markers to jump to the friction moment. Broken/empty recordings are never shown.",
          ],
          ar: [
            "فعّلها بإضافة data-replay=\"true\" إلى سكربت التتبّع (أو فعّل الخيار في إضافة ووكومرس).",
            "يحتفظ EYE بالتسجيل فقط عند حدوث أمر مهم — نقرة غضب/ميتة، خطأ، هجر نموذج، رجوع سريع، عملية شراء، أو زيارة متفاعلة فعلاً. تُهمل الجلسات العابرة.",
            "افتح الذكاء ← الإعادة؛ يعرض كل تسجيل شارة السبب (مثل «نقرة غضب»، «متفاعل») لتعرف ما تبحث عنه.",
            "اضغط تشغيل؛ استخدم السرعة و«تخطّي الخمول» وعلامات الشريط الزمني للقفز إلى لحظة الاحتكاك. لا تُعرض التسجيلات المعطوبة أبداً.",
          ],
        },
        tips: {
          en: ["Add the CSS class eye-mask to sensitive fields and eye-block to whole regions to keep them private."],
          ar: ["أضف الكلاس eye-mask للحقول الحساسة و eye-block للمناطق كاملةً لإبقائها خاصة."],
        },
      },
      {
        id: "funnels",
        title: { en: "Funnels & drop-off replays", ar: "القمع وإعادات التسرّب" },
        summary: { en: "Find the step where users give up — then watch why.", ar: "اعثر على الخطوة التي يتوقف عندها المستخدمون — ثم شاهد السبب." },
        where: { en: "Analytics → Funnels", ar: "التحليلات ← القمع" },
        steps: {
          en: [
            "Open Analytics → Funnels and click “New Funnel”.",
            "Add ordered steps by URL (e.g. /cart, then /checkout, then /thank-you).",
            "Read the chart to see where most users drop off.",
            "Click the film icon next to a step to watch sessions that dropped after it.",
          ],
          ar: [
            "افتح التحليلات ← القمع واضغط «قمع جديد».",
            "أضف خطوات مرتبة حسب الرابط (مثل /cart ثم /checkout ثم /thank-you).",
            "اقرأ المخطط لمعرفة أين يتسرّب أغلب المستخدمين.",
            "اضغط أيقونة الفيلم بجانب خطوة لمشاهدة الجلسات التي تسرّبت بعدها.",
          ],
        },
        tips: {
          en: ["Fix one bottleneck step at a time, then re-measure after you deploy the change."],
          ar: ["عالج خطوة عنق زجاجة واحدة في كل مرة ثم أعد القياس بعد نشر التغيير."],
        },
      },
    ],
  },

  {
    id: "growth",
    icon: "TrendingUp",
    title: { en: "Growth: retention & A/B tests", ar: "النمو: الاحتفاظ واختبارات A/B" },
    description: { en: "Keep customers and prove what works.", ar: "حافظ على العملاء وأثبت ما ينجح." },
    articles: [
      {
        id: "retention",
        title: { en: "Retention (cohorts)", ar: "الاحتفاظ (المجموعات)" },
        summary: { en: "See how many visitors come back over time.", ar: "اعرف كم زائراً يعود عبر الوقت." },
        where: { en: "Analytics → Retention", ar: "التحليلات ← الاحتفاظ" },
        steps: {
          en: [
            "Open Analytics → Retention.",
            "Choose Weekly or Monthly cohorts.",
            "Read each row: of people first seen that period, how many returned later.",
            "Darker cells = better retention. Compare cohorts to see if changes helped.",
          ],
          ar: [
            "افتح التحليلات ← الاحتفاظ.",
            "اختر مجموعات أسبوعية أو شهرية.",
            "اقرأ كل صف: من الذين ظهروا أول مرة في تلك الفترة، كم عاد لاحقاً.",
            "الخلايا الأغمق = احتفاظ أفضل. قارن المجموعات لمعرفة إن نفعت تغييراتك.",
          ],
        },
      },
      {
        id: "ab-tests",
        title: { en: "A/B & split-URL experiments", ar: "تجارب A/B وتقسيم الروابط" },
        summary: { en: "Build no-code A/B and split-URL tests — no developer needed.", ar: "أنشئ اختبارات A/B وتقسيم الروابط بدون كود — دون الحاجة لمطوّر." },
        where: { en: "Sidebar → Experiments", ar: "الشريط الجانبي ← التجارب" },
        steps: {
          en: [
            "Click “New Experiment” and pick a type: A/B test (change the same page with CSS/JS) or Split URL (send visitors to different page URLs).",
            "Enter the page URL — this becomes your “control” (the original, shown as-is).",
            "Add one or more variations. For A/B, write CSS and/or JavaScript in the code editor (e.g. recolor a button). For Split URL, paste the alternate page URL.",
            "Set a traffic weight (%) per variation, or click “Even split”. Visitors are distributed automatically (e.g. 25/25/25/25).",
            "Choose a goal: a purchase, a custom event, or reaching a URL.",
            "Press “Start” to run it. Open the experiment to see, per variation, visitors seen / total, conversion rate, uplift and significance — the winner gets a trophy.",
          ],
          ar: [
            "اضغط «تجربة جديدة» واختر النوع: اختبار A/B (تغيير نفس الصفحة عبر CSS/JS) أو تقسيم الرابط (توجيه الزوّار لصفحات مختلفة).",
            "أدخل رابط الصفحة — يصبح هذا «الأساس» (الأصل، يُعرض كما هو).",
            "أضف نسخة أو أكثر. في A/B اكتب CSS و/أو JavaScript في محرّر الكود (مثل تغيير لون زر). في تقسيم الرابط الصق رابط الصفحة البديلة.",
            "حدّد نسبة المرور (%) لكل نسخة أو اضغط «تقسيم متساوٍ». يُوزَّع الزوّار تلقائياً (مثل 25/25/25/25).",
            "اختر هدفاً: عملية شراء، حدث مخصص، أو الوصول لرابط.",
            "اضغط «بدء» للتشغيل. افتح التجربة لرؤية لكل نسخة: الزوّار الذين شاهدوها / الإجمالي، معدل التحويل، التحسّن والدلالة — الفائز يحصل على كأس.",
          ],
        },
        tips: {
          en: [
            "The control needs no code — it’s your page exactly as it is today.",
            "Changes apply automatically on page load via the EYE tracker; no extra snippet to install.",
            "For a rigorous statistical engine, connect GrowthBook or Convert.com (see Integrations) — EYE overlays your revenue per variant on top.",
          ],
          ar: [
            "الأساس لا يحتاج كوداً — هو صفحتك كما هي اليوم.",
            "تُطبَّق التغييرات تلقائياً عند تحميل الصفحة عبر متتبّع EYE؛ دون مقتطف إضافي.",
            "لمحرك إحصائي دقيق، اربط GrowthBook أو Convert.com (راجع التكاملات) — يعرض EYE إيراداتك لكل نسخة فوقها.",
          ],
        },
      },
      {
        id: "seo-rank",
        title: { en: "SEO rank tracking", ar: "تتبّع ترتيب SEO" },
        summary: { en: "Track keyword positions over time and spot wins/drops.", ar: "تتبّع مواضع الكلمات عبر الوقت وارصد التحسّن/الانخفاض." },
        where: { en: "Reports & Tools → Rank Tracking", ar: "التقارير والأدوات ← تتبّع الترتيب" },
        steps: {
          en: [
            "Open Reports & Tools → Rank Tracking.",
            "Type a keyword and click “Track keyword”.",
            "Import positions from your rank tool with “Import CSV” (header: date,keyword,position,url).",
            "Each keyword shows its current position, change vs last entry, best rank, and a trend line.",
          ],
          ar: [
            "افتح التقارير والأدوات ← تتبّع الترتيب.",
            "اكتب كلمة مفتاحية واضغط «تتبّع الكلمة».",
            "استورد المواضع من أداة الترتيب عبر «استيراد CSV» (الترويسة: date,keyword,position,url).",
            "يعرض كل كلمة موضعها الحالي والتغيّر عن آخر إدخال وأفضل ترتيب وخط الاتجاه.",
          ],
        },
      },
    ],
  },

  {
    id: "monitoring",
    icon: "Bell",
    title: { en: "Alerts & monitoring", ar: "التنبيهات والمراقبة" },
    description: { en: "Get told when something needs attention.", ar: "كن على علم عندما يحتاج شيء انتباهك." },
    articles: [
      {
        id: "alerts",
        title: { en: "Set up alerts", ar: "إعداد التنبيهات" },
        summary: { en: "Be notified on drops, error spikes and anomalies.", ar: "كن على علم بالانخفاضات وارتفاع الأخطاء والشذوذ." },
        where: { en: "Settings → Alerts", ar: "الإعدادات ← التنبيهات" },
        steps: {
          en: [
            "Open Settings → Alerts and click “Add Rule”.",
            "Pick an alert type (traffic drop, traffic anomaly, error spike, conversion drop, quota).",
            "Set the threshold and a channel (email, in-app, Slack or Discord).",
            "For Slack/Discord, paste the webhook URL. Save — checks run every 15 minutes.",
          ],
          ar: [
            "افتح الإعدادات ← التنبيهات واضغط «إضافة قاعدة».",
            "اختر نوع التنبيه (انخفاض زيارات، شذوذ زيارات، ارتفاع أخطاء، انخفاض تحويل، الحصة).",
            "اضبط الحد وقناة (بريد، داخل التطبيق، سلاك أو ديسكورد).",
            "لسلاك/ديسكورد، الصق رابط الـ webhook. احفظ — تُجرى الفحوص كل 15 دقيقة.",
          ],
        },
        tips: {
          en: ["Managing many sites? Use “Apply defaults to all sites” to set sensible alerts everywhere at once."],
          ar: ["تدير مواقع كثيرة؟ استخدم «تطبيق الافتراضيات على كل المواقع» لضبط تنبيهات منطقية للجميع دفعة واحدة."],
        },
      },
    ],
  },

  {
    id: "portfolio",
    icon: "LayoutGrid",
    title: { en: "Managing many sites", ar: "إدارة عدة مواقع" },
    description: { en: "Run all your websites from one screen.", ar: "أدر كل مواقعك من شاشة واحدة." },
    articles: [
      {
        id: "portfolio-view",
        title: { en: "Portfolio & triage", ar: "المحفظة والأولويات" },
        summary: { en: "All sites’ KPIs and what needs attention first.", ar: "مؤشرات كل المواقع وما يحتاج انتباهك أولاً." },
        where: { en: "Analytics → Portfolio", ar: "التحليلات ← المحفظة" },
        steps: {
          en: [
            "Open Analytics → Portfolio (no need to pick a single domain).",
            "Read the totals, then the “Needs attention” feed ranked by money at stake.",
            "Click any issue or row to jump straight to that site’s relevant page.",
            "Sort the table by Revenue or ROAS to compare sites against each other.",
          ],
          ar: [
            "افتح التحليلات ← المحفظة (لا حاجة لاختيار نطاق واحد).",
            "اقرأ الإجماليات ثم قائمة «يحتاج انتباهك» المرتبة حسب المال المعرّض للخطر.",
            "اضغط أي مشكلة أو صف للانتقال مباشرةً إلى صفحة ذلك الموقع المعنية.",
            "رتّب الجدول حسب الإيراد أو ROAS لمقارنة المواقع ببعضها.",
          ],
        },
        tips: {
          en: ["The Benchmarks card flags any site far below your portfolio median on conversion, ROAS or bounce — so you spot the weak ones instantly."],
          ar: ["تُبرز بطاقة المقارنات أي موقع أقل بكثير من وسيط محفظتك في التحويل أو ROAS أو الارتداد — لرصد الضعيف فوراً."],
        },
      },
      {
        id: "branded-report",
        title: { en: "Branded portfolio report", ar: "تقرير المحفظة المُعلَّم" },
        summary: { en: "A clean PDF report to share with clients.", ar: "تقرير PDF أنيق لمشاركته مع العملاء." },
        where: { en: "Portfolio → Report", ar: "المحفظة ← التقرير" },
        steps: {
          en: [
            "On the Portfolio page click “Report”.",
            "Choose the period (7 / 30 / 90 days).",
            "Click “Print / Save as PDF”.",
            "In the print dialog choose “Save as PDF” to share or archive it.",
          ],
          ar: [
            "في صفحة المحفظة اضغط «التقرير».",
            "اختر الفترة (7 / 30 / 90 يوماً).",
            "اضغط «طباعة / حفظ كـ PDF».",
            "في نافذة الطباعة اختر «حفظ كـ PDF» لمشاركته أو أرشفته.",
          ],
        },
      },
    ],
  },

  {
    id: "integrations",
    icon: "Plug",
    title: { en: "Integrations", ar: "التكاملات" },
    description: { en: "Connect your store and other tools.", ar: "اربط متجرك والأدوات الأخرى." },
    articles: [
      {
        id: "woocommerce",
        title: { en: "WooCommerce (WordPress)", ar: "ووكومرس (ووردبريس)" },
        summary: { en: "Track sales from your WooCommerce store with no code.", ar: "تتبّع مبيعات متجر ووكومرس بدون كود." },
        steps: {
          en: [
            "Install the “EYE Analytics for WooCommerce” plugin and activate it.",
            "Go to Settings → EYE Analytics in WordPress.",
            "Enter your EYE API URL and the tracking token from your domain settings.",
            "Save. Tracking + purchase reporting now run automatically (toggle replay if you want recordings).",
          ],
          ar: [
            "ثبّت إضافة «EYE Analytics for WooCommerce» وفعّلها.",
            "اذهب إلى الإعدادات ← EYE Analytics في ووردبريس.",
            "أدخل رابط واجهة EYE ورمز التتبّع من إعدادات نطاقك.",
            "احفظ. يعمل التتبّع وتسجيل المشتريات تلقائياً (فعّل الإعادة إن أردت التسجيلات).",
          ],
        },
      },
      {
        id: "shopify",
        title: { en: "Shopify", ar: "شوبيفاي" },
        summary: { en: "Track your storefront and sales on Shopify.", ar: "تتبّع متجرك ومبيعاتك على شوبيفاي." },
        steps: {
          en: [
            "Paste the tracker snippet into your theme’s theme.liquid before </head>.",
            "Paste the order-status snippet into Settings → Checkout → Order status page → Additional scripts.",
            "Replace the placeholders with your EYE API URL and token.",
            "Place a test order — it appears in Campaigns within a minute.",
          ],
          ar: [
            "الصق مقتطف التتبّع في ملف theme.liquid قبل </head>.",
            "الصق مقتطف صفحة حالة الطلب في الإعدادات ← الدفع ← صفحة حالة الطلب ← سكربتات إضافية.",
            "استبدل العناصر النائبة برابط واجهة EYE والرمز.",
            "نفّذ طلباً تجريبياً — سيظهر في الحملات خلال دقيقة.",
          ],
        },
      },
      {
        id: "growthbook",
        title: { en: "GrowthBook (advanced A/B)", ar: "GrowthBook (اختبارات متقدمة)" },
        summary: { en: "Use a rigorous experiment engine with EYE’s revenue.", ar: "استخدم محرك تجارب دقيقاً مع إيرادات EYE." },
        steps: {
          en: [
            "Run GrowthBook (self-host or cloud) and point it at EYE’s ClickHouse data source.",
            "Create a GrowthBook REST API key.",
            "Set GROWTHBOOK_API_HOST and GROWTHBOOK_API_KEY on the EYE backend.",
            "Add the GrowthBook SDK to your site with a callback that calls EYE.experiment(key, variant).",
          ],
          ar: [
            "شغّل GrowthBook (ذاتي الاستضافة أو سحابي) ووجّهه إلى مصدر بيانات ClickHouse الخاص بـ EYE.",
            "أنشئ مفتاح REST API في GrowthBook.",
            "اضبط GROWTHBOOK_API_HOST و GROWTHBOOK_API_KEY في خادم EYE.",
            "أضف SDK الخاص بـ GrowthBook إلى موقعك مع دالة تستدعي EYE.experiment(key, variant).",
          ],
        },
      },
      {
        id: "convert",
        title: { en: "Convert.com (A/B Studio)", ar: "Convert.com (استوديو A/B)" },
        summary: { en: "Run A/B tests in Convert.com with EYE's revenue overlay.", ar: "نفّذ اختبارات A/B في Convert.com مع طبقة إيرادات EYE." },
        steps: {
          en: [
            "In Convert.com → Settings → REST API, copy your Account ID, Application ID and API key.",
            "Set CONVERT_ACCOUNT_ID, CONVERT_APPLICATION_ID and CONVERT_API_KEY on the EYE backend.",
            "From Convert's tracking hook, call EYE.experiment(experienceKey, variant) so EYE can attribute revenue.",
            "Open the A/B Studio → your Convert experiences appear with EYE revenue per variant.",
          ],
          ar: [
            "في Convert.com ← الإعدادات ← REST API، انسخ Account ID و Application ID ومفتاح API.",
            "اضبط CONVERT_ACCOUNT_ID و CONVERT_APPLICATION_ID و CONVERT_API_KEY في خادم EYE.",
            "من خطّاف تتبّع Convert، استدعِ EYE.experiment(experienceKey, variant) ليُسند EYE الإيراد.",
            "افتح استوديو A/B ← تظهر تجارب Convert مع إيراد EYE لكل نسخة.",
          ],
        },
      },
    ],
  },

  {
    id: "leads",
    icon: "Users",
    title: { en: "Find new customers (Leads)", ar: "اعثر على عملاء جدد (Leads)" },
    description: { en: "Turn site visitors into customers — compliant, reviewed outreach.", ar: "حوّل زوار موقعك إلى عملاء — تواصل متوافق ومُراجَع." },
    articles: [
      {
        id: "warm-leads",
        title: { en: "Warm leads from your visitors", ar: "عملاء محتملون من زوارك" },
        summary: { en: "See which companies visited your sites and add them as leads.", ar: "اعرف أي الشركات زارت مواقعك وأضفها كعملاء محتملين." },
        where: { en: "Reports & Tools → Leads", ar: "التقارير والأدوات ← Leads" },
        steps: {
          en: [
            "Open Reports & Tools → Leads.",
            "Click “Find warm leads” — EYE adds the companies that visited your sites (from B2B enrichment).",
            "You can also add a lead manually or “Import” a CSV (company,website,contact_name,email).",
            "Update each lead's status (new → contacted → replied → won/lost) as you work it.",
          ],
          ar: [
            "افتح التقارير والأدوات ← Leads.",
            "اضغط «إيجاد العملاء الدافئين» — يضيف EYE الشركات التي زارت مواقعك (من إثراء B2B).",
            "يمكنك أيضاً إضافة عميل يدوياً أو «استيراد» ملف CSV (company,website,contact_name,email).",
            "حدّث حالة كل عميل (جديد ← تم التواصل ← رد ← فاز/خسر) أثناء عملك عليه.",
          ],
        },
      },
      {
        id: "outreach",
        title: { en: "AI-assisted outreach (compliant)", ar: "تواصل بمساعدة الذكاء (متوافق)" },
        summary: { en: "Draft a personalised email with AI, review it, then send.", ar: "اكتب بريداً مخصصاً بالذكاء، راجعه، ثم أرسل." },
        where: { en: "Leads → mail icon on a lead", ar: "Leads ← أيقونة البريد على العميل" },
        steps: {
          en: [
            "Click the mail icon on a lead to open the outreach panel.",
            "Click “AI draft” — review and edit the generated subject + body (it never sends automatically).",
            "Click “Send”. An unsubscribe link is added; suppressed/bounced addresses are skipped; a daily cap protects deliverability.",
            "Unsubscribes and bounces are added to your suppression list automatically and never contacted again.",
          ],
          ar: [
            "اضغط أيقونة البريد على عميل لفتح لوحة التواصل.",
            "اضغط «مسودة الذكاء» — راجع وعدّل العنوان والنص (لا يُرسل تلقائياً أبداً).",
            "اضغط «إرسال». يُضاف رابط إلغاء الاشتراك؛ وتُتخطّى العناوين الموقوفة؛ وحدّ يومي يحمي التسليم.",
            "تُضاف إلغاءات الاشتراك والارتدادات لقائمة الحظر تلقائياً ولا يُعاد التواصل معها.",
          ],
        },
        tips: {
          en: ["Keep outreach to relevant business contacts and always let recipients opt out — it keeps you compliant and your domain reputation healthy."],
          ar: ["وجّه التواصل لجهات عمل ذات صلة واسمح دائماً بإلغاء الاشتراك — يحافظ على التوافق وسمعة نطاقك."],
        },
      },
    ],
  },

  {
    id: "account",
    icon: "Settings",
    title: { en: "Account & settings", ar: "الحساب والإعدادات" },
    description: { en: "Security, billing, notifications and data.", ar: "الأمان والفوترة والإشعارات والبيانات." },
    articles: [
      {
        id: "security",
        title: { en: "Security & 2FA", ar: "الأمان والتحقق بخطوتين" },
        summary: { en: "Protect your account.", ar: "احمِ حسابك." },
        where: { en: "Settings → Security", ar: "الإعدادات ← الأمان" },
        steps: {
          en: [
            "Open Settings → Security.",
            "Enable two-factor authentication and scan the QR with an authenticator app.",
            "Save your backup codes somewhere safe.",
            "Change your password regularly and never share your tracking secret keys.",
          ],
          ar: [
            "افتح الإعدادات ← الأمان.",
            "فعّل التحقق بخطوتين وامسح رمز QR بتطبيق المصادقة.",
            "احفظ رموز النسخ الاحتياطي في مكان آمن.",
            "غيّر كلمة المرور دورياً ولا تشارك مفاتيحك السرية أبداً.",
          ],
        },
      },
      {
        id: "billing",
        title: { en: "Billing & plans", ar: "الفوترة والباقات" },
        summary: { en: "Upgrade and pay for your plan.", ar: "رقِّ باقتك وادفع." },
        where: { en: "Settings → Billing", ar: "الإعدادات ← الفوترة" },
        steps: {
          en: [
            "Open Settings → Billing.",
            "Choose a plan and click “Pay Now” (card via Paymob) or use bank transfer.",
            "Complete payment on the secure page that opens.",
            "Your subscription activates automatically once payment is confirmed.",
          ],
          ar: [
            "افتح الإعدادات ← الفوترة.",
            "اختر باقة واضغط «ادفع الآن» (بطاقة عبر Paymob) أو استخدم التحويل البنكي.",
            "أكمل الدفع في الصفحة الآمنة التي تُفتح.",
            "يتم تفعيل اشتراكك تلقائياً بمجرد تأكيد الدفع.",
          ],
        },
      },
      {
        id: "notifications-exports",
        title: { en: "Notifications & exports", ar: "الإشعارات والتصدير" },
        summary: { en: "Control emails and export your data.", ar: "تحكم بالبريد وصدّر بياناتك." },
        steps: {
          en: [
            "Open Settings → Notifications to choose which emails/in-app alerts you receive.",
            "Open Reports → Exports to download analytics datasets.",
            "Use a scheduled/weekly export for recurring reports.",
            "Use Settings → Privacy/GDPR to handle data-deletion requests.",
          ],
          ar: [
            "افتح الإعدادات ← الإشعارات لاختيار الرسائل/التنبيهات التي تستلمها.",
            "افتح التقارير ← التصدير لتنزيل بيانات التحليلات.",
            "استخدم تصديراً مجدولاً/أسبوعياً للتقارير المتكررة.",
            "استخدم الإعدادات ← الخصوصية لمعالجة طلبات حذف البيانات.",
          ],
        },
      },
    ],
  },
];
