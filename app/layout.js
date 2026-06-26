import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import DomainChangePopup from './DomainChangePopup';
import Link from 'next/link';

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
        <footer style={{
          textAlign: 'center',
          padding: '20px',
          marginTop: '40px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px 20px', marginBottom: '15px' }}>
            <Link href="/" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Home</Link>
            <Link href="/about" style={{ color: '#4fc3f7', textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ color: '#4fc3f7', textDecoration: 'none' }}>FAQ</Link>
            <Link href="/terms" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Privacy Policy</Link>
            <a href="https://x.com/tbh_scanner" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Contact (X)</a>
          </div>
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} TBH Scanner. Not affiliated with Steam or Valve.</p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
