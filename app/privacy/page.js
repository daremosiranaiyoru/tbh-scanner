'use client';
import { useEffect } from 'react';

export default function PrivacyRedirect() {
  useEffect(() => {
    const saved = localStorage.getItem('preferredLang') || 'en-US';
    window.location.replace(`/privacy/${saved}`);
  }, []);

  return <div style={{ padding: '20px', color: 'white', fontFamily: 'var(--font-family)' }}>Redirecting...</div>;
}
