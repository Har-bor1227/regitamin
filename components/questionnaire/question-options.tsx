'use client';

import { Check } from 'lucide-react';

import type {
  DietQuestion,
  DietQuestionOption,
} from '@/types/diet-questionnaire';

interface QuestionOptionsProps {
  question: DietQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

function getSelectedValues(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function OptionCard({
  option,
  selected,
  onClick,
  multiple,
}: {
  option: DietQuestionOption;
  selected: boolean;
  onClick: () => void;
  multiple: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'group relative flex min-h-[68px] w-full items-center gap-3 rounded-[20px] border px-4 py-3.5 text-right',
        'transition-all duration-200 active:scale-[0.985]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/10',
        selected
          ? 'border-[var(--brand-orange-dark)] bg-[var(--brand-orange)]/[0.06] shadow-[0_8px_25px_rgba(225,76,43,.07)]'
          : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-[#FFFDFC]',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition',
          selected
            ? 'border-[var(--brand-orange-dark)] bg-[var(--brand-orange-dark)] text-white'
            : 'border-slate-200 bg-slate-50 text-slate-300 group-hover:border-orange-200',
        ].join(' ')}
      >
        {selected ? (
          <Check className="h-4 w-4" strokeWidth={2.7} />
        ) : (
          <span
            className={[
              'h-2.5 w-2.5 rounded-full border',
              multiple ? 'rounded-md' : 'rounded-full',
              'border-slate-300',
            ].join(' ')}
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={[
            'block text-sm font-black leading-6',
            selected ? 'text-slate-950' : 'text-slate-800',
          ].join(' ')}
        >
          {option.label}
        </span>

        {option.description && (
          <span className="mt-0.5 block text-[11px] font-medium leading-5 text-muted-foreground">
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
}

export default function QuestionOptions({
  question,
  value,
  onChange,
}: QuestionOptionsProps) {
  if (!question.options?.length) return null;

  const selectedValues = getSelectedValues(value);
  const multiple = question.type === 'multi';

  const handleSelect = (optionValue: string) => {
    if (!multiple) {
      onChange(optionValue);
      return;
    }

    if (optionValue === 'none') {
      onChange(['none']);
      return;
    }

    const current = selectedValues.filter((item) => item !== 'none');

    onChange(
      current.includes(optionValue)
        ? current.filter((item) => item !== optionValue)
        : [...current, optionValue],
    );
  };

  return (
    <div className="space-y-2.5">
      {question.options.map((option) => (
        <OptionCard
          key={option.value}
          option={option}
          selected={selectedValues.includes(option.value)}
          multiple={multiple}
          onClick={() => handleSelect(option.value)}
        />
      ))}
    </div>
  );
}