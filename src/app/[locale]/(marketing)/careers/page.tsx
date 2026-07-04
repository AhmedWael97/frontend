import type { Metadata } from "next";
import { MarketingDoc } from "@/components/marketing/MarketingDoc";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage({ params }: { params: { locale: string } }) {
  const ar = params.locale === "ar";
  return (
    <MarketingDoc
      locale={params.locale}
      title={ar ? "وظائف" : "Careers"}
      subtitle={ar ? "نبني فريقًا صغيرًا شغوفًا بالخصوصية والأداء." : "We're a small team obsessed with privacy and performance."}
    >
      {ar ? (
        <>
          <p>لا توجد وظائف مفتوحة حاليًا، لكننا نحب التعرّف على موهوبين.</p>
          <p>إن كنت مهندس برمجيات أو مصمم أو مسوّق نمو وتؤمن بتحليلات تحترم الخصوصية، راسلنا مع أعمالك على <a href="mailto:careers@eye-analsyis.live">careers@eye-analsyis.live</a>.</p>
        </>
      ) : (
        <>
          <p>No open roles right now — but we always like meeting great people.</p>
          <p>If you're an engineer, designer, or growth marketer who believes in privacy-respecting analytics, send your work to <a href="mailto:careers@eye-analsyis.live">careers@eye-analsyis.live</a>.</p>
        </>
      )}
    </MarketingDoc>
  );
}
