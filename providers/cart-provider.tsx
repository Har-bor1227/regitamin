
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
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalPrice: 0,
  totalItems: 0,
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

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items),
  );
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

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    isLoggedIn,
    phone,
  } = useAuth();

  useEffect(() => {
    setItems(loadLocalCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isLoggedIn && phone) {
      fetch('/api/cart', {
        credentials: 'include',
        cache: 'no-store',
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.cart)) {
            setItems(data.cart);
            saveLocalCart(data.cart);
          }
        })
        .catch(console.error);
    }
  }, [
    isLoggedIn,
    phone,
    isHydrated,
  ]);

  useEffect(() => {
    if (
      !isHydrated ||
      !isLoggedIn ||
      !phone
    ) {
      return;
    }

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items,
        }),
      }).catch(console.error);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [
    items,
    isLoggedIn,
    phone,
    isHydrated,
  ]);

  const addItem = useCallback(
    (newItem: CartItem) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
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
              updated[existingIndex].quantity +
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
        const updated = prev.filter(
          (item) =>
            !(
              item.id === id &&
              item.variationId === variationId
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
      variationId: number | undefined,
      quantity: number,
    ) => {
      setItems((prev) => {
        const updated = prev.map(
          (item) =>
            item.id === id &&
            item.variationId === variationId
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

    if (
      isLoggedIn &&
      phone
    ) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: [],
        }),
      }).catch(console.error);
    }
  }, [
    isLoggedIn,
    phone,
  ]);

  const totalPrice =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          item.quantity,
      0,
    );

  const totalItems =
    items.reduce(
      (sum, item) =>
        sum +
        item.quantity,
      0,
    );

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () =>
  useContext(CartContext);

