import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'KPL 猜猜看｜职业选手推理游戏',
  description: '八次机会，根据战队、身份、分路与生涯标签猜出隐藏的 KPL 职业选手。',
  openGraph: {
    title: 'KPL 猜猜看｜职业选手推理游戏',
    description: '八次机会，锁定聚光灯下的 KPL 职业选手。',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'KPL 猜猜看' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KPL 猜猜看｜职业选手推理游戏',
    description: '八次机会，锁定聚光灯下的 KPL 职业选手。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
