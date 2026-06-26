import React from 'react';
import Link from 'next/link';
import { commonTrans, termsTrans, getT } from '../../lib/legalTranslations';

export function generateStaticParams() {
  const languages = ['en-US', 'ja-JP', 'zh-Hans', 'zh-Hant', 'ko-KR', 'ru-RU', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR', 'tr-TR', 'vi-VN', 'id-ID', 'th-TH', 'pl-PL', 'uk-UA'];
  return languages.map((lang) => ({
    lang: lang,
  }));
}

export default async function Terms({ params }) {
  const { lang } = await params;
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'var(--font-family)', padding: '20px' }}>
      <header style={{ 
        maxWidth: '1200px', 
        margin: '0 auto 40px auto', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            transition: 'background 0.2s'
          }}>
            {getT(commonTrans.backToScanner, lang)}
          </Link>
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'white' }}>
            {getT(termsTrans.title, lang)}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem', color: '#e0e0e0' }}>
        <p style={{ color: '#ff9800', fontSize: '0.9rem', marginBottom: '30px' }}>
          {getT(commonTrans.syncNotice, lang)}
        </p>

        <p style={{ marginBottom: '40px' }}>
          {getT(termsTrans.intro, lang)}
        </p>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'white', borderBottom: '2px solid #2196f3', paddingBottom: '10px' }}>{getT(termsTrans.prohibitedTitle, lang)}</h2>
          <p>{getT(termsTrans.prohibitedBody, lang)}</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'white', borderBottom: '2px solid #2196f3', paddingBottom: '10px' }}>{getT(termsTrans.disclaimerTitle, lang)}</h2>
          <p>{getT(termsTrans.disclaimerBody, lang)}</p>
        </section>
      </main>
    </div>
  );
}
