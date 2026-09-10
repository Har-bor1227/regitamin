import type { SeoData } from '@/types/seo';

export function JsonLd({ seo }: { seo: SeoData }) {
  if (!seo.jsonLd || seo.jsonLd.length === 0) return null;
  return (
    <>
      {seo.jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: typeof ld === 'string' ? ld : JSON.stringify(ld),
          }}
        />
      ))}
    </>
  );
}