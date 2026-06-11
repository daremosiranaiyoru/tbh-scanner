'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { loadDatabase, scanIcons } from '../lib/ocr-engine';
import itemNames from '../public/item_names.json';
import html2canvas from 'html2canvas';

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
          🗑️
        </button>
      )}
      <button 
        onClick={() => handleReply(comment.id)}
        style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}
        title="Reply"
      >
        ↩️
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const commentsLoadedRef = useRef(false);
  const [isFlashing, setIsFlashing] = useState(false); // cache: fetch only on first open
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
    
    // Fetch prices on load; comments are fetched lazily on first open
    const loadData = async () => {
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
        showToast("コメントを投稿しました！");
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
      showToast("エンジンの起動とデータベースの構築を待っています...");
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
      const currentOffset = allResults.length - fileDisplayResults.length;
      currentPreviewImages[offset + i].rects = fileDisplayResults.map((r, idx) => ({ ...r.rect, matchRate: r.matchRate, originalIdx: currentOffset + idx }));
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

  const handleCopyToClipboard = (totalString) => {
    try {
      const captureMsgs = {
        'en-US': '📸 Capturing screen...',
        'ja-JP': '📸 画面をキャプチャ中...',
        'zh-Hans': '📸 正在截取屏幕...',
        'zh-Hant': '📸 正在擷取畫面...',
        'ko-KR': '📸 화면 캡처 중...',
        'ru-RU': '📸 Захват экрана...',
        'es-ES': '📸 Capturando pantalla...',
        'fr-FR': '📸 Capture de l\'écran...',
        'de-DE': '📸 Bildschirm wird erfasst...',
        'pt-BR': '📸 Capturando a tela...',
        'tr-TR': '📸 Ekran yakalanıyor...',
        'vi-VN': '📸 Đang chụp màn hình...'
      };
      showToast(captureMsgs[selectedLang] || captureMsgs['en-US']);
      
      // Trigger flash effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 800);
      
      const captureElement = document.getElementById('capture-area');
      if (!captureElement) throw new Error("Capture area not found");
      
      const generateImageBlob = async () => {
        const captureElement = document.getElementById('capture-area');
        const canvas = await html2canvas(captureElement, {
          backgroundColor: '#1a1d24',
          scale: 1, // Set to 1 so the copied image size is exactly what is seen on screen
          useCORS: true,
          logging: false
        });
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      };
      
      // Build plain text for text pasting
      const plainTextTotalMsgs = {
        'en-US': `💰 My Taskbar Hero inventory total value was ${totalString}!\n`,
        'ja-JP': `💰 私のTaskbar Heroインベントリ総資産は ${totalString} でした！\n`,
        'zh-Hans': `💰 我的 Taskbar Hero 物品库总价值为 ${totalString}！\n`,
        'zh-Hant': `💰 我的 Taskbar Hero 物品庫總價值為 ${totalString}！\n`,
        'ko-KR': `💰 내 Taskbar Hero 인벤토리 총 가치는 ${totalString}였습니다!\n`,
        'ru-RU': `💰 Общая стоимость моего инвентаря Taskbar Hero составила ${totalString}!\n`,
        'es-ES': `💰 ¡El valor total de mi inventario de Taskbar Hero fue ${totalString}!\n`,
        'fr-FR': `💰 La valeur totale de mon inventaire Taskbar Hero était de ${totalString} !\n`,
        'de-DE': `💰 Der Gesamtwert meines Taskbar Hero-Inventars betrug ${totalString}!\n`,
        'pt-BR': `💰 O valor total do meu inventário do Taskbar Hero foi ${totalString}!\n`,
        'tr-TR': `💰 Taskbar Hero envanterimin toplam değeri ${totalString} idi!\n`,
        'vi-VN': `💰 Tổng giá trị kho đồ Taskbar Hero của tôi là ${totalString}!\n`
      };
      
      let plainText = plainTextTotalMsgs[selectedLang] || plainTextTotalMsgs['en-US'];
      plainText += `https://tbh-scanner.vercel.app\n\n`;
      results.slice(0, 10).forEach(r => {
          const names = itemNames[r.name] || {};
          const displayName = names[selectedLang] || names['en-US'] || r.name.replace('.png', '');
          plainText += `- ${displayName}\n`;
      });
      if (results.length > 10) {
        const othersMsgs = {
          'en-US': `...and ${results.length - 10} other items\n`,
          'ja-JP': `...他 ${results.length - 10} アイテム\n`,
          'zh-Hans': `...及其他 ${results.length - 10} 件物品\n`,
          'zh-Hant': `...及其他 ${results.length - 10} 件物品\n`,
          'ko-KR': `...외 ${results.length - 10}개 아이템\n`,
          'ru-RU': `...и еще ${results.length - 10} предметов\n`,
          'es-ES': `...y otros ${results.length - 10} objetos\n`,
          'fr-FR': `...et ${results.length - 10} autres objets\n`,
          'de-DE': `...und ${results.length - 10} weitere Gegenstände\n`,
          'pt-BR': `...e outros ${results.length - 10} itens\n`,
          'tr-TR': `...ve ${results.length - 10} diğer öğe\n`,
          'vi-VN': `...và ${results.length - 10} vật phẩm khác\n`
        };
        plainText += othersMsgs[selectedLang] || othersMsgs['en-US'];
      }
      
      // Pass Promises directly to ClipboardItem so the browser doesn't block the async clipboard write
      navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': Promise.resolve(new Blob([plainText], { type: 'text/plain' })),
          'image/png': generateImageBlob()
        })
      ]).then(() => {
        const successMsgs = {
          'en-US': '✅ Copied the result! Paste with Ctrl+V',
          'ja-JP': '✅ 結果をコピーしました。Ctrl+Vで貼り付け',
          'zh-Hans': '✅ 结果已复制！按 Ctrl+V 粘贴',
          'zh-Hant': '✅ 結果已複製！按 Ctrl+V 貼上',
          'ko-KR': '✅ 결과를 복사했습니다! Ctrl+V로 붙여넣으세요',
          'ru-RU': '✅ Результат скопирован! Вставьте с помощью Ctrl+V',
          'es-ES': '✅ ¡Resultado copiado! Pegue con Ctrl+V',
          'fr-FR': '✅ Résultat copié ! Collez avec Ctrl+V',
          'de-DE': '✅ Ergebnis kopiert! Mit Strg+V einfügen',
          'pt-BR': '✅ Resultado copiado! Cole com Ctrl+V',
          'tr-TR': '✅ Sonuç kopyalandı! Ctrl+V ile yapıştırın',
          'vi-VN': '✅ Đã sao chép kết quả! Dán bằng Ctrl+V'
        };
        showToast(successMsgs[selectedLang] || successMsgs['en-US']);
      }).catch(err => {
        console.error(err);
        const failMsgs = {
          'en-US': '❌ Copy failed: ',
          'ja-JP': '❌ コピー失敗: ',
          'zh-Hans': '❌ 复制失败: ',
          'zh-Hant': '❌ 複製失敗: ',
          'ko-KR': '❌ 복사 실패: ',
          'ru-RU': '❌ Ошибка копирования: ',
          'es-ES': '❌ Error al copiar: ',
          'fr-FR': '❌ Échec de la copie : ',
          'de-DE': '❌ Kopieren fehlgeschlagen: ',
          'pt-BR': '❌ Falha ao copiar: ',
          'tr-TR': '❌ Kopyalama başarısız: ',
          'vi-VN': '❌ Sao chép thất bại: '
        };
        showToast((failMsgs[selectedLang] || failMsgs['en-US']) + err.message);
      });
      
    } catch (err) {
      console.error(err);
      const failMsgs = {
        'en-US': '❌ Copy failed: ',
        'ja-JP': '❌ コピー失敗: ',
        'zh-Hans': '❌ 复制失败: ',
        'zh-Hant': '❌ 複製失敗: ',
        'ko-KR': '❌ 복사 실패: ',
        'ru-RU': '❌ Ошибка копирования: ',
        'es-ES': '❌ Error al copiar: ',
        'fr-FR': '❌ Échec de la copie : ',
        'de-DE': '❌ Kopieren fehlgeschlagen: ',
        'pt-BR': '❌ Falha ao copiar: ',
        'tr-TR': '❌ Kopyalama başarısız: ',
        'vi-VN': '❌ Sao chép thất bại: '
      };
      showToast((failMsgs[selectedLang] || failMsgs['en-US']) + err.message);
    }
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
    'en-US': 'Update: You can now click on an item\'s icon in the scanned image to instantly view its information!',
    'ja-JP': 'アップデート：スキャン画像からアイテムのアイコンをクリックすると即座にそのアイテムの情報が表示されるようになりました！',
    'zh-Hans': '更新：现在点击扫描图像中的物品图标，即可立即查看该物品的信息！',
    'zh-Hant': '更新：現在點擊掃描圖像中的物品圖示，即可立即查看該物品的資訊！',
    'ko-KR': '업데이트: 스캔한 이미지에서 아이템 아이콘을 클릭하면 즉시 해당 아이템 정보를 볼 수 있습니다!',
    'ru-RU': 'Обновление: теперь вы можете нажать на значок предмета на отсканированном изображении, чтобы мгновенно просмотреть информацию о нем!',
    'es-ES': 'Actualización: ¡Ahora puedes hacer clic en el ícono de un elemento en la imagen escaneada para ver instantáneamente su información!',
    'fr-FR': 'Mise à jour : vous pouvez désormais cliquer sur l\'icône d\'un objet dans l\'image numérisée pour afficher instantanément ses informations !',
    'de-DE': 'Update: Sie können jetzt auf das Symbol eines Elements im gescannten Bild klicken, um dessen Informationen sofort anzuzeigen!',
    'pt-BR': 'Atualização: Agora você pode clicar no ícone de um item na imagem digitalizada para ver instantaneamente suas informações!',
    'tr-TR': 'Güncelleme: Artık taranan görüntüdeki bir öğenin simgesine tıklayarak bilgilerini anında görüntüleyebilirsiniz!',
    'vi-VN': 'Cập nhật: Giờ đây, bạn có thể nhấp vào biểu tượng của một mục trong hình ảnh được quét để xem ngay thông tin của mục đó!'
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

  const clearScreenshotTranslations = {
    'en-US': 'Clear Screenshot',
    'ja-JP': '画像をクリア',
    'zh-Hans': '清除截图',
    'zh-Hant': '清除截圖',
    'ko-KR': '스크린샷 지우기',
    'ru-RU': 'Очистить скриншот',
    'es-ES': 'Borrar captura',
    'fr-FR': 'Effacer la capture',
    'de-DE': 'Screenshot löschen',
    'pt-BR': 'Limpar captura',
    'tr-TR': 'Ekran Görüntüsünü Temizle',
    'vi-VN': 'Xóa ảnh chụp màn hình'
  };

  const uploadTitleTranslations = {
    'en-US': 'Drag & Drop or Paste (Ctrl+V) Screenshot',
    'ja-JP': 'スクリーンショットをドラッグ＆ドロップまたはペースト (Ctrl+V)',
    'zh-Hans': '拖放或粘贴 (Ctrl+V) 截图',
    'zh-Hant': '拖放或貼上 (Ctrl+V) 截圖',
    'ko-KR': '스크린샷을 드래그 앤 드롭하거나 붙여넣기 (Ctrl+V)',
    'ru-RU': 'Перетащите или вставьте (Ctrl+V) скриншот',
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
    'zh-Hans': '最多可同时鉴定8张图片',
    'zh-Hant': '最多可同時鑑定8張圖片',
    'ko-KR': '최대 8장까지 동시에 감정 가능',
    'ru-RU': 'Возможна одновременная оценка до 8 изображений',
    'es-ES': 'Se pueden evaluar hasta 8 imágenes simultáneamente',
    'fr-FR': 'Jusqu\'à 8 images peuvent être évaluées simultanément',
    'de-DE': 'Bis zu 8 Bilder können gleichzeitig bewertet werden',
    'pt-BR': 'Até 8 imagens podem ser avaliadas simultaneamente',
    'tr-TR': 'Aynı anda 8 görüntüye kadar değerlendirme yapılabilir',
    'vi-VN': 'Có thể đánh giá đồng thời tối đa 8 hình ảnh'
  };
  const cashoutAdTranslations = {
    'en-US': '💡 Tip: How to use or cash out your Steam Wallet balance',
    'ja-JP': '💡 Tips: Steamウォレットの現金化について',
    'zh-Hans': '💡 提示：如何使用或提现您的Steam钱包余额',
    'zh-Hant': '💡 提示：如何使用或提現您的Steam錢包餘額',
    'ko-KR': '💡 팁: Steam 지갑 잔액 사용처 및 현금화 방법',
    'ru-RU': '💡 Совет: Как использовать или вывести средства со Steam Wallet',
    'es-ES': '💡 Consejo: Cómo usar o retirar el saldo de tu Cartera de Steam',
    'fr-FR': '💡 Astuce : Comment utiliser ou retirer le solde de votre portefeuille Steam',
    'de-DE': '💡 Tipp: So nutzen oder auszahlen lassen Sie sich Ihr Steam-Guthaben',
    'pt-BR': '💡 Dica: Como usar ou sacar o saldo da sua Carteira Steam',
    'tr-TR': '💡 İpucu: Steam Cüzdan bakiyenizi nasıl kullanır veya nakde çevirirsiniz',
    'vi-VN': '💡 Mẹo: Cách sử dụng hoặc rút số dư Ví Steam'
  };

  const kofiSmallTrans = {
    'en-US': 'Support Server Costs',
    'ja-JP': 'サーバー代ご支援のお願い',
    'zh-Hans': '支持服务器费用',
    'zh-Hant': '支持伺服器費用',
    'ko-KR': '서버 비용 후원',
    'ru-RU': 'Поддержать сервер',
    'es-ES': 'Apoyar servidor',
    'fr-FR': 'Soutenir le serveur',
    'de-DE': 'Server unterstützen',
    'pt-BR': 'Apoiar servidor',
    'tr-TR': 'Sunucuyu destekle',
    'vi-VN': 'Hỗ trợ máy chủ'
  };

  const commentsTitleTranslations = {
    'ja-JP': '💬 コメント欄', 'en-US': '💬 Comments Section', 'zh-Hans': '💬 评论区',
    'zh-Hant': '💬 評論區', 'ko-KR': '💬 댓글 섹션', 'ru-RU': '💬 Раздел комментариев',
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
              'ko-KR': '공지사항',
              'ru-RU': 'Уведомление',
              'es-ES': 'Aviso',
              'fr-FR': 'Avis',
              'de-DE': 'Hinweis',
              'pt-BR': 'Aviso',
              'tr-TR': 'Duyuru',
              'vi-VN': 'Thông báo'
            },
            text: { 
              'en-US': 'Due to the market currently being unavailable for listings, many items are sold out and will display as No Data. Also, the price labeled as "Recent Transaction" is temporarily displaying the current lowest listing price, which may differ greatly from actual market value. Please wait until the market reopens.', 
              'ja-JP': '現在マーケットで出品が不可になっている影響で多くのアイテムが売り切れており、それらの値段はNo Dataと表示されます。また直近の取引と書かれている値段も応急的に現在の最低出品額を表示しており、実態から大きくかけ離れています。マーケットが再開するまで今しばらくお待ちください。',
              'zh-Hans': '由于目前市场无法上架物品，许多物品已售罄，其价格将显示为 No Data。此外，标为“最近交易”的价格目前暂时显示的是最低上架价格，可能与实际价值相差甚远。请耐心等待市场重新开放。',
              'zh-Hant': '由於目前市場無法上架物品，許多物品已售罄，其價格將顯示為 No Data。此外，標為「最近交易」的價格目前暫時顯示的是最低上架價格，可能與實際價值相差甚遠。請耐心等待市場重新開放。',
              'ko-KR': '현재 마켓에 아이템을 등록할 수 없는 관계로 많은 아이템이 품절되어 No Data로 표시됩니다. 또한 "최근 거래"라고 표시된 가격은 임시로 현재 최저 등록 가격을 표시하고 있어 실제 가치와 크게 다를 수 있습니다. 마켓이 다시 열릴 때까지 기다려 주시기 바랍니다.',
              'ru-RU': 'В связи с тем, что в настоящее время выставление предметов на Торговой площадке недоступно, многие предметы распроданы, и их цена отображается как No Data. Кроме того, цена, указанная как «Последняя сделка», временно отображает текущую минимальную цену выставления, что может сильно отличаться от реальной стоимости. Пожалуйста, подождите, пока Торговая площадка не откроется снова.',
              'es-ES': 'Debido a que actualmente no se pueden publicar artículos en el mercado, muchos artículos están agotados y su precio se muestra como No Data. Además, el precio marcado como "Transacción reciente" muestra temporalmente el precio de publicación más bajo actual, lo cual puede diferir enormemente del valor real. Por favor, espere hasta que el mercado vuelva a abrir.',
              'fr-FR': 'En raison de l\'impossibilité actuelle de lister des objets sur le marché, de nombreux objets sont en rupture de stock et leur prix est affiché comme No Data. De plus, le prix indiqué comme "Transaction récente" affiche temporairement le prix de mise en vente actuel le plus bas, ce qui peut différer grandement de la valeur réelle. Veuillez patienter jusqu\'à la réouverture du marché.',
              'de-DE': 'Da das Einstellen von Gegenständen auf dem Markt derzeit nicht möglich ist, sind viele Artikel ausverkauft und ihr Preis wird als No Data angezeigt. Außerdem zeigt der als "Letzte Transaktion" gekennzeichnete Preis vorübergehend den aktuell niedrigsten Angebotspreis an, der stark vom tatsächlichen Wert abweichen kann. Bitte warten Sie, bis der Markt wieder öffnet.',
              'pt-BR': 'Devido à impossibilidade atual de listar itens no mercado, muitos itens estão esgotados e seu preço é exibido como No Data. Além disso, o preço marcado como "Transação recente" exibe temporariamente o menor preço de listagem atual, o que pode diferir muito do valor real. Por favor, aguarde até que o mercado reabra.',
              'tr-TR': 'Şu anda pazarda eşya listelemek mümkün olmadığından, birçok eşya tükenmiştir ve fiyatları No Data olarak görüntülenir. Ayrıca, "Son İşlem" olarak belirtilen fiyat, geçici olarak mevcut en düşük listeleme fiyatını göstermektedir ve bu durum gerçek değerden büyük ölçüde farklı olabilir. Lütfen pazar yeniden açılana kadar bekleyin.',
              'vi-VN': 'Do hiện tại không thể đăng bán vật phẩm trên chợ, nhiều vật phẩm đã hết hàng và giá của chúng được hiển thị là No Data. Ngoài ra, giá được dán nhãn "Giao dịch gần đây" tạm thời hiển thị giá đăng bán thấp nhất hiện tại, điều này có thể khác xa so với giá trị thực tế. Vui lòng đợi cho đến khi chợ mở cửa trở lại.'
            }
          };
          
          return (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#ffcc80' }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                {noticeTrans.title[selectedLang] || noticeTrans.title['ja-JP']}
              </h2>
              <p style={{ color: 'white', lineHeight: '1.6' }}>
                {noticeTrans.text[selectedLang] || noticeTrans.text['ja-JP']}
              </p>
            </>
          );
        })()}
      </section>

      {/* Helpful Tip Banner & Ko-fi Support */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        
        {/* Left Spacer to ensure perfect centering */}
        <div style={{ flex: 1 }}></div>

        {/* Center: Tips Banner */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link href="/cashout" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(76, 175, 80, 0.15)',
              border: '1px solid rgba(76, 175, 80, 0.4)',
              borderRadius: '20px',
              padding: '8px 16px',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer',
              display: 'inline-block',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(76, 175, 80, 0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ color: '#81c784', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                {cashoutAdTranslations[selectedLang] || cashoutAdTranslations['en-US']}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Small Ko-fi Link */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <a 
            href="https://ko-fi.com/tbh_scanner" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255, 183, 77, 0.1)', color: '#ffb74d', textDecoration: 'none',
              padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold',
              border: '1px solid rgba(255, 183, 77, 0.3)', transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(255, 183, 77, 0.1)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 183, 77, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 183, 77, 0.1)'; e.currentTarget.style.transform = 'none'; }}
          >
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" style={{ width: '16px' }} />
            {kofiSmallTrans[selectedLang] || kofiSmallTrans['en-US']}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes capture-flash {
          0% { box-shadow: inset 0 0 0 0 rgba(255,255,255,0.8); background: rgba(255,255,255,0.2); }
          10% { box-shadow: inset 0 0 20px 20px rgba(255,255,255,0.9); background: rgba(255,255,255,0.4); }
          100% { box-shadow: inset 0 0 0 0 rgba(255,255,255,0); background: transparent; }
        }
      `}</style>

      <main id="capture-area" className={styles.content} style={{ position: 'relative', borderRadius: '16px' }}>
        {isFlashing && (
          <div 
            data-html2canvas-ignore="true"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none', zIndex: 9999,
              animation: 'capture-flash 0.8s ease-out',
              borderRadius: 'inherit'
            }}
          />
        )}
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
                <div 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundImage: 'url(' + img.src + ')', 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'center', 
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '8px'
                  }} 
                  aria-label={"Scanned screenshot " + (idx + 1)} 
                />
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox={`0 0 ${img.width} ${img.height}`} preserveAspectRatio="xMidYMid meet">
                  {img.rects.map((rect, i) => (
                    <g 
                      key={i}
                      style={{ cursor: 'pointer', pointerEvents: 'all' }}
                      onClick={() => {
                        const el = document.getElementById('scanned-item-' + rect.originalIdx);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      <rect 
                        x={rect.x} y={rect.y} width={rect.width} height={rect.height} 
                        fill="transparent" stroke="#00ff00" strokeWidth="2" 
                      />
                      <text x={rect.x + 2} y={rect.y + 14} fill="#00ff00" fontSize="14" fontFamily="sans-serif">
                        {rect.matchRate.toFixed(1)}%
                      </text>
                    </g>
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
                if (!item.name.startsWith('Item_') && item.rarity && item.rarity !== 'UNKNOWN') {
                  const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                  const prefix = `${englishName} (${rarityStr})`;
                  if (prices[`${prefix} A`]) marketData = prices[`${prefix} A`];
                  else {
                    const matchedKey = Object.keys(prices).find(k => k.startsWith(prefix));
                    if (matchedKey) marketData = prices[matchedKey];
                  }
                }
                
                // Fallback to base name if rarity check didn't yield marketData
                if (!marketData && prices[englishName]) {
                  marketData = prices[englishName];
                }
              }
              if (marketData) {
                let cents = marketData.medianCents || marketData.priceCents;
                if (!cents) {
                  if (marketData.lowestCents > 0 && marketData.buyOrderCents > 0) cents = (marketData.lowestCents + marketData.buyOrderCents) / 2;
                  else cents = marketData.lowestCents || marketData.buyOrderCents || 0;
                }
                if (cents > 0) totalCents += cents;
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

            const sortPriceTranslations = {
              'ja-JP': '💰 金額順でソート', 'en-US': '💰 Sort by Price', 'zh-Hans': '💰 按价格排序',
              'zh-Hant': '💰 按價格排序', 'ko-KR': '💰 가격순 정렬', 'ru-RU': '💰 Сортировать по цене',
              'es-ES': '💰 Ordenar por precio', 'fr-FR': '💰 Trier par prix', 'de-DE': '💰 Nach Preis sortieren',
              'pt-BR': '💰 Ordenar por preço', 'tr-TR': '💰 Fiyata göre sırala', 'vi-VN': '💰 Sắp xếp theo giá'
            };
            const sortPriceLabel = sortPriceTranslations[selectedLang] || '💰 Sort by Price';
            
            const sortRestoreTranslations = {
              'ja-JP': '↺ 元の順に戻す', 'en-US': '↺ Restore Order', 'zh-Hans': '↺ 恢复原序',
              'zh-Hant': '↺ 恢復原序', 'ko-KR': '↺ 원래 순서로', 'ru-RU': '↺ Восстановить порядок',
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
                      onClick={() => handleCopyToClipboard(localizedTotal)}
                      style={{
                        marginLeft: 'auto', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.2)',
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy to Clipboard
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
                          if (!item.name.startsWith('Item_') && item.rarity && item.rarity !== 'UNKNOWN') {
                            const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                            const prefix = `${englishName} (${rarityStr})`;
                            if (prices[`${prefix} A`]) marketData = prices[`${prefix} A`];
                            else {
                              const matchedKey = Object.keys(prices).find(k => k.startsWith(prefix));
                              if (matchedKey) marketData = prices[matchedKey];
                            }
                          }
                          
                          // Fallback to base name if rarity check didn't yield marketData
                          if (!marketData && prices[englishName]) {
                            marketData = prices[englishName];
                          }
                          
                          if (marketData) {
                            let pc = marketData.medianCents || marketData.priceCents;
                            if (!pc) {
                              if (marketData.lowestCents > 0 && marketData.buyOrderCents > 0) pc = (marketData.lowestCents + marketData.buyOrderCents) / 2;
                              else pc = marketData.lowestCents || marketData.buyOrderCents || 0;
                            }
                            return pc;
                          }
                          return 0;
                        };
                        return getPrice(b.item) - getPrice(a.item);
                      })
                      .map(({ item, originalIdx: idx }) => {
                      if (editingIndex === idx) {
                        return (
                          <div key={idx} id={"scanned-item-" + idx} className={styles.itemRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', background: 'rgba(33, 150, 243, 0.1)' }}>
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
                        'en-US': 'Lowest Sell Amount:', 'ja-JP': '最低売却額:', 'zh-Hans': '最低出售额:', 'zh-Hant': '最低出售額:',
                        'ko-KR': '최저 판매가:', 'ru-RU': 'Мин. сумма продажи:', 'es-ES': 'Monto de venta más bajo:', 'fr-FR': 'Montant de vente min.:',
                        'de-DE': 'Niedrigster Verkaufsbetrag:', 'pt-BR': 'Menor valor de venda:', 'tr-TR': 'En Düşük Satış Tutarı:', 'vi-VN': 'Số tiền bán thấp nhất:'
                      };
                      const lowestLabel = lowestLabelTranslations[selectedLang] || 'Lowest Sell Amount:';

                      const buyOrderLabelTranslations = {
                        'en-US': 'Highest Buy Amount:', 'ja-JP': '最高購入額:', 'zh-Hans': '最高购买额:', 'zh-Hant': '最高購買額:',
                        'ko-KR': '최고 구매가:', 'ru-RU': 'Макс. сумма покупки:', 'es-ES': 'Monto de compra más alto:', 'fr-FR': 'Montant d\'achat max.:',
                        'de-DE': 'Höchster Kaufbetrag:', 'pt-BR': 'Maior valor de compra:', 'tr-TR': 'En Yüksek Alış Tutarı:', 'vi-VN': 'Số tiền mua cao nhất:'
                      };
                      const buyOrderLabel = buyOrderLabelTranslations[selectedLang] || 'Highest Buy Amount:';
                      
                      let marketData = null;
                      let actualKey = englishName; // default fallback key for URL
                      if (prices) {
                        if (!item.name.startsWith('Item_') && item.rarity && item.rarity !== 'UNKNOWN') {
                          const rarityStr = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase();
                          const prefix = `${englishName} (${rarityStr})`;
                          if (prices[`${prefix} A`]) {
                            marketData = prices[`${prefix} A`];
                            actualKey = `${prefix} A`;
                          }
                          else {
                            const possibleKeys = Object.keys(prices).filter(k => k.startsWith(prefix));
                            if (possibleKeys.length > 0) {
                              const matchedKey = possibleKeys.find(k => k.endsWith(' A')) || possibleKeys[0];
                              if (matchedKey) {
                                marketData = prices[matchedKey];
                                actualKey = matchedKey;
                              } else {
                                actualKey = `${prefix} A`;
                              }
                            } else {
                              actualKey = `${prefix} A`; // Fallback if absolutely no matching keys exist in the database
                            }
                          }
                        }
                        
                        // Fallback to base name if rarity check didn't yield marketData
                        if (!marketData && prices[englishName]) {
                          marketData = prices[englishName];
                          // Only override actualKey if we hadn't already set it to a valid fallback prefix in the rarity check
                          if (actualKey === englishName) actualKey = englishName;
                        }
                      }
                      
                      const steamUrl = `https://steamcommunity.com/market/listings/3678970/${encodeURIComponent(actualKey)}`;
                      
                      let localizedPrice = '';
                      let localizedLowestPrice = '';
                      let localizedBuyOrderPrice = '';
                      if (rates) {
                        const curr = langToCurrency[selectedLang] || { code: 'USD' };
                        const rate = rates[curr.code] || 1;
                        const formatter = new Intl.NumberFormat(selectedLang, {
                          style: 'currency', currency: curr.code,
                          maximumFractionDigits: ['JPY', 'KRW', 'VND'].includes(curr.code) ? 0 : 2
                        });
                        if (marketData) {
                          let primaryCents = marketData.medianCents || marketData.priceCents;
                          if (!primaryCents) {
                            if (marketData.lowestCents > 0 && marketData.buyOrderCents > 0) {
                              primaryCents = (marketData.lowestCents + marketData.buyOrderCents) / 2;
                            } else {
                              primaryCents = marketData.lowestCents || marketData.buyOrderCents || 0;
                            }
                          }
                          if (primaryCents > 0) localizedPrice = formatter.format((primaryCents / 100) * rate);
                          if (marketData.lowestCents > 0) localizedLowestPrice = formatter.format((marketData.lowestCents / 100) * rate);
                          if (marketData.buyOrderCents > 0) localizedBuyOrderPrice = formatter.format((marketData.buyOrderCents / 100) * rate);
                        }
                      }
                      
                      return (
                        <div key={idx} id={"scanned-item-" + idx} className={styles.itemRow}>
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
                                {localizedBuyOrderPrice && <div style={{ fontSize: '0.85rem', color: '#81c784' }}>{buyOrderLabel} {localizedBuyOrderPrice}</div>}
                                {(!localizedPrice && !localizedLowestPrice && !localizedBuyOrderPrice) && <div className={styles.priceLabel}>No Data</div>}
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
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => {
            const next = !commentsOpen;
            setCommentsOpen(next);
            // Fetch only on first open; use cache thereafter
            if (next && !commentsLoadedRef.current) {
              commentsLoadedRef.current = true;
              fetchComments();
            }
          }}
          style={{
            width: '100%', padding: '18px 30px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: 'none',
            borderBottom: commentsOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
            color: 'white', fontSize: '1.2rem', fontWeight: 'bold',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '8px',
          }}
        >
          <span>{commentsTitleTranslations[selectedLang] || commentsTitleTranslations['en-US']}</span>
          <span style={{ fontSize: '1rem' }}>{commentsOpen ? '▼' : '◀'}</span>
        </button>
        <div style={{ display: commentsOpen ? 'block' : 'none', padding: '30px' }}>
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
