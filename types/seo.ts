export interface SeoData {
  title: string;
  description: string;
  canonical?: string;
  focusKeyword?: string;
  robots?: {
    index?: string;
    follow?: string;
    noarchive?: boolean;
    nosnippet?: boolean;
    maxSnippet?: number;
    maxImagePreview?: string;
    maxVideoPreview?: number;
  };
  openGraph?: {
    title?: string;
    description?: string;
    image?: {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    } | null;
    type?: string;
    url?: string;
    siteName?: string;
    locale?: string;
    articleAuthor?: string;
    articlePublishedTime?: string;
    articleModifiedTime?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    cardType?: string;
    site?: string;
    creator?: string;
  };
  jsonLd?: object[]; // JSON-LD strings ready for injection
}