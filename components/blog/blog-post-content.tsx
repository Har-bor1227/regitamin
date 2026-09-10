'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  Share2,
  ArrowUp,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import type { Post } from '@/types/post';
import { fadeInUp, staggerContainer } from '@/types/motion';

/* ---------- پس‌زمینهٔ لکه‌های متحرک ---------- */
function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <m.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"
      />
      <m.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl"
      />
      <m.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-200/30 dark:bg-cyan-500/10 rounded-full blur-3xl"
      />
      <m.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-40 left-1/3 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
      />
    </div>
  );
}

/* ---------- نوار پیشرفت اسکرول ---------- */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <m.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-right z-50"
      style={{ scaleX }}
    />
  );
}

/* ---------- تخمین مدت زمان مطالعه ---------- */
function estimateReadingTime(html?: string): string {
  if (!html) return '۵ دقیقه';
  const text = html.replace(/<[^>]+>/g, '');
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} دقیقه`;
}

/* ---------- کارت با تیلت سه‌بعدی ---------- */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({ x: -y / 15, y: x / 15 });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ---------- کامپوننت اصلی ---------- */
interface BlogPostContentProps {
  post: Post;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <LazyMotion features={domAnimation}>
      <main className="relative min-h-screen bg-transparent">
        <ScrollProgress />
        <BackgroundBlobs />

        <article className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <m.div variants={fadeInUp}>
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">خانه</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/blog">وبلاگ</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{post.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </m.div>

          {/* Header with parallax opacity */}
          <m.header style={{ opacity: heroOpacity }} className="mb-10 text-center">
            <Badge variant="secondary" className="mb-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              مقاله
            </Badge>
            <m.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight"
            >
              {post.title.split(' ').map((word, i) => (
                <m.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20, rotateX: -90 },
                    visible: { opacity: 1, y: 0, rotateX: 0 },
                  }}
                  className="inline-block ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
                >
                  {word}
                </m.span>
              ))}
            </m.h1>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-600 dark:text-gray-400">
              {post.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
                    {post.author.avatar ? (
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    ) : (
                      <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {post.author.name}
                  </span>
                </div>
              )}
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date && (
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
              </div>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{estimateReadingTime(post.content)}</span>
              </div>
            </div>
          </m.header>

          {/* Featured Image */}
          {post.featuredImage && (
            <TiltCard>
              <m.figure
                variants={fadeInUp}
                className="mb-10 -mx-4 md:mx-0 overflow-hidden rounded-2xl shadow-2xl"
              >
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt}
                  width={1200}
                  height={675}
                  className="w-full h-auto object-cover max-h-[500px]"
                  priority
                />
              </m.figure>
            </TiltCard>
          )}

          {/* Content */}
          <m.div
            variants={fadeInUp}
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-gray-900 prose-pre:text-gray-100 backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 rounded-2xl p-8 border border-white/20 dark:border-white/10"
          >
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </m.div>

          {/* Footer */}
          <m.div variants={fadeInUp}>
            <Separator className="my-10" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {post.author && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-100 dark:ring-blue-900">
                      {post.author.avatar ? (
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      ) : (
                        <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-500">نویسنده</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {post.author.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl">
                  <Share2 className="h-4 w-4 ml-2" />
                  اشتراک‌گذاری
                </Button>
                <Link href="/blog" passHref>
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    بازگشت به وبلاگ
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </m.div>
        </article>

        {/* دکمه شناور بازگشت به بالا */}
        <AnimatePresence>
          <m.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-blue-200/40 dark:border-blue-500/30 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </m.button>
        </AnimatePresence>
      </main>
    </LazyMotion>
  );
}
