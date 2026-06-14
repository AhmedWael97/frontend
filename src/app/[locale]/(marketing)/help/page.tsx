import type { Metadata } from "next";
import HelpClient from "./HelpClient";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const ar = params.locale === "ar";
  return {
    title: ar ? "مركز المساعدة — EYE" : "Help Center — EYE",
    description: ar
      ? "أدلة بسيطة خطوة بخطوة لكل ميزة في EYE بالعربية والإنجليزية."
      : "Simple, step-by-step guides for every EYE feature, in English and Arabic.",
    alternates: {
      canonical: `/${params.locale}/help`,
      languages: { en: "/en/help", ar: "/ar/help" },
    },
  };
}

export default function HelpPage({ params }: { params: { locale: string } }) {
  return <HelpClient locale={params.locale} />;
}
