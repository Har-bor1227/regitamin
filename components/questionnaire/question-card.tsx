'use client';

import { useEffect, useRef } from 'react';
import type {
  DietQuestion,
  DietQuestionnaireValue,
} from '@/types/diet-questionnaire';

import QuestionOptions from '@/components/questionnaire/question-options';

interface QuestionCardProps {
  question: DietQuestion;
  value: DietQuestionnaireValue | undefined;
  error?: string;
  disabled?: boolean;
  onChange: (value: DietQuestionnaireValue) => void;
  onSubmit: () => void;
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    );
}

function normalizeDecimalInput(value: string) {
  return normalizeDigits(value)
    .replace(/[٫,]/g, '.')
    .replace(/[^0-9.]/g, '')
    .replace(/^(\d*\.\d*).*$/, '$1');
}

function getInputValue(value: DietQuestionnaireValue | undefined) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

export default function QuestionCard({
  question,
  value,
  error,
  disabled = false,
  onChange,
  onSubmit,
}: QuestionCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (question.type !== 'number' && question.type !== 'text') return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [question.id, question.type]);

  const handleNumberChange = (rawValue: string) => {
    const normalized = normalizeDecimalInput(rawValue);

    if (!normalized || normalized === '.') {
      onChange('');
      return;
    }

    const numeric = Number(normalized);
    if (!Number.isFinite(numeric)) return;

    if (question.max !== undefined && numeric > question.max) return;

    onChange(normalized);
  };

  const inputValue = getInputValue(value);

  return (
    <section className="w-full">
      <div className="mb-7">
        <span
          className={[
            'mb-3 inline-flex rounded-full px-3 py-1.5 text-[10px] font-black',
            question.required
              ? 'bg-[var(--brand-orange)]/10 text-[var(--brand-orange-dark)]'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          {question.required
            ? 'برای تنظیم رژیم ضروریه'
            : 'اختیاری'}
        </span>

        <h1 className="max-w-[720px] text-[26px] font-black leading-[1.5] tracking-tight text-slate-950 sm:text-[32px] md:text-[38px]">
          {question.title}
        </h1>

        {question.description && (
          <p className="mt-3 max-w-[650px] text-sm font-medium leading-7 text-muted-foreground sm:text-[15px]">
            {question.description}
          </p>
        )}
      </div>

      {(question.type === 'single' || question.type === 'multi') && (
        <QuestionOptions
          question={question}
          value={
            Array.isArray(value) || typeof value === 'string'
              ? value
              : undefined
          }
          onChange={onChange}
        />
      )}

      {question.type === 'number' && (
        <div className="relative">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(event) =>
              handleNumberChange(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSubmit();
              }
            }}
            type="text"
            inputMode="decimal"
            dir="ltr"
            disabled={disabled}
            placeholder={question.placeholder}
            aria-label={question.title}
            className={[
              'h-[72px] w-full rounded-[20px] border bg-white px-5 text-center text-[25px] font-black tracking-wide outline-none transition',
              'placeholder:text-slate-300',
              error
                ? 'border-red-300 ring-4 ring-red-500/5'
                : 'border-slate-200 focus:border-[var(--brand-orange-dark)] focus:ring-4 focus:ring-[var(--brand-orange)]/10',
            ].join(' ')}
          />

          {question.unit && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 sm:left-5">
              {question.unit}
            </span>
          )}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={inputValue}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          className={[
            'min-h-[160px] w-full resize-none rounded-[20px] border bg-white px-5 py-4 text-sm font-medium leading-7 outline-none transition',
            'placeholder:text-slate-300',
            error
              ? 'border-red-300 ring-4 ring-red-500/5'
              : 'border-slate-200 focus:border-[var(--brand-orange-dark)] focus:ring-4 focus:ring-[var(--brand-orange)]/10',
          ].join(' ')}
        />
      )}

      {question.type === 'text' && question.maxLength && (
        <div className="mt-2 text-left">
          <span
            dir="ltr"
            className="text-[10px] font-medium text-muted-foreground"
          >
            {inputValue.length.toLocaleString('fa-IR')} /{' '}
            {question.maxLength.toLocaleString('fa-IR')}
          </span>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold leading-6 text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}