import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkText,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-orange-dark)]" />

          <span className="text-[11px] font-black text-[var(--brand-orange-dark)]">
            {eyebrow}
          </span>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.15rem]">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-8 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {href && linkText && (
        <Link
          href={href}
          className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/50 hover:text-[var(--brand-orange-dark)]"
        >
          {linkText}

          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
