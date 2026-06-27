import Link from 'next/link';
import { tipsTrans } from '../../lib/tipsTranslations';

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', color: '#e0e0e0', lineHeight: '1.6' }}>
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
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
          <p style={{ fontSize: '1rem', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
            {t.s1_text1[lang] || t.s1_text1['en-US']}
          </p>
          <p style={{ fontSize: '1rem', marginBottom: '15px', color: '#ffb74d', whiteSpace: 'pre-wrap' }}>
            {t.s1_text2[lang] || t.s1_text2['en-US']}
          </p>
          
          <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <img src="/images/tips_manual_add.png" alt="Search and Add Example" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
          </div>

          <p style={{ fontSize: '1rem', marginBottom: '15px', color: '#ffb74d', whiteSpace: 'pre-wrap' }}>
            {t.s1_text3[lang] || t.s1_text3['en-US']}
          </p>
          
          <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <img src="/images/tips_sort_price.png" alt="Sort by Price Example" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
          </div>

          <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {t.s1_text4[lang] || t.s1_text4['en-US']}
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#4fc3f7', marginBottom: '15px' }}>
          {t.s2_title[lang] || t.s2_title['en-US']}
        </h2>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
          <p style={{ fontSize: '1rem', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
            {t.s2_text1[lang] || t.s2_text1['en-US']}
          </p>
          <p style={{ fontSize: '1rem', marginBottom: '15px', color: '#ffb74d', whiteSpace: 'pre-wrap' }}>
            {t.s2_text2[lang] || t.s2_text2['en-US']}
          </p>
          
          <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <img src="/images/tips_autoscroll_1.png" alt="Auto-scroll Example 1" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
          </div>

          <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <img src="/images/tips_autoscroll_2.png" alt="Auto-scroll Example 2" style={{ maxWidth: '100%', height: 'auto', display: 'inline-block' }} />
          </div>
        </div>
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
