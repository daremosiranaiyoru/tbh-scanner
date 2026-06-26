'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [lang, setLang] = useState('en-US');

  useEffect(() => {
    const saved = localStorage.getItem('preferredLang');
    if (saved) {
      setLang(saved);
    } else {
      // Default to Japanese if no setting found (since the site is primarily JP for now)
      setLang('ja-JP');
    }

    const handleLangChange = (e) => {
      setLang(e.detail);
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  return (
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
        <Link href={`/about/${lang}`} style={{ color: '#4fc3f7', textDecoration: 'none' }}>About</Link>
        <Link href={`/faq/${lang}`} style={{ color: '#4fc3f7', textDecoration: 'none' }}>FAQ</Link>
        <Link href={`/terms/${lang}`} style={{ color: '#4fc3f7', textDecoration: 'none' }}>Terms of Service</Link>
        <Link href={`/privacy/${lang}`} style={{ color: '#4fc3f7', textDecoration: 'none' }}>Privacy Policy</Link>
        <a href="https://x.com/tbh_scanner" target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Contact (X)</a>
      </div>
      <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} TBH Scanner. Not affiliated with Steam or Valve.</p>
    </footer>
  );
}
