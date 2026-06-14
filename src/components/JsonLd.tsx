/**
 * Renders one or more JSON-LD structured-data blocks. Server component — safe to
 * use in any marketing page. Google reads these <script type="application/ld+json">
 * blocks for rich results (Organization, SoftwareApplication, FAQ, …).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
