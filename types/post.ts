export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  author?: {
    name: string;
    avatar?: string;
  };
  categories?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

export interface Post extends PostSummary {
  content: string;
  databaseId: number;
  uri?: string;
}