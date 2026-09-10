import { graphqlClient } from '@/lib/graphql-client';
import { PageData } from '@/types/page';

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const decodedSlug = decodeURIComponent(slug);
  const uri = `/${decodedSlug}/`;

  const query = `
    query GetPageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        id
        databaseId
        slug
        title
        content
        uri
      }
    }
  `;

  const variables = { slug: uri };
  const data = await graphqlClient.request<any>(query, variables);

  if (!data.page) return null;

  return {
    id: data.page.id,
    databaseId: data.page.databaseId,
    slug: data.page.slug,
    title: data.page.title,
    content: data.page.content,
    uri: data.page.uri,
  };
}