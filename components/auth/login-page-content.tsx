'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
} from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  sendOtpAction,
  verifyOtpAndLogin,
} from '@/lib/actions/auth';

import { useAuth } from '@/providers/auth-provider';

type Step = 'phone' | 'otp';

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
    );
}

function normalizePhone(value: string) {
  return normalizeDigits(value)
    .replace(/\D/g, '')
    .slice(0, 11);
}

function LoginBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />
      <div className="absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full bg-primary/[0.05] blur-3xl" />

      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#202124_1px,transparent_1px),linear-gradient(to_bottom,#202124_1px,transparent_1px)] [background-size:32px_32px]" />
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
            step === 'phone'
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary/10 text-primary',
          ].join(' ')}
        >
          ۱
        </div>

        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={[
              'h-full rounded-full bg-primary transition-all duration-500',
              step === 'otp' ? 'w-full' : 'w-0',
            ].join(' ')}
          />
        </div>

        <div
          className={[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black',
            step === 'otp'
              ? 'bg-primary text-primary-foreground'
              : 'bg-slate-100 text-slate-400',
          ].join(' ')}
        >
          ۲
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
        <span
          className={
            step === 'phone'
              ? 'text-primary'
              : 'text-muted-foreground'
          }
        >
          شماره موبایل
        </span>

        <span
          className={
            step === 'otp'
              ? 'text-primary'
              : 'text-muted-foreground'
          }
        >
          کد تأیید
        </span>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold leading-6 text-red-600"
      role="alert"
    >
      {message}
    </m.div>
  );
}

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkLoginStatus } = useAuth();

  const redirectPath =
    searchParams.get('redirect') || '/shop';

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = window.setInterval(() => {
      setResendCooldown((current) =>
        Math.max(0, current - 1),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== 'otp') return;

    const timer = window.setTimeout(() => {
      otpInputRef.current?.focus();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [step]);

  const handleSendOtp = async () => {
    const normalizedPhone = normalizePhone(phone);

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError('لطفاً یک شماره موبایل معتبر وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendOtpAction(normalizedPhone);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setPhone(normalizedPhone);
      setOtp('');
      setStep('otp');
      setResendCooldown(60);
    } catch (error) {
      console.error('Send OTP error:', error);
      setError(
        'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedPhone = normalizePhone(phone);
    const normalizedOtp = normalizeDigits(otp)
      .replace(/\D/g, '')
      .slice(0, 5);

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError('شماره موبایل معتبر نیست.');
      return;
    }

    if (!/^\d{5}$/.test(normalizedOtp)) {
      setError('کد تأیید باید ۵ رقمی باشد.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtpAndLogin(
        normalizedPhone,
        normalizedOtp,
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      await checkLoginStatus();
      setSuccess(true);
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('خطا در تأیید کد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setResendCooldown(0);
  };

  const handleResend = async () => {
    if (loading || resendCooldown > 0) return;
    await handleSendOtp();
  };

  const handleOtpChange = (value: string) => {
    setOtp(
      normalizeDigits(value)
        .replace(/\D/g, '')
        .slice(0, 5),
    );
    setError('');
  };

  return (
    <LazyMotion features={domAnimation}>
      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-[#fffdf9] px-4 py-8 sm:py-14">
        <LoginBackground />

        <section
          aria-label="ورود به حساب کاربری"
          className="relative z-10 w-full max-w-[460px]"
        >
          <div className="rounded-[32px] border border-border bg-white p-5 shadow-[0_20px_70px_rgba(30,20,10,0.08)] sm:p-8">
            <div className="mb-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary text-primary-foreground shadow-lg shadow-primary/10">
                {step === 'phone' ? (
                  <Phone className="h-7 w-7" />
                ) : (
                  <ShieldCheck className="h-7 w-7" />
                )}
              </div>

              <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {step === 'phone'
                  ? 'ورود به رژیتامین'
                  : 'کد تأیید را وارد کنید'}
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted-foreground sm:text-sm">
                {step === 'phone'
                  ? 'برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.'
                  : `کد تأیید به شماره ${phone} ارسال شده است.`}
              </p>
            </div>

            <Progress step={step} />

            <AnimatePresence mode="wait" initial={false}>
              {step === 'phone' ? (
                <m.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-xs font-bold text-slate-700"
                    >
                      شماره موبایل
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(
                            normalizePhone(
                              event.target.value,
                            ),
                          );
                          setError('');
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' &&
                            !loading
                          ) {
                            void handleSendOtp();
                          }
                        }}
                        maxLength={11}
                        placeholder="09123456789"
                        dir="ltr"
                        className="h-13 rounded-2xl border-border bg-slate-50 pr-11 text-sm transition focus:bg-white focus:ring-4 focus:ring-primary/10"
                      />
                    </div>

                    <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                      کد تأیید از طریق پیامک برای شما ارسال خواهد شد.
                    </p>
                  </div>

                  <ErrorMessage message={error} />

                  <Button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={loading}
                    className="h-13 w-full gap-2 rounded-2xl text-sm font-black shadow-lg shadow-primary/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        دریافت کد تأیید
                        <ArrowLeft className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    ورود امن با شماره موبایل
                  </div>
                </m.div>
              ) : (
                <m.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between rounded-2xl bg-primary/[0.045] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Phone className="h-4 w-4" />
                      </div>

                      <div>
                        <span className="block text-[10px] text-muted-foreground">
                          شماره موبایل
                        </span>

                        <strong
                          dir="ltr"
                          className="mt-0.5 block text-xs font-black text-slate-800"
                        >
                          {phone}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleEditPhone}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      ویرایش
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-xs font-bold text-slate-700"
                    >
                      کد ۵ رقمی
                    </label>

                    <Input
                      ref={otpInputRef}
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(event) =>
                        handleOtpChange(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          !loading
                        ) {
                          void handleVerifyOtp();
                        }
                      }}
                      maxLength={5}
                      placeholder="-----"
                      dir="ltr"
                      className="h-15 rounded-2xl border-border bg-slate-50 text-center text-2xl font-black tracking-[0.65em] transition focus:bg-white focus:ring-4 focus:ring-primary/10"
                    />

                    <p className="mt-2 text-center text-[10px] text-muted-foreground">
                      کد ارسال‌شده را وارد کنید.
                    </p>
                  </div>

                  <ErrorMessage message={error} />

                  <Button
                    type="button"
                    onClick={() => void handleVerifyOtp()}
                    disabled={loading}
                    className="h-13 w-full gap-2 rounded-2xl text-sm font-black shadow-lg shadow-primary/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        در حال بررسی...
                      </>
                    ) : (
                      <>
                        تأیید و ورود
                        <Check className="h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    {resendCooldown > 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        ارسال مجدد کد تا{' '}
                        <span className="font-black text-slate-800">
                          {resendCooldown.toLocaleString('fa-IR')}
                        </span>{' '}
                        ثانیه دیگر
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleResend()}
                        disabled={loading}
                        className="text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    تغییر شماره موبایل
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            <div className="mt-7 border-t border-border pt-5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[9px] leading-5 text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-primary" />
                اطلاعات شما امن نگهداری می‌شود.
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-[9px] font-bold text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              رژیتامین
            </span>
          </div>
        </section>

        <AnimatePresence>
          {success && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            >
              <m.div
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-sm rounded-[30px] border border-white/50 bg-white p-7 text-center shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                  <Check className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-900">
                  ورود موفق بود
                </h2>

                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {phone} عزیز، خوش آمدید.
                </p>

                <p className="mt-1 text-[10px] leading-5 text-muted-foreground">
                  برای ادامه روی دکمه زیر بزنید.
                </p>

                <Button
                  type="button"
                  onClick={() => router.push(redirectPath)}
                  className="mt-6 h-12 w-full rounded-xl font-bold"
                >
                  ادامه
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </main>
    </LazyMotion>
  );
}