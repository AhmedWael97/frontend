import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

// Marketing-site-only type system — deliberately not touching the app/dashboard's
// fonts or design tokens. Space Grotesk carries headings/body; JetBrains Mono is
// reserved for anything numeric/technical (metrics, timestamps, session IDs).
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-marketing",
  display: "swap",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${grotesk.variable} ${mono.variable}`} style={{ fontFamily: "var(--font-grotesk)" }}>
      {children}
    </div>
  );
}
