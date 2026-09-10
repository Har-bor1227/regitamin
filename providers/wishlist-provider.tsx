'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface WishlistContextType {
  items: number[]; // آرایه‌ای از product id‌ها
  addItem: (id: number) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
  totalItems: 0,
});

function loadLocalWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('dot_wishlist');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalWishlist(ids: number[]) {
  localStorage.setItem('dot_wishlist', JSON.stringify(ids));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { isLoggedIn, phone } = useAuth();

  // بارگذاری اولیه از localStorage
  useEffect(() => {
    setItems(loadLocalWishlist());
    setIsHydrated(true);
  }, []);

  // هنگام ورود → دریافت Wishlist از سرور
  useEffect(() => {
    if (!isHydrated) return;
    if (isLoggedIn && phone) {
      fetch('/api/wishlist', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.wishlist && Array.isArray(data.wishlist)) {
            setItems(data.wishlist);
            saveLocalWishlist(data.wishlist);
          }
        })
        .catch(console.error);
    }
  }, [isLoggedIn, phone, isHydrated]);

  // ارسال تغییرات به سرور (با debounce)
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !phone) return;

    const timer = setTimeout(() => {
      fetch('/api/wishlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: items }),
      }).catch(console.error);
    }, 500);

    return () => clearTimeout(timer);
  }, [items, isLoggedIn, phone, isHydrated]);

  const addItem = useCallback((id: number) => {
    setItems((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      saveLocalWishlist(updated);
      toast.success('به علاقه‌مندی‌ها اضافه شد.');
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item !== id);
      saveLocalWishlist(updated);
      toast('از علاقه‌مندی‌ها حذف شد.');
      return updated;
    });
  }, []);

  const isInWishlist = useCallback(
    (id: number) => items.includes(id),
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
    saveLocalWishlist([]);
  }, []);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isInWishlist, clearWishlist, totalItems }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);