import Link from 'next/link';
import { tipsTrans } from '../../lib/tipsTranslations';

export const runtime = 'edge';

export function generateStaticParams() {
  return [
    { lang: 'en-US' },
    { lang: 'ja-JP' },
    { lang: 'zh-Hans' },
    { lang: 'zh-Hant' },
    { lang: 'ko-KR' },
    { lang: 'ru-RU' },
    { lang: 'es-ES' },
    { lang: 'fr-FR' },
    { lang: 'de-DE' },
    { lang: 'pt-BR' },
    { lang: 'tr-TR' },
    { lang: 'vi-VN' },
    { lang: 'id-ID' },
    { lang: 'th-TH' },
    { lang: 'pl-PL' },
    { lang: 'uk-UA' }
  ];
}

export default async function TipsPage({ params }) {
  const { lang } = await params;
  const t = tipsTrans;
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#e0e0e0', lineHeight: '1.6' }}>
      <Link href="/" style={{ color: '#4fc3f7', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        &larr; Back
      </Link>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
        {t.title[lang] || t.title['en-US']}
      </h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#4fc3f7', marginBottom: '15px' }}>
          {t.s1_title[lang] || t.s1_title['en-US']}
        </h2>
        <p style={{ fontSize: '1rem', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
          {t.s1_text[lang] || t.s1_text['en-US']}
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#4fc3f7', marginBottom: '15px' }}>
          {t.s2_title[lang] || t.s2_title['en-US']}
        </h2>
        <p style={{ fontSize: '1rem', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
          {t.s2_text[lang] || t.s2_text['en-US']}
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#4fc3f7', marginBottom: '15px' }}>
          {t.s3_title[lang] || t.s3_title['en-US']}
        </h2>
        <p style={{ fontSize: '1rem', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
          {t.s3_text[lang] || t.s3_text['en-US']}
        </p>
      </section>
      
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#1976d2',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          Back to Scanner
        </Link>
      </div>
    </div>
  );
}
