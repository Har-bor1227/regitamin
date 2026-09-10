import { graphqlClient } from '@/lib/graphql-client';
import { PostSummary, Post } from '@/types/post';

export interface PostsPageResult {
  posts: PostSummary[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

/**
 * دریافت لیست صفحه‌بندی‌شده پست‌ها با Cursor
 */
export async function getAllPosts(
  first: number = 10,
  after?: string
): Promise<PostsPageResult> {
  const query = `
    query GetAllPosts($first: Int!, $after: String) {
      posts(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          slug
          uri
          title
          excerpt
          date
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          author {
            node {
              name
              avatar {
                url
              }
            }
          }
        }
      }
    }
  `;

  const variables = { first, after: after || null };
  const data = await graphqlClient.request<any>(query, variables);

  const pageInfo = {
    hasNextPage: data.posts.pageInfo.hasNextPage,
    endCursor: data.posts.pageInfo.endCursor,
  };

  const posts: PostSummary[] = data.posts.nodes.map((node: any) => ({
    id: node.id,
    slug: node.slug,
    title: node.title,
    excerpt: node.excerpt,
    date: node.date,
    featuredImage: node.featuredImage?.node
      ? {
          url: node.featuredImage.node.sourceUrl,
          alt: node.featuredImage.node.altText ?? '',
        }
      : undefined,
    author: node.author?.node
      ? {
          name: node.author.node.name,
          avatar: node.author.node.avatar?.url ?? undefined,
        }
      : undefined,
  }));

  return { posts, pageInfo };
}

/**
 * دریافت یک پست بر اساس slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const decodedSlug = decodeURIComponent(slug);

  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        id
        databaseId
        slug
        uri
        title
        content(format: RENDERED)
        excerpt(format: RENDERED)
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
    }
  `;

  const variables = { slug: decodedSlug };
  const data = await graphqlClient.request<any>(query, variables);

  if (!data.post) return null;

  const post = data.post;
  return {
    id: post.id,
    databaseId: post.databaseId,
    slug: post.slug,
    uri: post.uri,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    date: post.date,
    featuredImage: post.featuredImage?.node
      ? {
          url: post.featuredImage.node.sourceUrl,
          alt: post.featuredImage.node.altText ?? '',
        }
      : undefined,
    author: post.author?.node
      ? {
          name: post.author.node.name,
          avatar: post.author.node.avatar?.url ?? undefined,
        }
      : undefined,
  };
}

/**
 * دریافت همه پست‌ها برای Sitemap (با pagination خودکار)
 * دیگر محدود به ۱۰۰۰ نیست و همه پست‌ها را واکشی می‌کند.
 */
export async function getAllPostsForSitemap(): Promise<
  { slug: string; modified: string }[]
> {
  const allPosts: { slug: string; modified: string }[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query GetAllPostsForSitemap($first: Int!, $after: String) {
        posts(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            slug
            date
            modified
          }
        }
      }
    `;

const data: any = await graphqlClient.request<any>(query, {      first: 100, // تعداد مطمئن در هر درخواست
      after: endCursor,
    });

    const nodes = data.posts.nodes || [];
    for (const node of nodes) {
      allPosts.push({
        slug: node.slug,
        modified: node.modified || node.date,
      });
    }

    hasNextPage = data.posts.pageInfo.hasNextPage;
    endCursor = data.posts.pageInfo.endCursor;
  }

  return allPosts;
}