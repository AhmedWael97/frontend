// Pass-through root layout. The <html>/<body> (with lang/dir, fonts, head
// scripts) are rendered ONLY by app/[locale]/layout.tsx. Rendering them here
// too produced nested <html>/<body>, which the browser de-duplicates — causing
// the React #418/#423 hydration failure on every page (dead buttons → no signups).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
