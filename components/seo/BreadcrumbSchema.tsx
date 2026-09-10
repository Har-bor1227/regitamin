export interface BreadcrumbItem {
  name: string;
  url?: string; // اگر مسیر مطلق نباشه، با BASE_URL ترکیب می‌شود
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
        ? item.url.startsWith('http')
          ? item.url
          : `${baseUrl}${item.url}`
        : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}