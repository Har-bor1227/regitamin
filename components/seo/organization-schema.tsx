type OrganizationSchemaData = {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
};

export function OrganizationSchema({ org }: { org: OrganizationSchemaData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    ...(org.logo && { logo: org.logo }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}