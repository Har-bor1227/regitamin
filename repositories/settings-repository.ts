import { graphqlClient } from '@/lib/graphql-client';
import { SiteSettings } from '@/types/site';

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await graphqlClient.request<any>(
    `query GetSiteTitle {
      generalSettings {
        title
        description
        url
        language
      }
    }`
  );

  return {
    title: data.generalSettings?.title ?? '',
    description: data.generalSettings?.description ?? '',
    url: data.generalSettings?.url ?? '',
    language: data.generalSettings?.language ?? undefined,
  };
}