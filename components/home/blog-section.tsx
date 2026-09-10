import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Leaf } from 'lucide-react';
import type { PostSummary } from '@/types/post';
import { SectionHeading } from './section-heading';

export function BlogSection({ posts }: { posts: PostSummary[] }) {
  if (!posts?.length) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-14 md:py-20">
      <div className="container">
        <SectionHeading
          eyebrow="مجله رژیتامین"
          title="مطالبی برای مسیر بهتر"
          description="دانش و محتوایی که کمک می‌کند انتخاب‌های روزمره سالم‌تری داشته باشی."
          href="/blog"
          linkText="همه مقالات"
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
          {posts.slice(0, 6).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_20px_48px_rgba(30,35,25,.08)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#FFF8F3]">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Leaf className="h-7 w-7 text-[var(--brand-orange-dark)]/20" />
                    </div>
                  </div>
                )}

                <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold text-slate-500 shadow-sm backdrop-blur">
                  {new Date(post.date).toLocaleDateString('fa-IR')}
                </div>
              </div>

              <div className="p-3.5 sm:p-5 md:p-6">
                <h3 className="line-clamp-2 text-[12px] font-black leading-6 text-slate-950 transition group-hover:text-[var(--brand-orange-dark)] sm:text-sm md:text-base md:leading-7">
                  {post.title}
                </h3>

                <div className="mt-5 inline-flex items-center gap-2 text-xs font-black text-[var(--brand-orange-dark)]">
                  مطالعه مقاله
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
