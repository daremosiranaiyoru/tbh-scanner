'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { loadDatabase, scanIcons } from '../lib/ocr-engine';
import itemNames from '../public/item_names.json';

const langToCurrency = {
  'en-US': { code: 'USD' },
  'ja-JP': { code: 'JPY' },
  'zh-Hans': { code: 'CNY' },
  'zh-Hant': { code: 'TWD' },
  'ko-KR': { code: 'KRW' },
  'ru-RU': { code: 'RUB' },
  'es-ES': { code: 'EUR' },
  'fr-FR': { code: 'EUR' },
  'de-DE': { code: 'EUR' },
  'pt-BR': { code: 'BRL' },
  'tr-TR': { code: 'TRY' },
  'vi-VN': { code: 'VND' },
};

export default function ScannerApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [prices, setPrices] = useState(null);
  const [rates, setRates] = useState(null);
  const [selectedLang, setSelectedLang] = useState('ja-JP');
  const [toastMessage, setToastMessage] = useState('');
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAdminSecret, setIsAdminSecret] = useState(null);
  
  // Editing states
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editSearchText, setEditSearchText] = useState('');
  const [editSelectedKey, setEditSelectedKey] = useState('');
  const [editRarity, setEditRarity] = useState('UNKNOWN');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);

  useEffect(() => {
    // Load admin secret if available
    if (typeof window !== 'undefined') {
      setIsAdminSecret(localStorage.getItem('adminSecret'));
    }

    // Wait for window.cv to be available, then load database
    const checkCv = setInterval(() => {
      if (window.cv && window.cv.Mat) {
        clearInterval(checkCv);
        loadDatabase().then(() => {
          window.isDatabaseLoaded = true;
          setIsEngineReady(true);
        });
      }
    }, 100);
    
    // Fetch initial comments
    fetchComments();
    
    // Pre-fetch prices so they are instantly ready when scanning
    fetchPrices();
    
    return () => clearInterval(checkCv);
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error("Failed to fetch comments", e);
    }
  };



  const submitComment = async (e) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || isSubmittingComment) return;
    
    // Hidden admin login
    if (text.startsWith('/admin ')) {
      const secret = text.split(' ')[1];
      if (secret) {
        localStorage.setItem('adminSecret', secret);
        setIsAdminSecret(secret);
        setNewCommentText('');
        showToast("Admin mode activated!");
      }
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, adminSecret: isAdminSecret })
      });
      
      if (res.ok) {
        setNewCommentText('');
        fetchComments(); // Refresh comments list
        showToast("コメントを投稿しました！");
      } else {
        const err = await res.json();
        showToast(`エラー: ${err.error || '投稿に失敗しました'}`);
      }
    } catch (e) {
      showToast("ネットワークエラーです");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const deleteComment = async (id) => {
    if (!isAdminSecret) return;
    if (!confirm("Delete this comment?")) return;
    
    try {
      const res = await fetch(`/api/comments?id=${id}&secret=${isAdminSecret}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComments();
        showToast("Comment deleted.");
      } else {
        const err = await res.json();
        showToast("Error: " + err.error);
      }
    } catch (e) {
      showToast("Network error.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    // Draw rects on the visible canvas when results are available and scanning is finished
    if (canvasRef.current && results.length > 0 && !isScanning) {
      const ctx = canvasRef.current.getContext('2d');
      results.forEach(match => {
        if (match.rect) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(match.rect.x, match.rect.y, match.rect.width, match.rect.height);
          ctx.fillStyle = '#00ff00';
          ctx.font = '14px sans-serif';
          ctx.fillText(`${match.matchRate.toFixed(1)}%`, match.rect.x + 2, match.rect.y + 14);
        }
      });
    }
  }, [results, isScanning]);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices');
      const data = await res.json();
      setPrices(data.items || {});
      setRates(data.rates || null);
    } catch (e) {
      console.error("Failed to fetch prices:", e);
    }
  };

  const processImage = async (file) => {
    setIsScanning(true);
    setResults([]);
    
    // If engine is not ready, wait for it
    if (!window.isDatabaseLoaded) {
      showToast("エンジンの起動とデータベースの構築を待機しています...");
      while (!window.isDatabaseLoaded) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    
    await new Promise(r => img.onload = r);
    
    // Draw to hidden canvas for scanning
    const hiddenCanvas = hiddenCanvasRef.current;
    hiddenCanvas.width = img.width;
    hiddenCanvas.height = img.height;
    const hCtx = hiddenCanvas.getContext('2d');
    hCtx.drawImage(img, 0, 0);
    
    // Draw to visible canvas immediately so user sees it during Ad screen
    const canvas = canvasRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Scan!
    // Give UI a moment to update to scanning/ad state before blocking the main thread
    await new Promise(r => setTimeout(r, 100)); 
    
    const scanData = scanIcons(hiddenCanvas);
    
    // Clear and redraw original image before drawing rects
    ctx.drawImage(img, 0, 0);
    
    const displayResults = [];
    
    // Collect rects
    scanData.results.forEach(res => {
      if (res.match) {
        res.match.rect = res.rect; // Store rect for drawing later
        displayResults.push(res.match);
      }
    });
    
    setResults(displayResults);
    setIsScanning(false);
    
    // Fetch prices in background
    fetchPrices();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleShareX = async (totalString) => {
    // 1. Open X intent synchronously to avoid popup blockers
    const text = `💰 私のTaskbar Heroインベントリ総資産は ${totalString} でした！\nあなたのインベントリもスキャンしてみよう！👇\nhttps://tbh-scanner.vercel.app\n\n#TaskbarHero #TBHScanner`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=600');

    // 2. Copy image to clipboard using a robust Promise approach
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        // Use toDataURL to avoid callback context loss, then convert to blob
        const dataUrl = canvas.toDataURL("image/png");
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        showToast("画像をコピーしました！Xの画面で貼り付け(Ctrl+V)してください！");
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      // Fallback message if browser blocks clipboard access
      showToast("画像の自動コピーがブロックされました。ブラウザの権限設定をご確認ください。");
    }
  };

  const processImageRef = useRef(processImage);
  useEffect(() => {
    processImageRef.current = processImage;
  }, [processImage]);

  useEffect(() => {
    const handlePaste = (e) => {
      // Ignore paste events when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            if (processImageRef.current) {
              processImageRef.current(file);
            }
            break;
          }
        }
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const removeItem = (idx) => {
    const newResults = [...results];
    newResults.splice(idx, 1);
    setResults(newResults);
    if (editingIndex === idx) setEditingIndex(-1);
    else if (editingIndex > idx) setEditingIndex(editingIndex - 1);
  };

  const addItem = () => {
    const newItem = { name: 'gold_coin.png', rarity: 'UNKNOWN', matchRate: 100 };
    const newResults = [newItem, ...results];
    setResults(newResults);
    handleEditClick(0, newItem);
    
    // Scroll the results list container to the top
    setTimeout(() => {
      const listDiv = document.getElementById('results-list-container');
      if (listDiv) {
        listDiv.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50); // slight delay to allow rendering
  };

  const handleEditClick = (idx, item) => {
    setEditingIndex(idx);
    const names = itemNames[item.name] || {};
    setEditSearchText(names[selectedLang] || names['en-US'] || item.name.replace('.png', ''));
    setEditSelectedKey(item.name);
    setEditRarity(item.rarity || 'UNKNOWN');
    setIsDropdownOpen(false);
  };

  const saveEdit = (idx) => {
    if (!editSelectedKey) {
      alert("Please select an item from the list.");
      return;
    }
    const newResults = [...results];
    newResults[idx] = {
      ...newResults[idx],
      name: editSelectedKey,
      rarity: editRarity,
      matchRate: 100 // Manual edit is 100% confident
    };
    setResults(newResults);
    setEditingIndex(-1);
  };

  // Prepare searchable items list
  const searchableItems = Object.keys(itemNames).map(key => {
    const names = itemNames[key];
    const englishName = names['en-US'] || key.replace('.png', '');
    const localName = names[selectedLang] || englishName;
    return { key, englishName, localName };
  });

  const filteredItems = searchableItems.filter(item => 
    item.localName.toLowerCase().includes(editSearchText.toLowerCase()) || 
    item.englishName.toLowerCase().includes(editSearchText.toLowerCase())
  ).slice(0, 50); // Limit to 50 results for performance

  // Rarity Translations
  const rarityTranslations = {
    'UNKNOWN': { 'en-US': 'None / Material', 'ja-JP': '素材 / 等級なし', 'zh-Hans': '无 / 材料', 'zh-Hant': '無 / 材料', 'ko-KR': '없음 / 재료' },
    'COMMON': { 'en-US': 'Common', 'ja-JP': 'コモン', 'zh-Hans': '普通', 'zh-Hant': '普通', 'ko-KR': '일반' },
    'UNCOMMON': { 'en-US': 'Uncommon', 'ja-JP': 'アンコモン', 'zh-Hans': '优秀', 'zh-Hant': '優秀', 'ko-KR': '고급' },
    'RARE': { 'en-US': 'Rare', 'ja-JP': 'レア', 'zh-Hans': '稀有', 'zh-Hant': '稀有', 'ko-KR': '희귀' },
    'LEGENDARY': { 'en-US': 'Legendary', 'ja-JP': 'レジェンダリー', 'zh-Hans': '传说', 'zh-Hant': '傳說', 'ko-KR': '전설' },
    'IMMORTAL': { 'en-US': 'Immortal', 'ja-JP': 'イモータル', 'zh-Hans': '不朽', 'zh-Hant': '不朽', 'ko-KR': '불멸' },
    'ARCANA': { 'en-US': 'Arcana', 'ja-JP': 'アルカナ', 'zh-Hans': '奥秘', 'zh-Hant': '奧秘', 'ko-KR': '아르카나' },
    'BEYOND': { 'en-US': 'Beyond', 'ja-JP': 'ビヨンド', 'zh-Hans': '超越', 'zh-Hant': '超越', 'ko-KR': '비욘드' },
    'CELESTIAL': { 'en-US': 'Celestial', 'ja-JP': 'セレスティアル', 'zh-Hans': '天界', 'zh-Hant': '天界', 'ko-KR': '천상' },
    'DIVINE': { 'en-US': 'Divine', 'ja-JP': 'ディヴァイン', 'zh-Hans': '神圣', 'zh-Hant': '神聖', 'ko-KR': '신성' },
    'COSMIC': { 'en-US': 'Cosmic', 'ja-JP': 'コズミック', 'zh-Hans': '宇宙', 'zh-Hant': '宇宙', 'ko-KR': '우주' }
  };
  const getRarityLabel = (rarity) => rarityTranslations[rarity]?.[selectedLang] || rarityTranslations[rarity]?.['en-US'] || rarity;

  const announcementTranslations = {
    'en-US': '⚠️ Notice: Image recognition accuracy has been significantly improved! If you find bugs or have feature requests, please let us know in the comments below.\nThere is a time lag in the displayed prices. For the latest information, please click the "🛒 Steam Market" button.',
    'ja-JP': '⚠️ お知らせ: 画像認識の精度を大幅に向上しました！バグや追加してほしい機能などがある場合は下のコメント欄にお願いします。\n表示される値段はタイムラグがあるので最新情報は「🛒 Steam Market」と書かれたボタンからどうぞ。',
    'zh-Hans': '⚠️ 提示: 图像识别准确率已大幅提升！如果您发现错误或有功能需求，请在下方评论区留言。\n显示的价格存在时间延迟。请点击「🛒 Steam Market」按钮查看最新信息。',
    'zh-Hant': '⚠️ 提示: 圖像識別準確率已大幅提升！如果您發現錯誤或有功能需求，請在下方評論區留言。\n顯示的價格存在時間延遲。請點擊「🛒 Steam Market」按鈕查看最新資訊。',
    'ko-KR': '⚠️ 공지: 이미지 인식 정확도가 크게 향상되었습니다! 버그나 추가를 원하는 기능이 있다면 아래 댓글란에 남겨주세요.\n표시된 가격에는 타임래그가 있습니다. 최신 정보는 "🛒 Steam Market" 버튼을 통해 확인해 주세요.',
    'ru-RU': '⚠️ Внимание: Точность распознавания изображений значительно улучшена! Если вы нашли ошибки или у вас есть пожелания по функционалу, пожалуйста, напишите в комментариях ниже.\nОтображаемые цены имеют задержку во времени. Актуальную информацию смотрите по кнопке "🛒 Steam Market".',
    'es-ES': '⚠️ Aviso: ¡La precisión del reconocimiento de imágenes ha mejorado significativamente! Si encuentras errores o tienes sugerencias de nuevas funciones, por favor escríbelo en los comentarios abajo.\nHay un desfase en los precios mostrados. Para ver la información más reciente, haz clic en el botón "🛒 Steam Market".',
    'fr-FR': '⚠️ Avis : La précision de la reconnaissance d\'image a été considérablement améliorée ! Si vous trouvez des bugs ou avez des suggestions de fonctionnalités, veuillez l\'indiquer dans les commentaires ci-dessous.\nIl y a un décalage dans les prix affichés. Pour les informations les plus récentes, veuillez cliquer sur le bouton "🛒 Steam Market".',
    'de-DE': '⚠️ Hinweis: Die Genauigkeit der Bilderkennung wurde deutlich verbessert! Wenn Sie Fehler finden oder Funktionswünsche haben, schreiben Sie diese bitte unten in die Kommentare.\nEs gibt eine Zeitverzögerung bei den angezeigten Preisen. Für aktuelle Informationen klicken Sie bitte auf "🛒 Steam Market".',
    'pt-BR': '⚠️ Aviso: A precisão do reconhecimento de imagem foi significativamente melhorada! Se você encontrar bugs ou tiver sugestões de recursos, por favor escreva nos comentários abaixo.\nHá um atraso nos preços exibidos. Para informações atualizadas, clique no botão "🛒 Steam Market".',
    'tr-TR': '⚠️ Uyarı: Görüntü tanıma doğruluğu önemli ölçüde iyileştirildi! Hatalar bulursanız veya özellik istekleriniz varsa, lütfen aşağıdaki yorumlar bölümüne yazın.\nGörüntülenen fiyatlarda bir zaman gecikmesi vardır. En güncel bilgiler için lütfen "🛒 Steam Market" düğmesine tıklayın.',
    'vi-VN': '⚠️ Thông báo: Độ chính xác của nhận dạng hình ảnh đã được cải thiện đáng kể! Nếu bạn tìm thấy lỗi hoặc có yêu cầu tính năng, vui lòng viết vào phần bình luận bên dưới.\nCó độ trễ về giá hiển thị. Để xem thông tin mới nhất, vui lòng nhấp vào nút "🛒 Steam Market".'
  };

  const titleTranslations = {
    'ja-JP': 'Taskbar Hero AI鑑定士',
    'en-US': 'Taskbar Hero AI Appraiser',
    'zh-Hans': 'Taskbar Hero AI 鉴定师',
    'zh-Hant': 'Taskbar Hero AI 鑑定師',
    'ko-KR': 'Taskbar Hero AI 감정사',
    'ru-RU': 'ИИ-оценщик Taskbar Hero',
    'es-ES': 'Tasador de IA de Taskbar Hero',
    'fr-FR': 'Évaluateur IA Taskbar Hero',
    'de-DE': 'Taskbar Hero KI-Gutachter',
    'pt-BR': 'Avaliador de IA do Taskbar Hero',
    'tr-TR': 'Taskbar Hero YZ Eksperi',
    'vi-VN': 'Chuyên gia thẩm định AI Taskbar Hero'
  };

  const descTranslations = {
    'ja-JP': '倉庫のスクリーンショットから即座に値段を見積もります',
    'en-US': 'Instantly appraise prices from your inventory screenshots.',
    'zh-Hans': '通过仓库截图即时估算价格。',
    'zh-Hant': '透過倉庫截圖即時估算價格。',
    'ko-KR': '인벤토리 스크린샷으로 즉시 가격을 감정합니다.',
    'ru-RU': 'Мгновенно оценивайте цены по скриншотам вашего инвентаря.',
    'es-ES': 'Estima instantáneamente los precios desde las capturas de pantalla de tu inventario.',
    'fr-FR': 'Estimez instantanément les prix à partir des captures d\'écran de votre inventaire.',
    'de-DE': 'Schätzen Sie Preise sofort anhand von Screenshots Ihres Inventars.',
    'pt-BR': 'Estime instantaneamente os preços a partir das capturas de tela do seu inventário.',
    'tr-TR': 'Envanterinizin ekran görüntülerinden anında fiyat tahmini alın.',
    'vi-VN': 'Định giá ngay lập tức từ ảnh chụp màn hình kho đồ của bạn.'
  };

  const appraisingTranslations = {
    'ja-JP': '鑑定中...',
    'en-US': 'Appraising...',
    'zh-Hans': '正在鉴定...',
    'zh-Hant': '正在鑑定...',
    'ko-KR': '감정 중...',
    'ru-RU': 'Оценка...',
    'es-ES': 'Evaluando...',
    'fr-FR': 'Évaluation...',
    'de-DE': 'Schätzung...',
    'pt-BR': 'Avaliando...',
    'tr-TR': 'Değerlendiriliyor...',
    'vi-VN': 'Đang định giá...'
  };

  const pleaseWaitTranslations = {
    'ja-JP': 'しばらくお待ちください',
    'en-US': 'Please wait a moment',
    'zh-Hans': '请稍等',
    'zh-Hant': '請稍候',
    'ko-KR': '잠시만 기다려주세요',
    'ru-RU': 'Подождите, пожалуйста',
    'es-ES': 'Por favor espera un momento',
    'fr-FR': 'Veuillez patienter',
    'de-DE': 'Bitte warten Sie einen Moment',
    'pt-BR': 'Por favor, aguarde um momento',
    'tr-TR': 'Lütfen biraz bekleyin',
    'vi-VN': 'Vui lòng chờ trong giây lát'
  };

  return (
    <>
      {/* Full Width Edge-to-Edge Announcement Banner */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(90deg, #1e88e5, #8e24aa)',
        padding: '12px 20px',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        zIndex: 100,
        position: 'relative',
        whiteSpace: 'pre-wrap'
      }}>
        {announcementTranslations[selectedLang] || announcementTranslations['en-US']}
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{flex: 1}}></div>
          <div style={{flex: 2, textAlign: 'center'}}>
            <h1 className={styles.title}>{titleTranslations[selectedLang] || titleTranslations['en-US']}</h1>
            <p className={styles.subtitle}>{descTranslations[selectedLang] || descTranslations['en-US']}</p>
          </div>
          <div style={{flex: 1, textAlign: 'right'}}>
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              className={styles.langSelect}
              style={{
                background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px', borderRadius: '8px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="en-US" style={{background: '#1a1d24', color: 'white'}}>English</option>
              <option value="ja-JP" style={{background: '#1a1d24', color: 'white'}}>日本語</option>
              <option value="zh-Hans" style={{background: '#1a1d24', color: 'white'}}>简体中文</option>
              <option value="zh-Hant" style={{background: '#1a1d24', color: 'white'}}>繁體中文</option>
              <option value="ko-KR" style={{background: '#1a1d24', color: 'white'}}>한국어</option>
              <option value="ru-RU" style={{background: '#1a1d24', color: 'white'}}>Русский</option>
              <option value="es-ES" style={{background: '#1a1d24', color: 'white'}}>Español</option>
              <option value="fr-FR" style={{background: '#1a1d24', color: 'white'}}>Français</option>
              <option value="de-DE" style={{background: '#1a1d24', color: 'white'}}>Deutsch</option>
              <option value="pt-BR" style={{background: '#1a1d24', color: 'white'}}>Português (BR)</option>
              <option value="tr-TR" style={{background: '#1a1d24', color: 'white'}}>Türkçe</option>
              <option value="vi-VN" style={{background: '#1a1d24', color: 'white'}}>Tiếng Việt</option>
            </select>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {/* Left Side: Upload & Canvas */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: (results.length > 0 || isScanning) ? '600px' : 'auto' }}>
          <div 
            className={`${styles.uploadZone} ${dragActive ? styles.dragActive : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
            style={{ display: (results.length > 0 || isScanning) ? 'none' : 'flex' }}
          >
            <div className={styles.uploadIcon}>📥</div>
            <h3>Drag & Drop or Paste (Ctrl+V) Screenshot</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>or click to browse</p>
            <input 
              type="file" 
              id="fileInput" 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg"
              onChange={handleFileSelect} 
            />
          </div>

          <div 
            className={styles.canvasContainer} 
            style={{ display: (results.length > 0 || isScanning) ? 'block' : 'none' }}
          >
            <canvas ref={canvasRef}></canvas>
          </div>
          <canvas ref={hiddenCanvasRef} style={{ display: 'none' }}></canvas>
          
          {results.length > 0 && (
            <button 
              onClick={() => setResults([])} 
              style={{
                marginTop: '16px', width: '100%', padding: '12px', 
                background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
                color: 'white', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Scan Another Screenshot
            </button>
          )}
        </div>

        {/* Right Side: Results or Loading Screen */}
        {isScanning ? (
          <div className={`glass-panel ${styles.resultsPanel}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff' }}>
              {appraisingTranslations[selectedLang] || appraisingTranslations['en-US']}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              {pleaseWaitTranslations[selectedLang] || pleaseWaitTranslations['en-US']}
            </p>
            
            <div className={styles.spinner} style={{ width: '60px', height: '60px', borderWidth: '6px' }}></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
              {!isEngineReady ? "Loading AI Engine (1st time only)..." : "Analyzing pixels..."}
            </p>
          </div>
        ) : (
          <div className={`glass-panel ${styles.resultsPanel}`}>
            <div className={styles.resultsHeader}>
            <h2>Detected Items ({results.length})</h2>
            {prices === null && results.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Fetching live market prices...
              </span>
            )}
          </div>
          
          {(() => {
            let totalCents = 0;
            results.forEach(item => {
              const names = itemNames[item.name] || {};
              const englishName = names['en-US'] || item.name.replace('.png', '');
              let marketData = null;
              if (prices) {
                if (prices[englishName]) marketData = prices[englishName];
                else if (item.rarity && item.rarity !== 'UNKNOWN') {
                  const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                  const prefix = `${englishName} (${rarityStr})`;
                  if (prices[`${prefix} A`]) marketData = prices[`${prefix} A`];
                  else {
                    const matchedKey = Object.keys(prices).find(k => k.startsWith(prefix));
                    if (matchedKey) marketData = prices[matchedKey];
                  }
                }
              }
              if (marketData) {
                const cents = marketData.medianCents || marketData.priceCents || marketData.lowestCents;
                if (cents) totalCents += cents;
              }
            });
            
            let localizedTotal = '';
            const langToCurrency = {
              'en-US': { code: 'USD' }, 'ja-JP': { code: 'JPY' }, 'zh-Hans': { code: 'CNY' },
              'zh-Hant': { code: 'TWD' }, 'ko-KR': { code: 'KRW' }, 'ru-RU': { code: 'RUB' },
              'es-ES': { code: 'EUR' }, 'fr-FR': { code: 'EUR' }, 'de-DE': { code: 'EUR' },
              'pt-BR': { code: 'BRL' }, 'tr-TR': { code: 'TRY' }, 'vi-VN': { code: 'VND' }
            };
            
            if (rates) {
              const curr = langToCurrency[selectedLang] || { code: 'USD' };
              const rate = rates[curr.code] || 1;
              const convertedTotal = (totalCents / 100) * rate;
              localizedTotal = new Intl.NumberFormat(selectedLang, {
                style: 'currency', currency: curr.code,
                maximumFractionDigits: curr.code === 'JPY' || curr.code === 'KRW' ? 0 : 2
              }).format(convertedTotal);
            }
            
            const totalLabels = {
              'en-US': 'Total Value:', 'ja-JP': '合計金額:', 'zh-Hans': '总计金额:', 'zh-Hant': '總計金額:',
              'ko-KR': '총액:', 'ru-RU': 'Общая стоимость:', 'es-ES': 'Valor total:', 'fr-FR': 'Valeur totale:',
              'de-DE': 'Gesamtwert:', 'pt-BR': 'Valor total:', 'tr-TR': 'Toplam Değer:', 'vi-VN': 'Tổng giá trị:'
            };
            const totalLabel = totalLabels[selectedLang] || 'Total Value:';
            
            const addBtnTranslations = {
              'en-US': '➕ Add Item Manually', 'ja-JP': '➕ 手動でアイテムを追加', 'zh-Hans': '➕ 手动添加物品',
              'zh-Hant': '➕ 手動新增物品', 'ko-KR': '➕ 수동으로 아이템 추가', 'ru-RU': '➕ Добавить предмет вручную',
              'es-ES': '➕ Añadir objeto manualmente', 'fr-FR': '➕ Ajouter un objet manuellement',
              'de-DE': '➕ Element manuell hinzufügen', 'pt-BR': '➕ Adicionar item manualmente',
              'tr-TR': '➕ Öğeyi Manuel Ekle', 'vi-VN': '➕ Thêm vật phẩm thủ công'
            };
            const addBtnLabel = addBtnTranslations[selectedLang] || '➕ Add Item Manually';

            return (
              <>
                {results.length > 0 && localizedTotal && (
                  <div style={{
                    padding: '16px', margin: '0 20px 16px', background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{totalLabel}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4caf50' }}>{localizedTotal}</span>
                    <button 
                      onClick={() => handleShareX(localizedTotal)}
                      style={{
                        marginLeft: 'auto', background: '#000000', color: 'white', border: '1px solid #333',
                        padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#111'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#000'}
                    >
                      𝕏 Post
                    </button>
                  </div>
                )}
                
                <div id="results-list-container" className={styles.resultsList}>
                  {results.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                      Waiting for scan...
                    </div>
                  ) : (
                    results.map((item, idx) => {
                      if (editingIndex === idx) {
                        return (
                          <div key={idx} className={styles.itemRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', background: 'rgba(33, 150, 243, 0.1)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div style={{ flex: 1, position: 'relative' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Item Name (Search)</label>
                                <input 
                                  type="text"
                                  value={editSearchText}
                                  onChange={(e) => {
                                    setEditSearchText(e.target.value);
                                    setIsDropdownOpen(true);
                                  }}
                                  onFocus={() => setIsDropdownOpen(true)}
                                  style={{
                                    width: '100%', padding: '8px', marginTop: '4px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '4px', outline: 'none'
                                  }}
                                  placeholder="Type to search..."
                                />
                                {isDropdownOpen && (
                                  <ul style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                                    background: '#1a1d24', border: '1px solid rgba(255,255,255,0.2)',
                                    maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0, margin: '4px 0 0 0',
                                    borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                  }}>
                                    {filteredItems.map(fItem => (
                                      <li 
                                        key={fItem.key}
                                        onClick={() => {
                                          setEditSearchText(fItem.localName);
                                          setEditSelectedKey(fItem.key);
                                          setIsDropdownOpen(false);
                                        }}
                                        style={{
                                          padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                          display: 'flex', alignItems: 'center', gap: '8px',
                                          background: editSelectedKey === fItem.key ? 'rgba(33, 150, 243, 0.3)' : 'transparent'
                                        }}
                                      >
                                        <img src={`/icons/${fItem.key}`} style={{ width: '24px', height: '24px' }} alt="" />
                                        {fItem.localName}
                                      </li>
                                    ))}
                                    {filteredItems.length === 0 && (
                                      <li style={{ padding: '8px 12px', color: 'gray' }}>No items found</li>
                                    )}
                                  </ul>
                                )}
                              </div>
                              
                              <div style={{ width: '120px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rarity</label>
                                <select 
                                  value={editRarity}
                                  onChange={(e) => setEditRarity(e.target.value)}
                                  style={{
                                    width: '100%', padding: '8px', marginTop: '4px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white', borderRadius: '4px', outline: 'none'
                                  }}
                                >
                                  <option value="UNKNOWN">{getRarityLabel('UNKNOWN')}</option>
                                  <option value="COMMON" style={{ color: 'gray' }}>{getRarityLabel('COMMON')}</option>
                                  <option value="UNCOMMON" style={{ color: '#4caf50' }}>{getRarityLabel('UNCOMMON')}</option>
                                  <option value="RARE" style={{ color: '#2196f3' }}>{getRarityLabel('RARE')}</option>
                                  <option value="LEGENDARY" style={{ color: '#ff9800' }}>{getRarityLabel('LEGENDARY')}</option>
                                  <option value="IMMORTAL" style={{ color: '#f44336' }}>{getRarityLabel('IMMORTAL')}</option>
                                  <option value="ARCANA" style={{ color: '#9c27b0' }}>{getRarityLabel('ARCANA')}</option>
                                  <option value="BEYOND" style={{ color: '#e91e63' }}>{getRarityLabel('BEYOND')}</option>
                                  <option value="CELESTIAL" style={{ color: '#00bcd4' }}>{getRarityLabel('CELESTIAL')}</option>
                                  <option value="DIVINE" style={{ color: '#ffeb3b' }}>{getRarityLabel('DIVINE')}</option>
                                  <option value="COSMIC" style={{ color: '#ffffff' }}>{getRarityLabel('COSMIC')}</option>
                                </select>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button 
                                onClick={() => setEditingIndex(-1)}
                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                              >Cancel</button>
                              <button 
                                onClick={() => saveEdit(idx)}
                                style={{ padding: '6px 12px', background: '#2196f3', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                              >Save</button>
                            </div>
                          </div>
                        );
                      }

                      const names = itemNames[item.name] || {};
                      const displayName = names[selectedLang] || names['en-US'] || item.name.replace('.png', '');
                      const englishName = names['en-US'] || item.name.replace('.png', '');
                      
                      const labelTranslations = {
                        'en-US': 'Recent Sold:', 'ja-JP': '直近の取引:', 'zh-Hans': '最近交易:', 'zh-Hant': '最近交易:',
                        'ko-KR': '최근 거래:', 'ru-RU': 'Последняя продажа:', 'es-ES': 'Última venta:', 'fr-FR': 'Dernière vente:',
                        'de-DE': 'Zuletzt verkauft:', 'pt-BR': 'Última venda:', 'tr-TR': 'Son satış:', 'vi-VN': 'Đã bán gần đây:'
                      };
                      const recentSoldLabel = labelTranslations[selectedLang] || 'Recent Sold:';

                      const lowestLabelTranslations = {
                        'en-US': 'Lowest Listing:', 'ja-JP': '最低出品:', 'zh-Hans': '最低上架:', 'zh-Hant': '最低上架:',
                        'ko-KR': '최저가:', 'ru-RU': 'Самая низкая цена:', 'es-ES': 'Listado más bajo:', 'fr-FR': 'Liste la plus basse:',
                        'de-DE': 'Niedrigstes Angebot:', 'pt-BR': 'Menor preço:', 'tr-TR': 'En Düşük İlan:', 'vi-VN': 'Danh sách thấp nhất:'
                      };
                      const lowestLabel = lowestLabelTranslations[selectedLang] || 'Lowest Listing:';
                      
                      let marketData = null;
                      let actualKey = englishName; // default fallback key for URL
                      if (prices) {
                        if (prices[englishName]) {
                          marketData = prices[englishName];
                          actualKey = englishName;
                        }
                        else if (item.rarity && item.rarity !== 'UNKNOWN') {
                          const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                          const prefix = `${englishName} (${rarityStr})`;
                          if (prices[`${prefix} A`]) {
                            marketData = prices[`${prefix} A`];
                            actualKey = `${prefix} A`;
                          }
                          else {
                            const matchedKey = Object.keys(prices).find(k => k.startsWith(prefix));
                            if (matchedKey) {
                              marketData = prices[matchedKey];
                              actualKey = matchedKey;
                            } else {
                              actualKey = prefix; // fallback for URL if not found in prices but rarity is known
                            }
                          }
                        }
                      }
                      
                      const steamUrl = `https://steamcommunity.com/market/listings/3678970/${encodeURIComponent(actualKey)}`;
                      
                      let localizedPrice = '';
                      let localizedLowestPrice = '';
                      if (rates) {
                        const curr = langToCurrency[selectedLang] || { code: 'USD' };
                        const rate = rates[curr.code] || 1;
                        const formatter = new Intl.NumberFormat(selectedLang, {
                          style: 'currency', currency: curr.code,
                          maximumFractionDigits: ['JPY', 'KRW', 'VND'].includes(curr.code) ? 0 : 2
                        });
                        if (marketData) {
                          const primaryCents = marketData.medianCents || marketData.priceCents;
                          if (primaryCents) localizedPrice = formatter.format((primaryCents / 100) * rate);
                          if (marketData.lowestCents) localizedLowestPrice = formatter.format((marketData.lowestCents / 100) * rate);
                        }
                      }
                      
                      return (
                        <div key={idx} className={styles.itemRow}>
                          <img src={`/icons/${item.name}`} className={styles.itemIcon} alt={item.name} />
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>
                              {displayName}
                            </div>
                            <div className={styles.itemMatch}>
                              <span style={{ 
                                color: item.rarity === 'COMMON' ? 'gray' :
                                      item.rarity === 'UNCOMMON' ? '#4caf50' :
                                      item.rarity === 'RARE' ? '#2196f3' :
                                      item.rarity === 'CELESTIAL' ? '#00bcd4' :
                                      item.rarity === 'DIVINE' ? '#ffeb3b' :
                                      item.rarity === 'LEGENDARY' ? '#ff9800' :
                                      item.rarity === 'ARCANA' ? '#9c27b0' :
                                      item.rarity === 'BEYOND' ? '#e91e63' :
                                      item.rarity === 'IMMORTAL' ? '#f44336' :
                                      item.rarity === 'COSMIC' ? '#ffffff' : 'var(--text-secondary)'
                              }}>
                                {getRarityLabel(item.rarity)}
                              </span> • {item.matchRate.toFixed(1)}% Match
                              <br/>
                              <a 
                                href={steamUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: '#64b5f6', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', padding: '2px 8px', background: 'rgba(33, 150, 243, 0.1)', borderRadius: '12px', border: '1px solid rgba(33, 150, 243, 0.3)' }}
                              >
                                🛒 Steam Market
                              </a>
                            </div>
                          </div>
                          <div className={styles.itemPrice} style={{ textAlign: 'right', flexShrink: 0 }}>
                            {marketData ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                {localizedPrice && <div className={styles.priceValue} style={{ color: '#4caf50', fontWeight: 'bold' }}>{recentSoldLabel} {localizedPrice}</div>}
                                {localizedLowestPrice && <div style={{ fontSize: '0.85rem', color: '#81c784' }}>{lowestLabel} {localizedLowestPrice}</div>}
                                {(!localizedPrice && !localizedLowestPrice) && <div className={styles.priceLabel}>No Data</div>}
                              </div>
                            ) : prices ? (
                              <div className={styles.priceLabel}>No Data</div>
                            ) : (
                              <div className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', alignSelf: 'flex-end' }}></div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '12px' }}>
                            <button 
                              onClick={() => handleEditClick(idx, item)}
                              title="Edit"
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                            >✎</button>
                            <button 
                              onClick={() => removeItem(idx)}
                              title="Remove"
                              style={{ background: 'rgba(244,67,54,0.1)', border: 'none', color: '#f44336', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                            >✖</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {results.length > 0 && (
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={addItem}
                      style={{ 
                        background: 'rgba(33, 150, 243, 0.2)', border: '1px dashed rgba(33, 150, 243, 0.5)', 
                        color: '#64b5f6', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(33, 150, 243, 0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(33, 150, 243, 0.2)'}
                    >
                      {addBtnLabel}
                    </button>
                  </div>
                )}
              </>
            );
          })()}
          </div>
        )}
      </main>
      
      {/* How to Use Section */}
      <section style={{ 
        marginTop: '20px', 
        padding: '30px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        {(() => {
          const guideTrans = {
            title: { 'en-US': 'How to Use', 'ja-JP': '使い方', 'zh-Hans': '使用方法', 'zh-Hant': '使用方法', 'ko-KR': '사용 방법', 'ru-RU': 'Как использовать', 'es-ES': 'Cómo usar', 'fr-FR': 'Comment utiliser', 'de-DE': 'Wie man es benutzt', 'pt-BR': 'Como usar', 'tr-TR': 'Nasıl Kullanılır', 'vi-VN': 'Cách sử dụng' },
            step1: { 'en-US': '1. Take a screenshot of your in-game inventory.', 'ja-JP': '1. ゲーム内でインベントリ（アイテム欄）のスクリーンショットを撮影します。', 'zh-Hans': '1. 在游戏中截取您的物品栏。', 'zh-Hant': '1. 在遊戲中截取您的物品欄。', 'ko-KR': '1. 게임 내 인벤토리의 스크린샷을 찍습니다.', 'ru-RU': '1. Сделайте скриншот вашего инвентаря в игре.', 'es-ES': '1. Toma una captura de pantalla de tu inventario en el juego.', 'fr-FR': '1. Prenez une capture d\'écran de votre inventaire en jeu.', 'de-DE': '1. Mache einen Screenshot deines Inventars im Spiel.', 'pt-BR': '1. Tire uma captura de tela do seu inventário no jogo.', 'tr-TR': '1. Oyun içi envanterinizin ekran görüntüsünü alın.', 'vi-VN': '1. Chụp ảnh màn hình kho đồ trong trò chơi của bạn.' },
            step2: { 'en-US': '2. Drag & drop the image into the scanner above.', 'ja-JP': '2. 撮影した画像を上のスキャナーにドラッグ＆ドロップします。', 'zh-Hans': '2. 将图片拖放到上方的扫描仪中。', 'zh-Hant': '2. 將圖片拖放到上方的掃描儀中。', 'ko-KR': '2. 이미지를 위 스캐너에 드래그 앤 드롭합니다.', 'ru-RU': '2. Перетащите изображение в сканер выше.', 'es-ES': '2. Arrastra y suelta la imagen en el escáner de arriba.', 'fr-FR': '2. Glissez-déposez l\'image dans le scanner ci-dessus.', 'de-DE': '2. Ziehe das Bild per Drag & Drop in den Scanner oben.', 'pt-BR': '2. Arraste e solte a imagem no scanner acima.', 'tr-TR': '2. Resmi yukarıdaki tarayıcıya sürükleyip bırakın.', 'vi-VN': '2. Kéo và thả hình ảnh vào máy quét ở trên.' },
            example: { 'en-US': '💡 Example: Make sure the image looks like this for the best accuracy!', 'ja-JP': '💡 例: 以下のような綺麗に枠が写った画像だと、最も正確に認識できます！', 'zh-Hans': '💡 示例：像这样清晰的截图可以获得最高的识别准确率！', 'zh-Hant': '💡 示例：像這樣清晰的截圖可以獲得最高的識別準確率！', 'ko-KR': '💡 예시: 이런 식의 깔끔한 스크린샷이 가장 정확하게 인식됩니다!', 'ru-RU': '💡 Пример: Убедитесь, что изображение выглядит так для лучшей точности!', 'es-ES': '💡 Ejemplo: ¡Asegúrate de que la imagen se vea así para obtener la mejor precisión!', 'fr-FR': '💡 Exemple: Assurez-vous que l\'image ressemble à ceci pour une meilleure précision!', 'de-DE': '💡 Beispiel: Stelle sicher, dass das Bild so aussieht, um die beste Genauigkeit zu erzielen!', 'pt-BR': '💡 Exemplo: Certifique-se de que a imagem seja assim para melhor precisão!', 'tr-TR': '💡 Örnek: En iyi doğruluk için görüntünün böyle göründüğünden emin olun!', 'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này để có độ chính xác tốt nhất!' }
          };
          
          return (
            <>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>
                {guideTrans.title[selectedLang] || guideTrans.title['en-US']}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                <p>{guideTrans.step1[selectedLang] || guideTrans.step1['en-US']}</p>
                <p>{guideTrans.step2[selectedLang] || guideTrans.step2['en-US']}</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                <p style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '12px' }}>
                  {guideTrans.example[selectedLang] || guideTrans.example['en-US']}
                </p>
                <img 
                  src="/example_inventory.png" 
                  alt="Example Inventory" 
                  style={{ maxWidth: '100%', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
              </div>
            </>
          );
        })()}
      </section>

      {/* Anonymous Comments Section */}
      <section style={{
        marginTop: '20px', 
        padding: '30px', 
        background: 'rgba(0, 0, 0, 0.2)', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💬 Anonymous Comments
        </h2>
        
        <form onSubmit={submitComment} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <input 
            type="text" 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment... (max 100 chars)"
            maxLength={100}
            disabled={isSubmittingComment}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '1rem'
            }}
          />
          <button 
            type="submit"
            disabled={isSubmittingComment || !newCommentText.trim()}
            style={{
              padding: '0 24px', borderRadius: '8px', border: 'none', background: '#2196f3',
              color: 'white', fontWeight: 'bold', cursor: isSubmittingComment || !newCommentText.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmittingComment || !newCommentText.trim() ? 0.5 : 1, transition: 'opacity 0.2s'
            }}
          >
            Post
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
              No comments yet. Be the first to share your scan results!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{
                background: comment.isAdmin ? 'rgba(244, 67, 54, 0.05)' : 'rgba(255,255,255,0.03)', 
                padding: '16px', 
                borderRadius: '12px',
                borderLeft: comment.isAdmin ? '4px solid #f44336' : '4px solid #2196f3',
                position: 'relative'
              }}>
                {isAdminSecret && (
                  <button 
                    onClick={() => deleteComment(comment.id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
                    title="Delete Comment"
                  >
                    🗑️
                  </button>
                )}
                <div style={{ fontSize: '0.8rem', color: comment.isAdmin ? '#f44336' : 'var(--text-secondary)', marginBottom: '8px', fontWeight: comment.isAdmin ? 'bold' : 'normal' }}>
                  {comment.isAdmin ? '[Admin]' : 'Anonymous'} • {new Date(comment.timestamp).toLocaleString(selectedLang)}
                </div>
                <div style={{ fontSize: '1rem', color: 'white', lineHeight: '1.4' }}>
                  {comment.text}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(33, 150, 243, 0.95)', color: 'white', padding: '16px 24px',
          borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 9999,
          fontWeight: 'bold', animation: 'fadeInOut 4s forwards'
        }}>
          {toastMessage}
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, 20px); }
              10% { opacity: 1; transform: translate(-50%, 0); }
              90% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `}</style>
        </div>
      )}
      </div>
    </>
  );
}
