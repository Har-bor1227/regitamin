const WP_API_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_URL?.trim() ||
  'http://localhost:8080/wp-json';

const WP_USERNAME =
  process.env.WP_USERNAME?.trim() || '';

const WP_APP_PASSWORD =
  process.env.WP_APP_PASSWORD?.trim() || '';

export async function wpFetch<T = any>(
  endpoint: string,
): Promise<T> {
  if (
    !WP_USERNAME ||
    !WP_APP_PASSWORD
  ) {
    throw new Error(
      'WordPress authentication configuration is missing.',
    );
  }

  const authHeader =
    Buffer.from(
      `${WP_USERNAME}:${WP_APP_PASSWORD}`,
    ).toString('base64');

  const url =
    `${WP_API_BASE}${endpoint}`;

  const res =
    await fetch(
      url,
      {
        headers: {
          Authorization:
            `Basic ${authHeader}`,

          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        next: {
          revalidate: 3600,
          tags: ['wp-api'],
        },
      },
    );

  if (!res.ok) {
    const errorText =
      await res.text();

    throw new Error(
      `WordPress API error: ${res.status} - ${errorText}`,
    );
  }

  return res.json();
}