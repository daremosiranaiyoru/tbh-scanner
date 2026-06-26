import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import DomainChangePopup from './DomainChangePopup';

export const metadata = {
  title: 'TBH Scanner | Taskbar Hero Inventory & Market Price',
  description: 'Instantly scan your Taskbar Hero inventory and calculate live Steam Market prices. / 1クリックでインベントリ画像をスキャンし、Steamマーケットの最新相場（最安値・買い注文）を自動計算・一括表示するツールです。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
      </head>
      <body>
        <DomainChangePopup />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
