'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { loadDatabase, scanIcons } from '../lib/ocr-engine';
import itemNames from '../public/item_names.json';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableComment({ comment, isAdminSecret, deleteComment, selectedLang, handleReply }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: comment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: comment.isAdmin ? 'rgba(244, 67, 54, 0.05)' : 'rgba(255,255,255,0.03)', 
    padding: '16px', 
    borderRadius: '12px',
    borderLeft: comment.isAdmin ? '4px solid #f44336' : '4px solid #2196f3',
    position: 'relative',
    marginLeft: comment.parentId ? '40px' : '0px',
    marginBottom: '16px',
    zIndex: transform ? 999 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isAdminSecret && (
        <div 
          style={{ position: 'absolute', top: '12px', right: '40px', cursor: 'grab', fontSize: '1.2rem', opacity: 0.6 }} 
          {...attributes} 
          {...listeners} 
          title="Drag to reorder"
        >
          ☰
        </div>
      )}
      {isAdminSecret && (
        <button 
          onClick={() => deleteComment(comment.id)}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
          title="Delete Comment"
        >
          🗑�E�E
        </button>
      )}
      <button 
        onClick={() => handleReply(comment.id)}
        style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}
        title="Reply"
      >
        ↩�E�E
      </button>
      <div style={{ fontSize: '0.8rem', color: comment.isAdmin ? '#f44336' : 'var(--text-secondary)', marginBottom: '8px', fontWeight: comment.isAdmin ? 'bold' : 'normal' }}>
        {comment.isAdmin ? '[Admin]' : 'Anonymous'} • {new Date(comment.timestamp).toLocaleString(selectedLang)} {comment.parentId && ' (Reply)'}
      </div>
      <div style={{ fontSize: '1rem', color: 'white', lineHeight: '1.4' }}>
        {comment.text}
      </div>
    </div>
  );
}

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

// Cache for preserving state across client-side navigations (e.g. going to tips page and back)
let pageCache = null;

