'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 700);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
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
  );
}