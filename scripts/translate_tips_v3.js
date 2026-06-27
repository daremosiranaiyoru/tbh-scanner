const fs = require('fs');

const locales = {
  'en-US': 'en',
  'ja-JP': 'ja',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'ko-KR': 'ko',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'ru-RU': 'ru',
  'es-ES': 'es',
  'pt-BR': 'pt',
  'id-ID': 'id',
  'th-TH': 'th',
  'tr-TR': 'tr',
  'uk-UA': 'uk',
  'pl-PL': 'pl',
  'vi-VN': 'vi'
};

const texts = {
  btnLabel: 'ツールの便利機能紹介',
  title: 'ツールの便利機能紹介',
  
  // Section 1: Manual search
  s1_title: '手動での相場検索',
  s1_text1: 'スクリーンショットが無くてもアイテムを検索して追加することで相場をチェックできます。気になるアイテムの相場を一つずつ確認することもできますが、一度にたくさんのアイテムを追加することでとても便利な使い方ができます！',
  s1_text2: '（例）イモータルの素材を合成したいけれど、価値のあるものは合成したくない場合\n①イモータルの素材を検索して全て追加',
  s1_text3: '②追加したアイテムを値段順にソート',
  s1_text4: 'これでどのアイテムなら合成していいか一目で確認できます！確認が終わったら、「画像とアイテムをクリア」を押して追加したアイテムを一気に消去！',
  
  // Section 2: Auto scroll
  s2_title: 'アイテムをクリックで自動スクロール',
  s2_text1: '倉庫をスキャンして、このアイテムの値段っていくらなんだろうと思ったときにいちいちアイテム欄をスクロールして探すのは面倒ですよね。実はスキャンした画像のアイテムアイコンをクリックするだけで、自動でそのアイテムの位置にとべちゃいます！',
  s2_text2: '（例）ダイヤモンドの価格が知りたくなった時'
};

async function translate(text, targetLang) {
  if (targetLang === 'ja') return text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    let translated = '';
    for(const part of json[0]) {
      translated += part[0];
    }
    return translated;
  } catch(e) {
    console.error('Error translating to', targetLang, e);
    return text;
  }
}

async function run() {
  const result = {};
  for(const key of Object.keys(texts)) {
    result[key] = {};
  }

  for(const [localeCode, gtCode] of Object.entries(locales)) {
    console.log('Translating to', localeCode);
    for(const [key, text] of Object.entries(texts)) {
      result[key][localeCode] = await translate(text, gtCode);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  let fileContent = 'export const tipsTrans = ' + JSON.stringify(result, null, 2) + ';\n';
  fs.writeFileSync('app/lib/tipsTranslations.js', fileContent);
  console.log('Wrote app/lib/tipsTranslations.js');
}

run();