export default function ScannerApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [results, setResults] = useState(pageCache?.results || []);
  const [previewImages, setPreviewImages] = useState(pageCache?.previewImages || []);
  const [dragActive, setDragActive] = useState(false);
  const [prices, setPrices] = useState(pageCache?.prices || null);
  const [rates, setRates] = useState(pageCache?.rates || null);
  const [selectedLang, setSelectedLang] = useState('ja-JP');
  const [toastMessage, setToastMessage] = useState('');
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAdminSecret, setIsAdminSecret] = useState(null);
  const [isSortedByPrice, setIsSortedByPrice] = useState(pageCache?.isSortedByPrice || false);
  const [replyingToId, setReplyingToId] = useState(null);

  // Sync state to cache so it survives navigation
  useEffect(() => {
    pageCache = { results, previewImages, prices, rates, isSortedByPrice };
  }, [results, previewImages, prices, rates, isSortedByPrice]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  
  // Editing states
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editSearchText, setEditSearchText] = useState('');
  const [editSelectedKey, setEditSelectedKey] = useState('');
  const [editRarity, setEditRarity] = useState('UNKNOWN');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  

  const hiddenCanvasRef = useRef(null);

  useEffect(() => {
    // Load admin secret and preferred language if available
    if (typeof window !== 'undefined') {
      setIsAdminSecret(localStorage.getItem('adminSecret'));
      const savedLang = localStorage.getItem('preferredLang');
      if (savedLang) {
        setSelectedLang(savedLang);
      }
    }
  }, []);



  useEffect(() => {
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
    
    // Fetch initial data sequentially to prevent concurrent request conflicts
    const loadData = async () => {
      await fetchComments();
      await fetchPrices();
    };
    loadData();
    
    return () => clearInterval(checkCv);
  }, []);

  const fetchComments = async () => {
    setIsCommentsLoading(true);
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error("Failed to fetch comments", e);
    } finally {
      setIsCommentsLoading(false);
    }
  };



  const submitComment = async (e) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || isSubmittingComment) return;
    
    // Hidden admin logout
    if (text === '/logout' || text === '/admin logout') {
      localStorage.removeItem('adminSecret');
      setIsAdminSecret(null);
      setNewCommentText('');
      showToast("Admin mode deactivated.");
      return;
    }

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
        body: JSON.stringify({ text: text, adminSecret: isAdminSecret, parentId: replyingToId })
      });
      
      if (res.ok) {
        setNewCommentText('');
        setReplyingToId(null);
        fetchComments(); // Refresh comments list
        showToast("コメントを投稿しました�E�E);
      } else {
        const err = await res.json();
        showToast("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      showToast("Network error while submitting.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyingToId(commentId);
    setNewCommentText('');
    showToast("Replying to a comment");
  };

  const handleDragEndComments = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setComments((items) => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newArray = arrayMove(items, oldIndex, newIndex);
      
      // Call API to save new order in background
      fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: newArray, adminSecret: isAdminSecret })
      }).catch(err => console.error("Failed to save reorder", err));

      return newArray;
    });
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 8);
      if (files.length > 0) {
        const shouldAppend = results.length > 0;
        processImages(files, shouldAppend);
      }
    }
  };
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/')).slice(0, 8);
      if (files.length > 0) processImages(files);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices', { cache: 'no-store' });
      if (!res.ok) throw new Error("Prices API returned " + res.status);
      const data = await res.json();
      
      setPrices(prev => {
        if (data.items && Object.keys(data.items).length > 0) {
          return { ...(prev || {}), ...data.items };
        }
        return prev || {};
      });
      
      setRates(prev => {
        if (data.rates && Object.keys(data.rates).length > 0) {
          return { ...(prev || {}), ...data.rates };
        }
        return prev || null;
      });
    } catch (e) {
      console.error("Failed to fetch prices:", e);
      setPrices(prev => prev || {});
    }
  };

  const processImages = async (files, append = false) => {
    setIsScanning(true);
    if (!append) {
      setResults([]);
    }
    
    // If engine is not ready, wait for it
    if (!window.isDatabaseLoaded) {
      showToast("エンジンの起動とチE�Eタベ�Eスの構築を征E��てぁE��ぁE..");
      while (!window.isDatabaseLoaded) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    // 1. Pre-load all images and show them on screen immediately without rects
    const loadedImages = await Promise.all(files.map(async (file) => {
      const imgUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imgUrl;
      await new Promise(r => img.onload = r);
      return { imgUrl, img, width: img.width, height: img.height, rects: [] };
    }));
    
    // Initialize preview state so the images appear on screen before scanning starts
    let currentPreviewImages = append ? [...previewImages] : [];
    let newPreviewImages = loadedImages.map(d => ({
      src: d.imgUrl,
      width: d.width,
      height: d.height,
      rects: []
    }));
    currentPreviewImages = [...currentPreviewImages, ...newPreviewImages];
    setPreviewImages(currentPreviewImages);
    
    // Give UI a moment to render the images
    await new Promise(r => setTimeout(r, 100));
    
    let allResults = append ? [...results] : [];
    const offset = append ? (previewImages.length) : 0;

    // 2. Scan images one by one and update UI progressively
    for (let i = 0; i < loadedImages.length; i++) {
      const { img } = loadedImages[i];
      
      // Draw to hidden canvas for scanning
      const hiddenCanvas = hiddenCanvasRef.current;
      hiddenCanvas.width = img.width;
      hiddenCanvas.height = img.height;
      const hCtx = hiddenCanvas.getContext('2d');
      hCtx.drawImage(img, 0, 0);
      
      // Let UI breathe
      await new Promise(r => setTimeout(r, 50)); 
      
      const scanData = scanIcons(hiddenCanvas);
      
      const fileDisplayResults = [];
      
      // Collect rects
      scanData.results.forEach(res => {
        if (res.match) {
          res.match.rect = res.rect; // Store rect for drawing later
          fileDisplayResults.push(res.match);
        }
      });
      
      allResults = [...allResults, ...fileDisplayResults];
      
      // Progressively update the preview with the green rects for this image
      currentPreviewImages[offset + i].rects = fileDisplayResults.map(r => ({ ...r.rect, matchRate: r.matchRate }));
      setPreviewImages([...currentPreviewImages]); // Trigger re-render
    }
    
    setResults(allResults);
    
    // Fetch prices and wait for the network response before hiding the scanning UI
    await fetchPrices();

    setIsScanning(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleShareX = async (totalString) => {
    // 1. Open X intent synchronously to avoid popup blockers
    const text = `💰 私�ETaskbar Heroインベントリ総賁E��は ${totalString} でした�E�\nあなた�Eインベントリもスキャンしてみよう�E�👇\nhttps://tbh-scanner.vercel.app\n\n#TaskbarHero #TBHScanner`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const processImagesRef = useRef(processImages);
  useEffect(() => {
    processImagesRef.current = processImages;
  }, [processImages]);

  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    const handlePaste = (e) => {
      // Ignore paste events when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      const imageFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      
      if (imageFiles.length > 0) {
        e.preventDefault();
        if (processImagesRef.current) {
          const shouldAppend = resultsRef.current && resultsRef.current.length > 0;
          processImagesRef.current(imageFiles.slice(0, 8), shouldAppend);
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
    'UNKNOWN': { 'en-US': 'None / Material', 'ja-JP': '素杁E/ 等級なぁE, 'zh-Hans': '无 / 材料', 'zh-Hant': '無 / 材料', 'ko-KR': '�E�E�� / �E��E�E },
    'COMMON': { 'en-US': 'Common', 'ja-JP': 'コモン', 'zh-Hans': '普送E, 'zh-Hant': '普送E, 'ko-KR': '�E��E�E },
    'UNCOMMON': { 'en-US': 'Uncommon', 'ja-JP': 'アンコモン', 'zh-Hans': '优秀', 'zh-Hant': '優秀', 'ko-KR': '�E��E�E },
    'RARE': { 'en-US': 'Rare', 'ja-JP': 'レア', 'zh-Hans': '稀朁E, 'zh-Hant': '稀朁E, 'ko-KR': '����E�' },
    'LEGENDARY': { 'en-US': 'Legendary', 'ja-JP': 'レジェンダリー', 'zh-Hans': '传说', 'zh-Hant': '傳說', 'ko-KR': '�E�E��' },
    'IMMORTAL': { 'en-US': 'Immortal', 'ja-JP': 'イモータル', 'zh-Hans': '不朽', 'zh-Hant': '不朽', 'ko-KR': '�E�멸' },
    'ARCANA': { 'en-US': 'Arcana', 'ja-JP': 'アルカチE, 'zh-Hans': '奥私E, 'zh-Hant': '奧私E, 'ko-KR': '�E�E���E��E�E },
    'BEYOND': { 'en-US': 'Beyond', 'ja-JP': 'ビヨンチE, 'zh-Hans': '趁E��E, 'zh-Hant': '趁E��E, 'ko-KR': '�E�E���E�E },
    'CELESTIAL': { 'en-US': 'Celestial', 'ja-JP': 'セレスチE��アル', 'zh-Hans': '天畁E, 'zh-Hant': '天畁E, 'ko-KR': '�E�상' },
    'DIVINE': { 'en-US': 'Divine', 'ja-JP': 'チE��ヴァイン', 'zh-Hans': '神圣', 'zh-Hant': '神聖', 'ko-KR': '�E��E�' },
    'COSMIC': { 'en-US': 'Cosmic', 'ja-JP': 'コズミック', 'zh-Hans': '宁E��E, 'zh-Hant': '宁E��E, 'ko-KR': '�E��E�' }
  };
  const getRarityLabel = (rarity) => rarityTranslations[rarity]?.[selectedLang] || rarityTranslations[rarity]?.['en-US'] || rarity;

  const announcementTranslations = {
    'en-US': 'Multi-image upload is now supported! You can appraise up to 8 images at once!\nYou can also add more images by dragging and dropping or copy-pasting without pressing the Clear Screenshot button!',
    'ja-JP': '褁E��画像�EアチE�Eロードに対応しました�E�一気に8枚まで鑑定可能です！\n画像をクリアボタンを押さずに追加でドラチE��アンドドロチE�Eかコピ�Eペ�Eストを行ってもOKです！E,
    'zh-Hans': '现已支持多图上传�E�一次最多可鉴宁E张图牁E��\n您无需点击“渁E��截图”按钮�E�直接通迁E��拽或复制粘贴即可追加上传�E�E,
    'zh-Hant': '現已支援多圖上傳�E�一次最多可鑑宁E張圖片�E�\n您無需點擊「渁E��截圖」按鈕，直接透過拖曳或褁E��貼上即可追加上傳�E�E,
    'ko-KR': '�E��E�E�E��E��E� �E�E��드�E� �E��E�합�E�다! ���E�E�에 �E�대 8�E��E�지 �E�적E�E��E�����E�다!\n�E�����E��E� �E��E��E� �E�E���E�E�E�E���E� �E�고�E�E�E�래�E� �E� �E�롭�E��E�E�E��E�-�E�여�E��E��E�E�E��E��E��E� �E�가��� �E�E�E�습�E�다!',
    'ru-RU': 'ТеперсEподдерживаетсE�Eзагрузка несE�олькисEизображений! ВсEможете осE�нитсEдо 8 изображений за раз!\nВсEтакже можете добавлятсEдополнительные изображенисEпутем перетасE�иванисEили копированисEи всE�авки без нажатисEкнопки ОсE�сE�итсEсE�риншосE',
    'es-ES': '¡Ahora se admite la carga de múltiples imágenes! ¡Puedes evaluar hasta 8 imágenes a la vez!\n¡También puedes agregar más imágenes arrastrando y soltando o copiando y pegando sin presionar el botón Borrar captura!',
    'fr-FR': 'Le téléchargement de plusieurs images est désormais pris en charge ! Vous pouvez évaluer jusqu\'8 images à la fois !\nVous pouvez également ajouter d\'autres images par glisser-déposer ou copier-coller sans appuyer sur le bouton Effacer la capture !',
    'de-DE': 'Der Upload mehrerer Bilder wird jetzt unterstützt! Sie können bis zu 8 Bilder auf einmal bewerten!\nSie können auch weitere Bilder per Drag & Drop oder durch Kopieren und Einfügen hinzufügen, ohne die Schaltfläche Screenshot löschen drücken zu müssen!',
    'pt-BR': 'O upload de múltiplas imagens agora é suportado! Você pode avaliar até 8 imagens de uma vez!\nVocê também pode adicionar mais imagens arrastando e soltando ou copiando e colando sem pressionar o botão Limpar captura!',
    'tr-TR': 'Çoklu görüntü yükleme artık destekleniyor! Aynı anda 8 görüntüye kadar değerlendirme yapabilirsiniz!\nEkran Görüntüsünü Temizle düğmesine basmadan sürükleyip bırakarak veya kopyalayıp yapıştırarak daha fazla görüntü ekleyebilirsiniz!',
    'vi-VN': 'Tính năng tải lên nhiều hình ảnh hiện đã được hềEtrợ! Bạn có thềEđánh giá tối đa 8 hình ảnh cùng một lúc!\nBạn cũng có thềEthêm hình ảnh bằng cách kéo và thả hoặc sao chép và dán mà không cần nhấn nút Xóa ảnh chụp màn hình!'
  };

  const titleTranslations = {
    'ja-JP': 'Taskbar Hero AI鑑定士',
    'en-US': 'Taskbar Hero AI Appraiser',
    'zh-Hans': 'Taskbar Hero AI 鉴定币E,
    'zh-Hant': 'Taskbar Hero AI 鑑定師',
    'ko-KR': 'Taskbar Hero AI �E�정사',
    'ru-RU': 'ИЁEосE�нщик Taskbar Hero',
    'es-ES': 'Tasador de IA de Taskbar Hero',
    'fr-FR': 'Évaluateur IA Taskbar Hero',
    'de-DE': 'Taskbar Hero KI-Gutachter',
    'pt-BR': 'Avaliador de IA do Taskbar Hero',
    'tr-TR': 'Taskbar Hero YZ Eksperi',
    'vi-VN': 'Chuyên gia thẩm định AI Taskbar Hero'
  };

  const descTranslations = {
    'ja-JP': '倉庫のスクリーンショチE��から即座に値段を見積もりまぁE,
    'en-US': 'Instantly appraise prices from your inventory screenshots.',
    'zh-Hans': '通迁E��库截图即时估算价格、E,
    'zh-Hant': '透過倉庫截圖即時估算�E格、E,
    'ko-KR': '�E��E�����E� �E�����E��E��E��E�E�E�시 �E��E��E�E�E�정합�E�다.',
    'ru-RU': 'Мгновенно осE�нивайте сE�нсEпо сE�риншотам вашего инвентарсE',
    'es-ES': 'Estima instantáneamente los precios desde las capturas de pantalla de tu inventario.',
    'fr-FR': 'Estimez instantanément les prix à partir des captures d\'écran de votre inventaire.',
    'de-DE': 'Schätzen Sie Preise sofort anhand von Screenshots Ihres Inventars.',
    'pt-BR': 'Estime instantaneamente os preços a partir das capturas de tela do seu inventário.',
    'tr-TR': 'Envanterinizin ekran görüntülerinden anında fiyat tahmini alın.',
    'vi-VN': 'Định giá ngay lập tức từ ảnh chụp màn hình kho đềEcủa bạn.'
  };

  const appraisingTranslations = {
    'ja-JP': '鑑定中...',
    'en-US': 'Appraising...',
    'zh-Hans': '正在鉴宁E..',
    'zh-Hant': '正在鑑宁E..',
    'ko-KR': '�E�적E�E�E..',
    'ru-RU': 'ОсE�нка...',
    'es-ES': 'Evaluando...',
    'fr-FR': 'Évaluation...',
    'de-DE': 'Schätzung...',
    'pt-BR': 'Avaliando...',
    'tr-TR': 'Değerlendiriliyor...',
    'vi-VN': 'Đang định giá...'
  };

  const pleaseWaitTranslations = {
    'ja-JP': 'し�Eらくお征E��ください',
    'en-US': 'Please wait a moment',
    'zh-Hans': '请稍筁E,
    'zh-Hant': '請稍倁E,
    'ko-KR': '�E��E�링E�E��E��E��E��E��E�E,
    'ru-RU': 'Подождите, пожалуйсE�а',
    'es-ES': 'Por favor espera un momento',
    'fr-FR': 'Veuillez patienter',
    'de-DE': 'Bitte warten Sie einen Moment',
    'pt-BR': 'Por favor, aguarde um momento',
    'tr-TR': 'Lütfen biraz bekleyin',
    'vi-VN': 'Vui lòng chềEtrong giây lát'
  };

  const clearScreenshotTranslations = {
    'en-US': 'Clear Screenshot',
    'ja-JP': '画像をクリア',
    'zh-Hans': '渁E��截图',
    'zh-Hant': '渁E��截圁E,
    'ko-KR': '�E�����E��E� �E��E��E�',
    'ru-RU': 'ОсE�сE�итсEсE�риншосE,
    'es-ES': 'Borrar captura',
    'fr-FR': 'Effacer la capture',
    'de-DE': 'Screenshot löschen',
    'pt-BR': 'Limpar captura',
    'tr-TR': 'Ekran Görüntüsünü Temizle',
    'vi-VN': 'Xóa ảnh chụp màn hình'
  };

  const uploadTitleTranslations = {
    'en-US': 'Drag & Drop or Paste (Ctrl+V) Screenshot',
    'ja-JP': 'スクリーンショチE��をドラチE���E�E��ロチE�Eまた�Eペ�EスチE(Ctrl+V)',
    'zh-Hans': '拖放或粘贴 (Ctrl+V) 截图',
    'zh-Hant': '拖放或貼丁E(Ctrl+V) 截圁E,
    'ko-KR': '�E�����E��E��E�E�E�래�E� �E� �E�롭���거�E�E�E�여�E��E� (Ctrl+V)',
    'ru-RU': 'Перетащите или всE�авьте (Ctrl+V) сE�риншосE,
    'es-ES': 'Arrastra y suelta o pega (Ctrl+V) la captura de pantalla',
    'fr-FR': 'Glissez-déposez ou collez (Ctrl+V) la capture d\'écran',
    'de-DE': 'Screenshot per Drag & Drop oder Einfügen (Strg+V) hinzufügen',
    'pt-BR': 'Arraste e solte ou cole (Ctrl+V) a captura de tela',
    'tr-TR': 'Ekran görüntüsünü Sürükleyip Bırakın veya Yapıştırın (Ctrl+V)',
    'vi-VN': 'Kéo & Thả hoặc Dán (Ctrl+V) ảnh chụp màn hình'
  };

  const uploadDescTranslations = {
    'en-US': 'Up to 8 images can be appraised simultaneously',
    'ja-JP': '8枚まで同時に鑑定可能',
    'zh-Hans': '最多可同时鉴宁E张图牁E,
    'zh-Hant': '最多可同時鑑宁E張圖片',
    'ko-KR': '�E�대 8�E��E�지 �E�시�E�E�E�적E�E��E�',
    'ru-RU': 'Возможна одновременнасEосE�нка до 8 изображений',
    'es-ES': 'Se pueden evaluar hasta 8 imágenes simultáneamente',
    'fr-FR': 'Jusqu\'à 8 images peuvent être évaluées simultanément',
    'de-DE': 'Bis zu 8 Bilder können gleichzeitig bewertet werden',
    'pt-BR': 'Até 8 imagens podem ser avaliadas simultaneamente',
    'tr-TR': 'Aynı anda 8 görüntüye kadar değerlendirme yapılabilir',
    'vi-VN': 'Có thềEđánh giá đồng thời tối đa 8 hình ảnh'
  };
  const cashoutAdTranslations = {
    'en-US': '💡 Tip: How to use or cash out your Steam Wallet balance',
    'ja-JP': '💡 Tips: SteamウォレチE��の換��術につぁE��',
    'zh-Hans': '💡 提示�E�如何使用或提现您的Steam钱匁E��颁E,
    'zh-Hant': '💡 提示�E�如何使用或提現您的Steam錢匁E��顁E,
    'ko-KR': '💡 ���E Steam �E��E�E�E�액 �E��E��E�E�E�E���E��화 �E��E�E,
    'ru-RU': '💡 СовесE Как исE�ользоватсEили вывесE�и сE�едсE�ва сE� Steam Wallet',
    'es-ES': '💡 Consejo: Cómo usar o retirar el saldo de tu Cartera de Steam',
    'fr-FR': '💡 Astuce : Comment utiliser ou retirer le solde de votre portefeuille Steam',
    'de-DE': '💡 Tipp: So nutzen oder auszahlen lassen Sie sich Ihr Steam-Guthaben',
    'pt-BR': '💡 Dica: Como usar ou sacar o saldo da sua Carteira Steam',
    'tr-TR': '💡 İpucu: Steam Cüzdan bakiyenizi nasıl kullanır veya nakde çevirirsiniz',
    'vi-VN': '💡 Mẹo: Cách sử dụng hoặc rút sềEdư Ví Steam'
  };

  const commentsTitleTranslations = {
    'ja-JP': '💬 コメント欁E, 'en-US': '💬 Comments Section', 'zh-Hans': '💬 证E��区',
    'zh-Hant': '💬 評論區', 'ko-KR': '💬 �E�글 �E��E�E, 'ru-RU': '💬 Раздел комментариев',
    'es-ES': '💬 Sección de comentarios', 'fr-FR': '💬 Section des commentaires', 
    'de-DE': '💬 Kommentarbereich', 'pt-BR': '💬 Seção de comentários', 
    'tr-TR': '💬 Yorumlar Bölümü', 'vi-VN': '💬 Phần bình luận'
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
              onChange={(e) => {
                setSelectedLang(e.target.value);
                if (typeof window !== 'undefined') localStorage.setItem('preferredLang', e.target.value);
              }}
              className={styles.langSelect}
              style={{
                background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px', borderRadius: '8px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="en-US" style={{background: '#1a1d24', color: 'white'}}>English</option>
              <option value="ja-JP" style={{background: '#1a1d24', color: 'white'}}>日本誁E/option>
              <option value="zh-Hans" style={{background: '#1a1d24', color: 'white'}}>简体中斁E/option>
              <option value="zh-Hant" style={{background: '#1a1d24', color: 'white'}}>繁E��中斁E/option>
              <option value="ko-KR" style={{background: '#1a1d24', color: 'white'}}>���국�E�</option>
              <option value="ru-RU" style={{background: '#1a1d24', color: 'white'}}>РусE�E�ий</option>
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

      {/* Notice Section */}
      <section style={{ 
        maxWidth: '1200px',
        margin: '20px auto', 
        padding: '20px 30px', 
        background: 'rgba(255, 87, 34, 0.1)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '16px',
        border: '1px solid rgba(255, 87, 34, 0.3)',
        textAlign: 'center'
      }}>
        {(() => {
          const noticeTrans = {
            title: { 
              'en-US': 'Notice', 
              'ja-JP': 'お知らせ',
              'zh-Hans': '通知',
              'zh-Hant': '通知',
              'ko-KR': '�E��E��E����',
              'ru-RU': 'Уведомление',
              'es-ES': 'Aviso',
              'fr-FR': 'Avis',
              'de-DE': 'Hinweis',
              'pt-BR': 'Aviso',
              'tr-TR': 'Duyuru',
              'vi-VN': 'Thông báo'
            },
            text: { 
              'en-US': 'Currently, there is an issue where the database is unstable and prices may not be displayed correctly. We apologize for the inconvenience, but please wait until it is restored.', 
              'ja-JP': '現在チE�Eタベ�Eスが不安定で金額が正しく表示されなぁE��ラーがあります。お手数ですが復旧までし�Eらくお征E��ください、E,
              'zh-Hans': '目前存在数据库不稳定导致价格无法正确显示皁E��误。给您带来不便�E�敬请谁E���E�请耐忁E��征E��复、E,
              'zh-Hant': '目前存在賁E��庫不穩定導�E價格無法正確顯示皁E��誤。給您帶侁E��便�E�敬請見諒，請耐忁E��征E��復、E,
              'ko-KR': '���E�� �E��E�����E��E��E��E� �E�안�E�하�E� �E��E��E� �E��E�르�E�E���시�E�지 �E�는 �E��E�가 �E�습�E�다. �E�편�E�E�E��E�E�E�려 �E�E�E���며 �E��E��E� �E�까지 �E��E�E�E��E��E� �E��E�기 �E�랍�E�다.',
              'ru-RU': 'ЁEнасE�оящее времсEсE�щесE�вуесEошибка, из-за которой база даннысEнесE�абильна и сE�нсEмогусEотображатьсE�Eнекорректно. ПриносE�м извиненисEза неудобсE�ва, пожалуйсE�а, подождите до восE�E�ановленисEработосE�осE�бносE�и.',
              'es-ES': 'Actualmente, hay un error donde la base de datos es inestable y los precios pueden no mostrarse correctamente. Nos disculpamos por las molestias y le rogamos que espere hasta que se restaure el servicio.',
              'fr-FR': 'Actuellement, il y a une erreur où la base de données est instable et les prix peuvent ne pas s\'afficher correctement. Nous nous excusons pour le désagrément et vous prions de bien vouloir patienter jusqu\'à ce que le service soit rétabli.',
              'de-DE': 'Derzeit gibt es einen Fehler, bei dem die Datenbank instabil ist und Preise möglicherweise nicht korrekt angezeigt werden. Wir entschuldigen uns für die Unannehmlichkeiten, bitte warten Sie, bis der Dienst wiederhergestellt ist.',
              'pt-BR': 'Atualmente, há um erro onde o banco de dados está instável e os preços podem não ser exibidos corretamente. Pedimos desculpas pelo inconveniente, por favor aguarde até que o serviço seja restaurado.',
              'tr-TR': 'Şu anda, veritabanının kararsız olduğu ve fiyatların doğru görüntülenemeyebileceği bir hata var. Verdiğimiz rahatsızlıktan dolayı özür dileriz, lütfen sistem onarılana kadar bekleyin.',
              'vi-VN': 'Hiện tại, có một lỗi khiến cơ sềEdữ liệu không ổn định và giá có thềEkhông được hiển thềEchính xác. Chúng tôi xin lỗi vì sự bất tiện này, vui lòng đợi cho đến khi dịch vụ được khôi phục.'
            }
          };
          
          return (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#ffcc80' }}>
                <span style={{ marginRight: '8px' }}>⚠�E�E/span>
                {noticeTrans.title[selectedLang] || noticeTrans.title['ja-JP']}
              </h2>
              <p style={{ color: 'white', lineHeight: '1.6' }}>
                {noticeTrans.text[selectedLang] || noticeTrans.text['ja-JP']}
              </p>
            </>
          );
        })()}
      </section>

      {/* Helpful Tip Banner for Cashout Guide (Test Server Only) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/cashout" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '8px 16px',
            textAlign: 'right',
            transition: 'background 0.2s, color 0.2s',
            cursor: 'pointer',
            display: 'inline-block'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {cashoutAdTranslations[selectedLang] || cashoutAdTranslations['en-US']}
            </span>
          </div>
        </Link>
      </div>

      <main className={styles.content}>
        {/* Left Side: Upload & Canvas */}
        <div 
          className={`glass-panel ${dragActive ? styles.dragActive : ''}`} 
          style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: (results.length > 0 || isScanning) ? '600px' : 'auto', transition: 'border 0.3s' }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div 
            className={styles.uploadZone}
            onClick={() => document.getElementById('fileInput').click()}
            style={{ display: (results.length > 0 || isScanning) ? 'none' : 'flex', pointerEvents: dragActive ? 'none' : 'auto' }}
          >
            <div className={styles.uploadIcon}>📥</div>
            <h3>{uploadTitleTranslations[selectedLang] || uploadTitleTranslations['en-US']}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              {uploadDescTranslations[selectedLang] || uploadDescTranslations['en-US']}
            </p>
            <input 
              type="file" 
              id="fileInput" 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg"
              multiple
              onChange={handleFileSelect} 
            />
          </div>

          <div 
            className={styles.canvasContainer} 
            style={{ 
              display: (previewImages.length > 0 || isScanning) ? 'grid' : 'none',
              gridTemplateColumns: `repeat(${previewImages.length === 1 ? 1 : previewImages.length <= 4 ? 2 : previewImages.length <= 6 ? 3 : 4}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${previewImages.length <= 2 ? 1 : 2}, minmax(0, 1fr))`,
              gap: '8px',
              padding: '8px',
              boxSizing: 'border-box'
            }}
          >
            {previewImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img src={img.src} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: '8px' }} alt={`Scanned screenshot ${idx + 1}`} />
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox={`0 0 ${img.width} ${img.height}`} preserveAspectRatio="xMidYMid meet">
                  {img.rects.map((rect, i) => (
                    <rect key={i} x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill="none" stroke="#00ff00" strokeWidth="2" />
                  ))}
                  {img.rects.map((rect, i) => (
                     <text key={`text-${i}`} x={rect.x + 2} y={rect.y + 14} fill="#00ff00" fontSize="14" fontFamily="sans-serif">
                       {rect.matchRate.toFixed(1)}%
                     </text>
                  ))}
                </svg>
              </div>
            ))}
            {isScanning && previewImages.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Scanning...
              </div>
            )}
          </div>
          <canvas ref={hiddenCanvasRef} style={{ display: 'none' }}></canvas>
          
          {results.length > 0 && (
            <button 
              onClick={() => {
                setResults([]);
                setPreviewImages([]);
              }} 
              style={{
                marginTop: '16px', width: '100%', padding: '12px', 
                background: 'var(--panel-bg)', border: '1px solid var(--panel-border)',
                color: 'white', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              {clearScreenshotTranslations[selectedLang] || clearScreenshotTranslations['en-US']}
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
              'en-US': 'Total Value:', 'ja-JP': '合計��顁E', 'zh-Hans': '总计金颁E', 'zh-Hant': '總計��顁E',
              'ko-KR': '�E�액:', 'ru-RU': 'ОбщасEсE�оимосE�сE', 'es-ES': 'Valor total:', 'fr-FR': 'Valeur totale:',
              'de-DE': 'Gesamtwert:', 'pt-BR': 'Valor total:', 'tr-TR': 'Toplam Değer:', 'vi-VN': 'Tổng giá trềE'
            };
            const totalLabel = totalLabels[selectedLang] || 'Total Value:';
            
            const addBtnTranslations = {
              'en-US': '➁EAdd Item Manually', 'ja-JP': '➁E手動でアイチE��を追加', 'zh-Hans': '➁E手动添加物品E,
              'zh-Hant': '➁E手動新增物品E, 'ko-KR': '➁E�E�동�E��E�E�E�E�����E�E�가', 'ru-RU': '➁EДобавитсEпредмесEврусE�усE,
              'es-ES': '➁EAñadir objeto manualmente', 'fr-FR': '➁EAjouter un objet manuellement',
              'de-DE': '➁EElement manuell hinzufügen', 'pt-BR': '➁EAdicionar item manualmente',
              'tr-TR': '➁EÖğeyi Manuel Ekle', 'vi-VN': '➁EThêm vật phẩm thủ công'
            };
            const addBtnLabel = addBtnTranslations[selectedLang] || '➁EAdd Item Manually';

            const sortPriceTranslations = {
              'ja-JP': '💰 金額頁E��ソーチE, 'en-US': '💰 Sort by Price', 'zh-Hans': '💰 按价格排庁E,
              'zh-Hant': '💰 按�E格排庁E, 'ko-KR': '💰 �E��E��E�E�E�렬', 'ru-RU': '💰 СортироватсEпо сE�не',
              'es-ES': '💰 Ordenar por precio', 'fr-FR': '💰 Trier par prix', 'de-DE': '💰 Nach Preis sortieren',
              'pt-BR': '💰 Ordenar por preço', 'tr-TR': '💰 Fiyata göre sırala', 'vi-VN': '💰 Sắp xếp theo giá'
            };
            const sortPriceLabel = sortPriceTranslations[selectedLang] || '💰 Sort by Price';
            
            const sortRestoreTranslations = {
              'ja-JP': '↺ 允E�E頁E��戻ぁE, 'en-US': '↺ Restore Order', 'zh-Hans': '↺ 恢复原庁E,
              'zh-Hant': '↺ 恢復原庁E, 'ko-KR': '↺ �E�래 �E��E�E�E, 'ru-RU': '↺ ВосE�E�ановитсEпорядок',
              'es-ES': '↺ Restaurar orden', 'fr-FR': '↺ Restaurer l\'ordre', 'de-DE': '↺ Reihenfolge wiederherstellen',
              'pt-BR': '↺ Restaurar ordem', 'tr-TR': '↺ Sırayı geri yükle', 'vi-VN': '↺ Khôi phục thứ tự'
            };
            const sortRestoreLabel = sortRestoreTranslations[selectedLang] || '↺ Restore Order';

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
                    results
                      .map((item, originalIdx) => ({ item, originalIdx }))
                      .sort((a, b) => {
                        if (!isSortedByPrice) return 0;
                        const getPrice = (item) => {
                          if (!prices) return 0;
                          const names = itemNames[item.name] || {};
                          const englishName = names['en-US'] || item.name.replace('.png', '');
                          
                          let marketData = null;
                          if (prices[englishName]) {
                            marketData = prices[englishName];
                          } else if (item.rarity && item.rarity !== 'UNKNOWN') {
                            const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                            const prefix = `${englishName} (${rarityStr})`;
                            if (prices[`${prefix} A`]) marketData = prices[`${prefix} A`];
                            else {
                              const matchedKey = Object.keys(prices).find(k => k.startsWith(prefix));
                              if (matchedKey) marketData = prices[matchedKey];
                            }
                          }
                          
                          if (marketData) {
                            return marketData.medianCents || marketData.priceCents || marketData.lowestCents || 0;
                          }
                          return 0;
                        };
                        return getPrice(b.item) - getPrice(a.item);
                      })
                      .map(({ item, originalIdx: idx }) => {
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
                        'en-US': 'Recent Sold:', 'ja-JP': '直近�E取弁E', 'zh-Hans': '最近交昁E', 'zh-Hant': '最近交昁E',
                        'ko-KR': '�E�근 �E��E�E', 'ru-RU': 'ПосE�еднясEпродажа:', 'es-ES': 'Última venta:', 'fr-FR': 'Dernière vente:',
                        'de-DE': 'Zuletzt verkauft:', 'pt-BR': 'Última venda:', 'tr-TR': 'Son satıŁE', 'vi-VN': 'Đã bán gần đây:'
                      };
                      const recentSoldLabel = labelTranslations[selectedLang] || 'Recent Sold:';

                      const lowestLabelTranslations = {
                        'en-US': 'Lowest Listing:', 'ja-JP': '最低�E品E', 'zh-Hans': '最低上架:', 'zh-Hant': '最低上架:',
                        'ko-KR': '�E�저�E�:', 'ru-RU': 'СамасEнизкасEсE�на:', 'es-ES': 'Listado más bajo:', 'fr-FR': 'Liste la plus basse:',
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
                                rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} 
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
                            >✁E/button>
                            <button 
                              onClick={() => removeItem(idx)}
                              title="Remove"
                              style={{ background: 'rgba(244,67,54,0.1)', border: 'none', color: '#f44336', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                            >✁E/button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {results.length > 0 && (
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                    
                    <button 
                      onClick={() => setIsSortedByPrice(!isSortedByPrice)}
                      style={{ 
                        background: isSortedByPrice ? 'rgba(255, 152, 0, 0.2)' : 'rgba(33, 150, 243, 0.2)', 
                        border: isSortedByPrice ? '1px dashed rgba(255, 152, 0, 0.5)' : '1px dashed rgba(33, 150, 243, 0.5)', 
                        color: isSortedByPrice ? '#ffb74d' : '#64b5f6', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
                        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = isSortedByPrice ? 'rgba(255, 152, 0, 0.3)' : 'rgba(33, 150, 243, 0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.background = isSortedByPrice ? 'rgba(255, 152, 0, 0.2)' : 'rgba(33, 150, 243, 0.2)'}
                    >
                      {isSortedByPrice ? sortRestoreLabel : sortPriceLabel}
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
            title: { 'en-US': 'How to Use', 'ja-JP': '使ぁE��', 'zh-Hans': '使用方況E, 'zh-Hant': '使用方況E, 'ko-KR': '�E��E� �E��E�E, 'ru-RU': 'Как исE�ользоватсE, 'es-ES': 'Cómo usar', 'fr-FR': 'Comment utiliser', 'de-DE': 'Wie man es benutzt', 'pt-BR': 'Como usar', 'tr-TR': 'Nasıl Kullanılır', 'vi-VN': 'Cách sử dụng' },
            step1: { 'en-US': '1. Take a screenshot of your in-game inventory.', 'ja-JP': '1. ゲーム冁E��インベントリ�E�アイチE��欁E���EスクリーンショチE��を撮影します、E, 'zh-Hans': '1. 在游戏中截取您皁E��品栏、E, 'zh-Hant': '1. 在遊戲中截取您皁E��品欁E��E, 'ko-KR': '1. �E�임 �E� �E��E�����E��E�E�E�����E��E��E�E�E�습�E�다.', 'ru-RU': '1. Сделайте сE�риншосEвашего инвентарсEв игре.', 'es-ES': '1. Toma una captura de pantalla de tu inventario en el juego.', 'fr-FR': '1. Prenez une capture d\'écran de votre inventaire en jeu.', 'de-DE': '1. Mache einen Screenshot deines Inventars im Spiel.', 'pt-BR': '1. Tire uma captura de tela do seu inventário no jogo.', 'tr-TR': '1. Oyun içi envanterinizin ekran görüntüsünü alın.', 'vi-VN': '1. Chụp ảnh màn hình kho đềEtrong trò chơi của bạn.' },
            step2: { 'en-US': '2. Drag & drop the image into the scanner above.', 'ja-JP': '2. 撮影した画像を上�Eスキャナ�EにドラチE���E�E��ロチE�Eします、E, 'zh-Hans': '2. 封E��牁E��放到上方皁E��描仪中、E, 'zh-Hant': '2. 封E��牁E��放到上方皁E��描儀中、E, 'ko-KR': '2. �E��E��E��E� �E�E�E��E�너�E�E�E�래�E� �E� �E�롭����E�다.', 'ru-RU': '2. Перетащите изображение в сE�анер выше.', 'es-ES': '2. Arrastra y suelta la imagen en el escáner de arriba.', 'fr-FR': '2. Glissez-déposez l\'image dans le scanner ci-dessus.', 'de-DE': '2. Ziehe das Bild per Drag & Drop in den Scanner oben.', 'pt-BR': '2. Arraste e solte a imagem no scanner acima.', 'tr-TR': '2. Resmi yukarıdaki tarayıcıya sürükleyip bırakın.', 'vi-VN': '2. Kéo và thả hình ảnh vào máy quét ềEtrên.' },
            example: { 'en-US': '💡 Example: Make sure the image looks like this for the best accuracy!', 'ja-JP': '💡 侁E 以下�Eような綺麗に枠が�Eった画像だと、最も正確に認識できます！E, 'zh-Hans': '💡 示例：像这样渁E��皁E��图可以获得最高的证E��凁E��玁E��E, 'zh-Hant': '💡 示例：像這樣渁E��皁E��圖可以獲得最高的識別準確玁E��E, 'ko-KR': '💡 �E�시: �E��E� �E�의 �E�끔���E�E�����E��E��E� �E��E� �E�확���겁E�E��E�됩�E�다!', 'ru-RU': '💡 Пример: УбедитесE�E сE�о изображение выглядисEтак длсEлусE�ей тосE�осE�и!', 'es-ES': '💡 Ejemplo: ¡Asegúrate de que la imagen se vea así para obtener la mejor precisión!', 'fr-FR': '💡 Exemple: Assurez-vous que l\'image ressemble à ceci pour une meilleure précision!', 'de-DE': '💡 Beispiel: Stelle sicher, dass das Bild so aussieht, um die beste Genauigkeit zu erzielen!', 'pt-BR': '💡 Exemplo: Certifique-se de que a imagem seja assim para melhor precisão!', 'tr-TR': '💡 Örnek: En iyi doğruluk için görüntünün böyle göründüğünden emin olun!', 'vi-VN': '💡 Ví dụ: Đảm bảo hình ảnh giống như thế này đềEcó đềEchính xác tốt nhất!' }
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
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {commentsTitleTranslations[selectedLang] || commentsTitleTranslations['en-US']}
        </h2>
        
        {replyingToId && (
          <div style={{ fontSize: '0.8rem', color: '#ff9800', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Replying to a comment...</span>
            <button type="button" onClick={() => setReplyingToId(null)} style={{ background: 'none', border: 'none', color: '#ff9800', cursor: 'pointer', textDecoration: 'underline' }}>Cancel Reply</button>
          </div>
        )}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {isCommentsLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
              <div className={styles.spinner} style={{ margin: '0 auto 12px auto', width: '24px', height: '24px', borderTopColor: '#2196f3' }}></div>
              Loading comments... / コメントを読み込み中...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
              No comments yet. Be the first to share your scan results!
            </div>
          ) : (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEndComments}
            >
              <SortableContext 
                items={comments.map(c => c.id)} 
                strategy={verticalListSortingStrategy}
              >
                {comments.map((comment) => (
                  <SortableComment 
                    key={comment.id} 
                    comment={comment} 
                    isAdminSecret={isAdminSecret} 
                    deleteComment={deleteComment} 
                    selectedLang={selectedLang}
                    handleReply={handleReply}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
