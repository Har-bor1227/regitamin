// lib/graphql-client.ts
import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.WORDPRESS_GRAPHQL_URL!;

const cachedFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    next: { revalidate: 3600, tags: ['posts', 'pages'] }, // برچسب‌ها برای پست‌ها و برگه‌ها
  });
};

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
  fetch: cachedFetch as any,
});