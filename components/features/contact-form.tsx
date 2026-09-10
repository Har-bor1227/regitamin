'use client';

import { useActionState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { contactFormSchema, type ContactFormValues } from '@/lib/validations/contact';
import { submitContactForm, type ContactFormState } from '@/lib/actions/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState: ContactFormState = {
  success: false,
  message: '',
  errors: undefined,
};

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // پاک کردن فرم بعد از ارسال موفق
  if (state.success && form.formState.isSubmitSuccessful) {
    form.reset();
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* اعلان موفقیت/خطا */}
      {state.message && (
        <Alert
          variant={state.success ? 'default' : 'destructive'}
          className={`mb-6 ${
            state.success
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
              : ''
          }`}
        >
          {state.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <AlertDescription className="mr-2">{state.message}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(e) => {
            // فقط در صورت اعتبارسنجی موفق، فرم submit شود
            form.handleSubmit(() => {
              e.currentTarget.submit();
            })(e);
          }}
          className="space-y-6"
        >
          {/* Honeypot - فیلد مخفی ضد اسپم */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
            <Input name="honeypot" tabIndex={-1} autoComplete="off" />
          </div>

          {/* نام */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام و نام خانوادگی</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="نام خود را وارد کنید"
                    disabled={isPending}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ایمیل */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    disabled={isPending}
                    className="h-12 text-base"
                    dir="ltr"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* موضوع */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موضوع</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="موضوع پیام خود را بنویسید"
                    disabled={isPending}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* پیام */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>پیام</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="پیام خود را اینجا بنویسید..."
                    disabled={isPending}
                    className="min-h-[150px] text-base resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* دکمه ارسال */}
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="w-full h-12 text-base gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال ارسال...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                ارسال پیام
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}