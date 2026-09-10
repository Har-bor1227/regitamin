'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import {
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  Clock3,
  Leaf,
  BookOpen,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { PostSummary } from '@/types/post';

interface BlogPageContentProps {
  posts: PostSummary[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  nextPageUrl: string | null;
  after?: string;
}

/* =========================================================
   Helpers
   ========================================================= */

function stripHtml(value?: string) {
  if (!value) return '';

  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateReadingTime(text?: string) {
  const plainText = stripHtml(text);

  if (!plainText) {
    return '۵ دقیقه';
  }

  const wordsPerMinute = 220;
  const words = plainText
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(
    1,
    Math.ceil(words / wordsPerMinute),
  );

  return `${minutes.toLocaleString('fa-IR')} دقیقه`;
}

function formatDate(date?: string) {
  if (!date) return '';

  try {
    return new Date(date).toLocaleDateString(
      'fa-IR',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );
  } catch {
    return '';
  }
}

/* =========================================================
   Article Meta
   ========================================================= */

function ArticleMeta({
  post,
  light = false,
}: {
  post: PostSummary;
  light?: boolean;
}) {
  return (
    <div
      className={[
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]',
        light
          ? 'text-white/65'
          : 'text-muted-foreground',
      ].join(' ')}
    >
      {post.date && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(post.date)}
        </span>
      )}

      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" />
        {estimateReadingTime(post.excerpt)}
      </span>
    </div>
  );
}

/* =========================================================
   Author
   ========================================================= */

function Author({
  post,
  light = false,
}: {
  post: PostSummary;
  light?: boolean;
}) {
  if (!post.author) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={[
          'relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full',
          light
            ? 'bg-white/15 text-white'
            : 'bg-primary/10 text-primary',
        ].join(' ')}
      >
        {post.author.avatar ? (
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <UserRound className="h-4 w-4" />
        )}
      </div>

      <span
        className={[
          'max-w-[150px] truncate text-xs font-semibold',
          light
            ? 'text-white/80'
            : 'text-foreground',
        ].join(' ')}
      >
        {post.author.name}
      </span>
    </div>
  );
}

/* =========================================================
   Small Article Card
   ========================================================= */

function ArticleCard({
  post,
}: {
  post: PostSummary;
}) {
  const excerpt = useMemo(
    () => stripHtml(post.excerpt),
    [post.excerpt],
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-[0_8px_30px_rgba(20,40,30,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(20,40,30,0.09)]">
      <Link
        href={`/blog/${post.slug}`}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f7f2]">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.url}
              alt={
                post.featuredImage.alt ||
                post.title
              }
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-primary/20" />
            </div>
          )}

          {post.categories?.[0] && (
            <span className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/92 px-3 py-1.5 text-[10px] font-bold text-primary shadow-sm backdrop-blur">
              {post.categories[0].name}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <ArticleMeta post={post} />

        <Link href={`/blog/${post.slug}`}>
          <h2 className="mt-3 line-clamp-2 text-lg font-black leading-8 transition-colors group-hover:text-primary">
            {post.title}
          </h2>
        </Link>

        {excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
            {excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <Author post={post} />

          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
            مطالعه
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   Featured Article
   ========================================================= */

function FeaturedArticle({
  post,
}: {
  post: PostSummary;
}) {
  const excerpt = useMemo(
    () => stripHtml(post.excerpt),
    [post.excerpt],
  );

  return (
    <article className="group relative overflow-hidden rounded-[30px] bg-slate-950">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block min-h-[470px] md:min-h-[520px]"
      >
        {/* image */}
        <div className="absolute inset-0">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage.url}
              alt={
                post.featuredImage.alt ||
                post.title
              }
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1180px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900">
              <BookOpen className="h-16 w-16 text-white/10" />
            </div>
          )}
        </div>

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-10">
          {post.categories?.[0] && (
            <span className="inline-flex rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">
              {post.categories[0].name}
            </span>
          )}

          <h2 className="mt-4 max-w-3xl text-2xl font-black leading-[1.45] text-white sm:text-3xl md:text-4xl">
            {post.title}
          </h2>

          {excerpt && (
            <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              {excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <ArticleMeta
              post={post}
              light
            />

            <Author
              post={post}
              light
            />
          </div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            مطالعه مقاله
            <ArrowLeft className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   Empty State
   ========================================================= */

function EmptyBlogState() {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 text-primary">
        <BookOpen className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-xl font-black">
        هنوز مقاله‌ای منتشر نشده است
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        به‌زودی مطالب جدید و کاربردی در مجله رژیتامین منتشر
        خواهد شد.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
      >
        بازگشت به خانه
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* =========================================================
   Main
   ========================================================= */

export default function BlogPageContent({
  posts,
  nextPageUrl,
  after,
}: BlogPageContentProps) {
  const [showTopButton, setShowTopButton] =
    useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTopButton(
        window.scrollY > 700,
      );
    };

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true },
    );

    onScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll,
      );
    };
  }, []);

  const featuredPost = posts?.[0];
  const remainingPosts = posts?.slice(1) || [];

  return (
    <main className="min-h-screen bg-[#fafcf9]">
      {/* =====================================================
          Hero
          ===================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-[#edf5ef]">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
        />

        <div className="container relative py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              مجله رژیتامین
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              دانش بیشتر،
              <span className="block text-primary">
                انتخاب بهتر
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              مطالب کاربردی درباره تغذیه، سبک زندگی، تناسب اندام
              و موضوعاتی که کمک می‌کنند آگاهانه‌تر انتخاب کنی.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          Content
          ===================================================== */}

      <div className="container py-10 md:py-14">
        {posts.length === 0 ? (
          <EmptyBlogState />
        ) : (
          <>
            {/* Featured */}
            {featuredPost && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-7 w-1 rounded-full bg-primary" />

                  <div>
                    <p className="text-[11px] font-bold text-primary">
                      پیشنهاد امروز
                    </p>

                    <h2 className="text-xl font-black">
                      مقاله منتخب
                    </h2>
                  </div>
                </div>

                <FeaturedArticle
                  post={featuredPost}
                />
              </section>
            )}

            {/* Articles */}
            {remainingPosts.length > 0 && (
              <section className="mt-14 md:mt-18">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-primary">
                      تازه‌های مجله
                    </p>

                    <h2 className="mt-1 text-2xl font-black md:text-3xl">
                      جدیدترین مقالات
                    </h2>
                  </div>

                  <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <BookOpen className="h-4 w-4" />
                    مطالب کاربردی و آموزشی
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map(
                    (post) => (
                      <ArticleCard
                        key={post.id}
                        post={post}
                      />
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Next */}
            {nextPageUrl && (
              <div className="mt-12 flex justify-center">
                <Link
                  href={nextPageUrl}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  مقالات بیشتر
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            )}

            {after && (
              <div className="mt-5 flex justify-center">
                <Link
                  href="/blog"
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  بازگشت به صفحه اول مقالات
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* =====================================================
          Scroll top
          ===================================================== */}

      {showTopButton && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
          }
          aria-label="بازگشت به بالا"
          className="fixed bottom-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 shadow-lg transition-all hover:-translate-y-1 hover:text-primary"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </main>
  );
}