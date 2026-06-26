'use client';
import { useState, useEffect } from 'react';

export default function DomainChangePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en-US');

  useEffect(() => {
    // Check query params manually to avoid Suspense issues with useSearchParams
    const params = new URLSearchParams(window.location.search);
    if (params.get('redirected') === 'true') {
      setIsOpen(true);
    }
    const savedLang = localStorage.getItem('preferredLang');
    if (savedLang) setLang(savedLang);
    
    // Also listen for language changes from other parts of the app if needed
    // But realistically it reads once on load which is fine.
  }, []);

  if (!isOpen) return null;

  const translations = {
    title: {
      'en-US': 'Notice: Domain Changed!',
      'ja-JP': 'お知らせ：URLが新しくなりました！',
      'zh-Hans': '通知：域名已更改！',
      'zh-Hant': '通知：網域已變更！',
      'ko-KR': '알림: 도메인이 변경되었습니다!',
      'ru-RU': 'Внимание: Домен изменен!',
      'es-ES': 'Aviso: ¡Dominio cambiado!',
      'fr-FR': 'Avis : Domaine changé !',
      'de-DE': 'Hinweis: Domain geändert!',
      'pt-BR': 'Aviso: Domínio alterado!',
      'tr-TR': 'Bildirim: Alan Adı Değişti!',
      'vi-VN': 'Thông báo: Tên miền đã thay đổi!',
      'id-ID': 'Pemberitahuan: Domain Berubah!',
      'th-TH': 'ประกาศ: เปลี่ยนโดเมนแล้ว!',
      'pl-PL': 'Uwaga: Domena zmieniona!',
      'uk-UA': 'Увага: Домен змінено!'
    },
    message: {
      'en-US': 'We have moved to a new domain (tbh-scanner.com). Please update your bookmarks to the new URL! If you access the new URL directly, this message will no longer appear.',
      'ja-JP': '当サイトは新しい独自ドメイン（tbh-scanner.com）に移行しました。お手数ですが、ブックマークを新しいURLへ変更をお願いいたします！新しいURLから直接アクセスした場合は、このポップアップは表示されなくなります。',
      'zh-Hans': '我们已迁移至新域名（tbh-scanner.com）。请将您的书签更新为新URL！如果您直接访问新URL，此消息将不再显示。',
      'zh-Hant': '我們已遷移至新網域（tbh-scanner.com）。請將您的書籤更新為新URL！如果您直接訪問新URL，此訊息將不再顯示。',
      'ko-KR': '새로운 도메인(tbh-scanner.com)으로 이전했습니다. 북마크를 새 URL로 업데이트해 주세요! 새 URL로 직접 접속하시면 이 메시지는 더 이상 나타나지 않습니다.',
      'ru-RU': 'Мы переехали на новый домен (tbh-scanner.com). Пожалуйста, обновите ваши закладки на новый URL! Если вы зайдете по новому URL напрямую, это сообщение больше не появится.',
      'es-ES': 'Nos hemos mudado a un nuevo dominio (tbh-scanner.com). ¡Por favor, actualiza tus marcadores a la nueva URL! Si accedes a la nueva URL directamente, este mensaje ya no aparecerá.',
      'fr-FR': 'Nous avons déménagé vers un nouveau domaine (tbh-scanner.com). Veuillez mettre à jour vos signets vers la nouvelle URL ! Si vous accédez directement à la nouvelle URL, ce message n\'apparaîtra plus.',
      'de-DE': 'Wir sind auf eine neue Domain umgezogen (tbh-scanner.com). Bitte aktualisieren Sie Ihre Lesezeichen auf die neue URL! Wenn Sie direkt auf die neue URL zugreifen, wird diese Nachricht nicht mehr angezeigt.',
      'pt-BR': 'Mudamos para um novo domínio (tbh-scanner.com). Por favor, atualize seus favoritos para a nova URL! Se você acessar a nova URL diretamente, esta mensagem não aparecerá mais.',
      'tr-TR': 'Yeni bir alan adına (tbh-scanner.com) taşındık. Lütfen yer işaretlerinizi yeni URL ile güncelleyin! Yeni URL\'ye doğrudan erişirseniz, bu mesaj artık görünmeyecektir.',
      'vi-VN': 'Chúng tôi đã chuyển sang một tên miền mới (tbh-scanner.com). Vui lòng cập nhật dấu trang của bạn sang URL mới! Nếu bạn truy cập trực tiếp vào URL mới, thông báo này sẽ không còn xuất hiện.',
      'id-ID': 'Kami telah pindah ke domain baru (tbh-scanner.com). Harap perbarui bookmark Anda ke URL baru! Jika Anda mengakses URL baru secara langsung, pesan ini tidak akan muncul lagi.',
      'th-TH': 'เราได้ย้ายไปยังโดเมนใหม่แล้ว (tbh-scanner.com) โปรดอัปเดตบุ๊กมาร์กของคุณเป็น URL ใหม่! หากคุณเข้าถึง URL ใหม่โดยตรง ข้อความนี้จะไม่ปรากฏอีกต่อไป',
      'pl-PL': 'Przenieśliśmy się na nową domenę (tbh-scanner.com). Proszę zaktualizować swoje zakładki do nowego adresu URL! Jeśli uzyskasz bezpośredni dostęp do nowego adresu URL, ta wiadomość nie będzie się już pojawiać.',
      'uk-UA': 'Ми переїхали на новий домен (tbh-scanner.com). Будь ласка, оновіть ваші закладки на новий URL! Якщо ви зайдете за новим URL безпосередньо, це повідомлення більше не з\'явиться.'
    },
    button: {
      'en-US': 'Got it!',
      'ja-JP': '確認しました',
      'zh-Hans': '知道了！',
      'zh-Hant': '知道了！',
      'ko-KR': '확인했습니다!',
      'ru-RU': 'Понятно!',
      'es-ES': '¡Entendido!',
      'fr-FR': 'Compris !',
      'de-DE': 'Verstanden!',
      'pt-BR': 'Entendi!',
      'tr-TR': 'Anladım!',
      'vi-VN': 'Đã hiểu!',
      'id-ID': 'Mengerti!',
      'th-TH': 'เข้าใจแล้ว!',
      'pl-PL': 'Zrozumiałem!',
      'uk-UA': 'Зрозуміло!'
    }
  };

  const tTitle = translations.title[lang] || translations.title['en-US'];
  const tMessage = translations.message[lang] || translations.message['en-US'];
  const tButton = translations.button[lang] || translations.button['en-US'];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #1e222b, #15181e)',
        border: '1px solid #ff9800',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(255, 152, 0, 0.2)',
        textAlign: 'center',
        color: 'white',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📢</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#ffcc80', fontWeight: 'bold' }}>
          {tTitle}
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px', color: '#e0e0e0' }}>
          {tMessage.split('tbh-scanner.com').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <a 
                  href="https://tbh-scanner.com/" 
                  style={{ color: '#4fc3f7', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  https://tbh-scanner.com/
                </a>
              )}
            </span>
          ))}
        </p>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            background: '#ff9800',
            color: '#121212',
            border: 'none',
            padding: '12px 32px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.1s, background 0.2s',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#ffb74d'}
          onMouseOut={e => e.currentTarget.style.background = '#ff9800'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tButton}
        </button>
      </div>
    </div>
  );
}
