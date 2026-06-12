import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Taskbar Hero Market Scanner',
  description: 'Instantly scan your inventory and see live market prices.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
