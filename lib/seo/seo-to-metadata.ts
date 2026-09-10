import type { Metadata } from 'next';
import type { SeoData } from '@/types/seo';

function fixCanonicalDomain(url: string | undefined): string | undefined {
  if (!url) return undefined;

  const frontendBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const urlObj = new URL(url);
    const frontendObj = new URL(frontendBase);

    if (urlObj.origin !== frontendObj.origin) {
      return `${frontendBase.replace(/\/$/, '')}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    }
  } catch {
    // if URL is invalid, return as is
  }

  return url;
}

function validateMaxImagePreview(
  value: string | undefined
): 'none' | 'standard' | 'large' | undefined {
  const allowed = ['none', 'standard', 'large'];
  if (value && allowed.includes(value)) {
    return value as 'none' | 'standard' | 'large';
  }
  return undefined;
}

function cleanTitle(title: string): string {
  return title.replace(/\s*\|\s*DOT$/, '').trim();
}

export function seoToMetadata(seo: SeoData): Metadata {
  // تعیین تصویر توییتر: اگر twitter.image نباشد از OG استفاده کن
  let twitterImage: string | undefined = seo.twitter?.image;
  if (!twitterImage && seo.openGraph?.image?.url) {
    twitterImage = seo.openGraph.image.url;
  }

  return {
    title: cleanTitle(seo.title),
    description: seo.description,
    alternates: {
      canonical: fixCanonicalDomain(seo.canonical),
    },
    robots: {
      index: seo.robots?.index !== 'noindex',
      follow: seo.robots?.follow !== 'nofollow',
      noarchive: seo.robots?.noarchive ?? undefined,
      nosnippet: seo.robots?.nosnippet ?? undefined,
      'max-snippet': seo.robots?.maxSnippet ?? undefined,
      'max-image-preview': validateMaxImagePreview(seo.robots?.maxImagePreview),
      'max-video-preview': seo.robots?.maxVideoPreview ?? undefined,
    },
    openGraph: {
      title: seo.openGraph?.title ? cleanTitle(seo.openGraph.title) : cleanTitle(seo.title),
      description: seo.openGraph?.description || seo.description,
      images: seo.openGraph?.image
        ? [
            {
              url: seo.openGraph.image.url,
              width: seo.openGraph.image.width,
              height: seo.openGraph.image.height,
              alt: seo.openGraph.image.alt,
            },
          ]
        : undefined,
      type: seo.openGraph?.type as any,
      url: seo.openGraph?.url,
      siteName: seo.openGraph?.siteName,
      locale: seo.openGraph?.locale,
      authors: seo.openGraph?.articleAuthor ? [seo.openGraph.articleAuthor] : undefined,
      publishedTime: seo.openGraph?.articlePublishedTime,
      modifiedTime: seo.openGraph?.articleModifiedTime,
    },
    twitter: {
card: (seo.twitter?.cardType || 'summary_large_image') as 'summary' | 'summary_large_image' | 'player' | 'app',      title: seo.twitter?.title
        ? cleanTitle(seo.twitter.title)
        : seo.openGraph?.title
        ? cleanTitle(seo.openGraph.title)
        : cleanTitle(seo.title),
      description: seo.twitter?.description || seo.openGraph?.description || seo.description,
      images: twitterImage ? [twitterImage] : undefined,
      site: seo.twitter?.site,
      creator: seo.twitter?.creator,
    },
  };
}