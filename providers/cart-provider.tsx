'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

import { useAuth } from '@/providers/auth-provider';

import type { CartItem } from '@/types/cart';

interface CartContextType {
  items: CartItem[];

  addItem: (item: CartItem) => void;

  removeItem: (
    id: number,
    variationId?: number,
  ) => void;

  updateQuantity: (
    id: number,
    variationId: number | undefined,
    quantity: number,
  ) => void;

  clearCart: () => void;

  totalPrice: number;

  totalItems: number;

  isHydrated: boolean;

  isServerSynced: boolean;

  isReady: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalPrice: 0,
  totalItems: 0,
  isHydrated: false,
  isServerSynced: false,
  isReady: false,
});

const STORAGE_KEY = 'regitamin_cart';
const LEGACY_STORAGE_KEY = 'dot_cart';

function loadLocalCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const current = localStorage.getItem(STORAGE_KEY);

    if (current) {
      const parsed = JSON.parse(current);

      return Array.isArray(parsed) ? parsed : [];
    }

    const legacy = localStorage.getItem(
      LEGACY_STORAGE_KEY,
    );

    if (legacy) {
      const parsed = JSON.parse(legacy);

      if (Array.isArray(parsed)) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(parsed),
        );

        localStorage.removeItem(
          LEGACY_STORAGE_KEY,
        );

        return parsed;
      }
    }

    return [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Ignore localStorage errors.
  }
}

function getCartItemKey(item: CartItem) {
  return `${item.id}:${item.variationId ?? 0}`;
}

function isSameCartItem(
  first: CartItem,
  second: CartItem,
) {
  return (
    first.id === second.id &&
    first.variationId === second.variationId
  );
}

function areCartItemsEqual(
  first: CartItem[],
  second: CartItem[],
) {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((item, index) => {
    const other = second[index];

    return (
      getCartItemKey(item) ===
        getCartItemKey(other) &&
      item.quantity === other.quantity
    );
  });
}

function mergeCartItems(
  localItems: CartItem[],
  serverItems: CartItem[],
) {
  /*
   * Rule:
   *
   * 1. اگر سبد سرور خالی باشد،
   *    سبد محلی را حفظ می‌کنیم.
   *
   * 2. اگر سبد سرور خالی نباشد،
   *    سبد سرور منبع اصلی است.
   *
   * این کار مهم است چون وقتی کاربر به‌صورت مهمان
   * خرید کرده و سپس وارد حساب می‌شود، یک cart خالی
   * سمت سرور نباید cart محلی را نابود کند.
   */

  if (serverItems.length === 0) {
    return localItems;
  }

  return serverItems;
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] =
    useState(false);

  const [isServerSynced, setIsServerSynced] =
    useState(false);

  const isSyncingServerCartRef =
    useRef(false);

  const {
    isLoggedIn,
    phone,
  } = useAuth();

  /*
   * مرحله اول:
   * سبد محلی را فقط یک بار بعد از mount بخوان.
   */
  useEffect(() => {
    const localCart = loadLocalCart();

    setItems(localCart);
    setIsHydrated(true);
  }, []);

  /*
   * مرحله دوم:
   * بعد از آماده شدن local cart و مشخص شدن وضعیت auth،
   * cart سرور را sync می‌کنیم.
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isLoggedIn || !phone) {
      setIsServerSynced(true);
      return;
    }

    let cancelled = false;

    async function syncServerCart() {
      isSyncingServerCartRef.current = true;
      setIsServerSynced(false);

      try {
        const localCart = loadLocalCart();

        const response = await fetch(
          '/api/cart',
          {
            credentials: 'include',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load server cart.',
          );
        }

        const data =
          (await response.json()) as {
            cart?: CartItem[];
          };

        if (
          cancelled ||
          !Array.isArray(data.cart)
        ) {
          return;
        }

        const serverCart = data.cart;

        /*
         * اگر سرور خالی بود، local cart را نگه می‌داریم.
         * اگر سرور cart داشت، همان cart منبع اصلی است.
         */
        const resolvedCart =
          mergeCartItems(
            localCart,
            serverCart,
          );

        setItems(resolvedCart);
        saveLocalCart(resolvedCart);

        /*
         * اگر cart نهایی با cart سرور متفاوت است،
         * آن را روی سرور هم ذخیره کن.
         *
         * این قسمت مهم است برای حالتی که:
         * guest cart → login → server cart empty
         */
        if (
          !areCartItemsEqual(
            resolvedCart,
            serverCart,
          )
        ) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              items: resolvedCart,
            }),
          });
        }
      } catch (error) {
        console.error(
          'Cart server sync error:',
          error,
        );
      } finally {
        if (!cancelled) {
          isSyncingServerCartRef.current =
            false;

          setIsServerSynced(true);
        }
      }
    }

    void syncServerCart();

    return () => {
      cancelled = true;
      isSyncingServerCartRef.current =
        false;
    };
  }, [
    isHydrated,
    isLoggedIn,
    phone,
  ]);

  /*
   * هر تغییر بعدی در سبد کاربر لاگین‌شده
   * با تاخیر کوتاه روی سرور ذخیره می‌شود.
   *
   * در زمان sync اولیه عمداً اجرا نمی‌شود تا
   * GET و PUT با هم race نکنند.
   */
  useEffect(() => {
    if (
      !isHydrated ||
      !isLoggedIn ||
      !phone ||
      !isServerSynced ||
      isSyncingServerCartRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items,
        }),
      }).catch((error) => {
        console.error(
          'Cart save error:',
          error,
        );
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    items,
    isLoggedIn,
    phone,
    isHydrated,
    isServerSynced,
  ]);

  const addItem = useCallback(
    (newItem: CartItem) => {
      setItems((prev) => {
        const existingIndex =
          prev.findIndex((item) =>
            isSameCartItem(
              item,
              newItem,
            ),
          );

        let updated: CartItem[];

        if (existingIndex !== -1) {
          updated = [...prev];

          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity:
              updated[existingIndex]
                .quantity +
              newItem.quantity,
          };
        } else {
          updated = [
            ...prev,
            newItem,
          ];
        }

        saveLocalCart(updated);

        return updated;
      });
    },
    [],
  );

  const removeItem = useCallback(
    (
      id: number,
      variationId?: number,
    ) => {
      setItems((prev) => {
        const updated =
          prev.filter(
            (item) =>
              !(
                item.id === id &&
                item.variationId ===
                  variationId
              ),
          );

        saveLocalCart(updated);

        return updated;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (
      id: number,
      variationId:
        | number
        | undefined,
      quantity: number,
    ) => {
      setItems((prev) => {
        const updated = prev.map(
          (item) =>
            item.id === id &&
            item.variationId ===
              variationId
              ? {
                  ...item,
                  quantity: Math.max(
                    1,
                    quantity,
                  ),
                }
              : item,
        );

        saveLocalCart(updated);

        return updated;
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    saveLocalCart([]);

    if (isLoggedIn && phone) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: [],
        }),
      }).catch((error) => {
        console.error(
          'Clear server cart error:',
          error,
        );
      });
    }
  }, [
    isLoggedIn,
    phone,
  ]);

  const totalPrice =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          item.quantity,
      0,
    );

  const totalItems =
    items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

  const isReady =
    isHydrated &&
    (!isLoggedIn || isServerSynced);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isHydrated,
        isServerSynced,
        isReady,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () =>
  useContext(CartContext);