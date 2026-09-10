'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  logout as serverLogout,
} from '@/lib/actions/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  phone: string | null;
  customerId: number | null;
  loading: boolean;
  checkLoginStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType>({
    isLoggedIn: false,
    phone: null,
    customerId: null,
    loading: true,
    checkLoginStatus:
      async () => {},
    logout:
      async () => {},
  });

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [phone, setPhone] =
    useState<string | null>(
      null,
    );

  const [
    customerId,
    setCustomerId,
  ] =
    useState<number | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const router =
    useRouter();

  const checkLoginStatus =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const response =
            await fetch(
              '/api/user/profile',
              {
                credentials:
                  'include',
                cache:
                  'no-store',
              },
            );

          if (
            !response.ok
          ) {
            setIsLoggedIn(
              false,
            );
            setPhone(null);
            setCustomerId(
              null,
            );

            return;
          }

          const data =
            await response.json();

          setIsLoggedIn(
            data.authenticated ===
              true,
          );

          setPhone(
            data.phone ||
              null,
          );

          setCustomerId(
            data.customerId
              ? Number(
                  data.customerId,
                )
              : null,
          );
        } catch {
          setIsLoggedIn(
            false,
          );
          setPhone(null);
          setCustomerId(
            null,
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [],
    );

  const logout =
    useCallback(
      async () => {
        await serverLogout();

        setIsLoggedIn(
          false,
        );

        setPhone(null);

        setCustomerId(
          null,
        );

        router.push('/');
      },
      [router],
    );

  useEffect(() => {
    checkLoginStatus();
  }, [
    checkLoginStatus,
  ]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        phone,
        customerId,
        loading,
        checkLoginStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () =>
    useContext(
      AuthContext,
    );