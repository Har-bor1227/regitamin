'use server';

import { contactFormSchema } from '@/lib/validations/contact';
import type { ContactFormValues } from '@/lib/validations/contact';

export type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // 1. استخراج فیلدها از FormData
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
    honeypot: formData.get('honeypot') as string,
  };

  // 2. Honeypot check (ضد اسپم ساده)
  if (rawData.honeypot) {
    // اگر ربات این فیلد را پر کرده باشد، وانمود می‌کنیم موفق بوده
    return { success: true, message: 'پیام شما با موفقیت ارسال شد.' };
  }

  // 3. اعتبارسنجی با Zod
  const validation = contactFormSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: 'لطفاً خطاهای فرم را اصلاح کنید.',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  // 4. پردازش اصلی (ارسال ایمیل، ذخیره در CRM و غیره)
  try {
    // TODO: اینجا سرویس ایمیل (مثلاً Resend, Nodemailer) یا ذخیره در وردپرس را صدا بزنید
    console.log('📩 Contact form submitted:', validation.data);

    // شبیه‌سازی تأخیر برای حس واقعی‌تر (در production حذف شود)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم.',
    };
  } catch (error) {
    console.error('❌ Contact form error:', error);
    return {
      success: false,
      message: 'خطایی در ارسال پیام رخ داد. لطفاً دوباره تلاش کنید.',
    };
  }
}