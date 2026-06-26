'use client';
import { useEffect } from 'react';

export default function FAQRedirect() {
  useEffect(() => {
    const saved = localStorage.getItem('preferredLang') || 'en-US';
    window.location.replace(`/faq/${saved}`);
  }, []);

  return <div style={{ padding: '20px', color: 'white', fontFamily: 'var(--font-family)' }}>Redirecting...</div>;
}
