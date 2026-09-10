// app/contact/page.tsx

import type { Metadata } from 'next';

import { getPageSeo } from '@/lib/seo/get-page-seo';
import { seoToMetadata } from '@/lib/seo/seo-to-metadata';

import { JsonLd } from '@/components/seo/JsonLd';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import ContactPageContent from '@/components/pages/contact-page-content';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { page, seo } =
    await getPageSeo('تماس-با-ما');

  /*
   * اگر RankMath اطلاعات SEO داشته باشد،
   * همان اطلاعات منبع اصلی Metadata هستند.
   */
  if (seo) {
    return seoToMetadata(seo);
  }

  return {
    title:
      page?.title ||
      'تماس با رژیتامین',

    description:
      'راه‌های ارتباط با رژیتامین، پیگیری سفارش و دریافت راهنمایی.',

    alternates: {
      canonical: '/contact',
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: 'رژیتامین',
      title:
        page?.title ||
        'تماس با رژیتامین',
      description:
        'راه‌های ارتباط با رژیتامین، پیگیری سفارش و دریافت راهنمایی.',
      url: `${BASE_URL}/contact`,
    },
  };
}

export default async function ContactPage() {
  const { page, seo } =
    await getPageSeo('تماس-با-ما');

  const title =
    page?.title ||
    'تماس با رژیتامین';

  const content =
    page?.content ||
    '';

  const breadcrumbItems = [
    {
      name: 'خانه',
      url: '/',
    },
    {
      name: title,
    },
  ];

  return (
    <>
      {seo && (
        <JsonLd seo={seo} />
      )}

      <BreadcrumbSchema
        items={breadcrumbItems}
      />

      <div className="border-b border-border bg-white">
        <div className="container py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  خانه
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <ContactPageContent
        title={title}
        content={content}
      />
    </>
  );
}