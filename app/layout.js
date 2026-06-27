import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import DomainChangePopup from './DomainChangePopup';
import Link from 'next/link';
import Footer from './Footer';

export const metadata = {
  title: 'TBH Scanner | Taskbar Hero Inventory & Market Price',
  description: 'Instantly scan your Taskbar Hero inventory and calculate live Steam Market prices. / 1クリックでインベントリ画像をスキャンし、Steamマーケットの最新相場（最安値・買い注文）を自動計算・一括表示するツールです。',
  icons: {
    icon: '/icon.jpg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4038227290670508"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <DomainChangePopup />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
