import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'نام باید حداقل ۲ حرف باشد')
    .max(50, 'نام نمی‌تواند بیشتر از ۵۰ حرف باشد'),
  email: z
    .string()
    .email('لطفاً یک ایمیل معتبر وارد کنید'),
  subject: z
    .string()
    .min(5, 'موضوع باید حداقل ۵ حرف باشد')
    .max(100, 'موضوع نمی‌تواند بیشتر از ۱۰۰ حرف باشد'),
  message: z
    .string()
    .min(10, 'پیام باید حداقل ۱۰ حرف باشد')
    .max(5000, 'پیام نمی‌تواند بیشتر از ۵۰۰۰ حرف باشد'),
  // فیلد مخفی Honeypot (بعداً در فرم اضافه می‌شود، ولی نیاز به اعتبارسنجی ندارد)
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;