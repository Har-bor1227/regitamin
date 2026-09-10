import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نتیجه پرداخت | رژیتامین',
  description: 'نتیجه تراکنش پرداخت',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}