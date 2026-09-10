export interface PageData {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  content: string;
  uri?: string;
  // seo field will be added when Rank Math GraphQL is available
}