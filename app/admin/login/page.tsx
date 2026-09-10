'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LockKeyhole,
  Loader2,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!password || loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'ورود انجام نشد.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-72px)] bg-[#fffdf9] px-4 py-10 sm:py-14"
    >
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-[30px] border border-border bg-white p-6 shadow-[0_20px_70px_rgba(30,20,10,0.08)] sm:p-8">
          <div className="mx-auto flex h-15 w-15 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-lg shadow-primary/10">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <div className="mt-5 text-center">
            <span className="text-xs font-bold text-primary">
              مدیریت رژیتامین
            </span>

            <h1 className="mt-2 text-2xl font-black text-slate-900">
              ورود به پنل مدیریت
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              برای ورود، رمز عبور پنل مدیریت را وارد کنید.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                رمز عبور
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                autoComplete="current-password"
                placeholder="رمز پنل"
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-input bg-slate-50 px-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold leading-6 text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود به پنل
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}