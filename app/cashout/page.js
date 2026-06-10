'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const translations = {
  'en-US': {
    back: '← Back to Scanner',
    title: '📝 How do people actually cash out Steam Wallet? [Tips]',
    intro: 'Ever wondered if you can turn the Steam Wallet funds you earned from Taskbar Hero into real money? While you can\'t withdraw directly from Steam, veteran players use third-party skin sites to cash out to PayPal, Bank, or Crypto. Here\'s a quick rundown of how the community does it!',
    step1Title: '1. Buy "Liquid" Items on Steam',
    step1Text: 'Since you can\'t withdraw funds directly, you use your Steam balance to buy highly demanded items on the Community Market. CS2 skins or TF2 keys are usually the go-to.',
    step1Note: '※ Note: Steam makes you wait 7 days before you can trade newly bought items, so you just gotta wait it out.',
    step2Title: '2. Sell them on DMarket',
    step2Text: 'After 7 days, log into a massive third-party marketplace like DMarket using your Steam account. Select your items and sell them. You can instant-sell to their bots if you\'re in a hurry.',
    step3Title: '3. Withdraw your cash',
    step3Text: 'Once sold, you get a USD balance on the site. You can easily withdraw this via Payoneer or Crypto. Easy!',
    videoTitle: '📺 Video Guide (Reference)',
    warningTitle: '⚠️ Important Note Regarding Steam TOS',
    warningText: 'While legally completely fine, cashing out items via third-party sites is technically a gray area not officially supported by Steam\'s Terms of Service. However, massive sites like DMarket have operated for years under Valve\'s tacit approval. Everyday gamers doing standard cashouts are almost never penalized. Just remember it\'s an unofficial community "trick" used at your own risk!',
    footerTitle: '📝 Reference Link',
    footerText: 'This is an example of the external platforms mentioned in this article. You can check the actual market prices and trading mechanisms on sites like the one below.',
    btn: 'DMarket (External Site)'
  },
  'ja-JP': {
    back: '← スキャナーに戻る',
    title: '📝 steamウォレットの安全な換金ルートについて',
    intro: 'Taskbar Heroなどのゲームで貯まったSteamウォレット残高ですが、実はSteam外のサービスを経由することで、現金や仮想通貨として引き出すことが可能です。ここでは、海外のトレーダーやゲーマーの間で一般的に利用されている「アイテムを通じた換金手順」について、その仕組みを分かりやすく解説します。',
    step1Title: '1. Steamマーケットで「流動性の高いアイテム」を購入する',
    step1Text: 'Steamウォレットを直接出金することはできないため、まずはSteamのコミュニティマーケットで「世界中で常に取引されているアイテム」を購入します。取引量の多い『CS2』のスキンや『TF2』の鍵（Key）などがよく選ばれます。',
    step1Note: '※注意：Steamのセキュリティ仕様上、購入したアイテムは7日間トレード（移動）ができないため、外部サイトへ持ち出すまでに1週間の待機期間が必要です。',
    step2Title: '2. 外部の取引サイト（DMarket等）へ出品する',
    step2Text: '7日間の待機期間が過ぎたら、世界的なスキン売買プラットフォームである「DMarket」などに自身のSteamアカウントでログインします。サイト上で該当のアイテムを選択し、売却手続きを行います。すぐに換金したい場合はサイト側の自動買取（BOT）を利用し、少しでも高く売りたい場合はプレイヤー間取引を利用するのが一般的です。',
    step3Title: '3. 売上金（USD）を引き出す',
    step3Text: 'サイト内でアイテムが売却されると、あなたのアカウントに米ドル（USD）の残高が反映されます。あとはこの残高を、Payoneer経由で日本の銀行口座へ振り込ませたり、仮想通貨として出金することで換金完了となります。',
    videoTitle: '📺 参考動画（実際の換金手順）',
    warningTitle: '⚠️ 利用に関する注意点（規約について）',
    warningText: '法律上は全く問題ありませんが、外部サイトを使ったアイテムの現金化は、厳密にはSteamの公式利用規約（TOS）ではサポートされていない「グレーゾーン」の行為です。ただし、DMarketのような世界最大規模の取引サイトは長年運営されており、Valve（Steam運営）も事実上黙認しているため、一般ゲーマーがBANされることはほぼありません。あくまで自己責任の「裏技」として活用してください！',
    footerTitle: '📝 参考リンク',
    footerText: '本記事で紹介した外部プラットフォームの一例です。実際のアイテム相場や取引の仕組みについては、下記のサイトなどで確認できます。',
    btn: 'DMarket (外部サイト)'
  },
  'zh-Hans': {
    back: '← 返回扫描器',
    title: '📝 大佬们是怎么把Steam钱包提现的？【提示】',
    intro: '你有没有想过，在挂机游戏里赚的Steam余额到底能不能变成真钱？其实，很多老玩家都在用第三方饰品网站把余额提现成加密货币或现金。这里简单给大家科普一下！',
    step1Title: '1. 在Steam买“硬通货”',
    step1Text: '因为Steam不能直接提现，所以大家一般先去社区市场买一些全球流通的热门饰品，比如CS2的皮肤或者TF2的钥匙。',
    step1Note: '※ 注意：Steam规定刚买的饰品有7天交易冷却，所以得先放库里等一周。',
    step2Title: '2. 拿去DMarket等网站卖掉',
    step2Text: '等7天后，用Steam账号直接登录DMarket这种超级大的海外饰品交易网。选中你的饰品卖掉就行了，想秒出的话可以直接丢给回收机器人。',
    step3Title: '3. 提现到手！',
    step3Text: '卖掉后网站里就会有美刀（USD）余额啦，接着用Payoneer或者加密货币提出来就搞定了！',
    videoTitle: '📺 参考视频（实际提现流程）',
    warningTitle: '⚠️ 关于Steam服务条款的注意事项',
    warningText: '虽然这在法律上是合法的，但通过第三方网站提现严格来说属于Steam服务条款中未正式支持的“灰色地带”。不过，像DMarket这样的大型交易网站已经运营多年，Valve（Steam官方）也基本默许了这种行为，普通玩家几乎不会因此被封号。请记住，这只是玩家社区的一个“搬砖技巧”，风险需自行承担！',
    footerTitle: '📝 参考链接',
    footerText: '本文章中介绍的外部平台示例。您可以在下面的网站上查看实际的市场价格和交易机制。',
    btn: 'DMarket (外部网站)'
  },
  'zh-Hant': {
    back: '← 返回掃描器',
    title: '📝 大佬們是怎麼把Steam錢包提現的？【提示】',
    intro: '你有沒有想過，在掛機遊戲裡賺的Steam餘額到底能不能變成真錢？其實，很多老玩家都在用第三方飾品網站把餘額提現成加密貨幣或現金。這裡簡單給大家科普一下！',
    step1Title: '1. 在Steam買「硬通貨」',
    step1Text: '因為Steam不能直接提現，所以大家一般先去社群市場買一些全球流通的熱門飾品，比如CS2的皮膚或者TF2的鑰匙。',
    step1Note: '※ 注意：Steam規定剛買的飾品有7天交易冷卻，所以得先放庫裡等一週。',
    step2Title: '2. 拿去DMarket等網站賣掉',
    step2Text: '等7天後，用Steam帳號直接登入DMarket這種超級大的海外飾品交易網。選中你的飾品賣掉就行了，想秒出的話可以直接丟給回收機器人。',
    step3Title: '3. 提現到手！',
    step3Text: '賣掉後網站裡就會有美金（USD）餘額啦，接著用Payoneer或者加密貨幣提出來就搞定了！',
    videoTitle: '📺 參考影片（實際提現流程）',
    warningTitle: '⚠️ 關於Steam服務條款的注意事項',
    warningText: '雖然這在法律上是合法的，但透過第三方網站提現嚴格來說屬於Steam服務條款中未正式支援的「灰色地帶」。不過，像DMarket這樣的大型交易網站已經營運多年，Valve（Steam官方）也基本默許了這種行為，普通玩家幾乎不會因此被封號。請記住，這只是玩家社群的一個「搬磚技巧」，風險需自行承擔！',
    footerTitle: '📝 參考連結',
    footerText: '本文章中介紹的外部平台示例。您可以在下面的網站上查看實際的市場價格和交易機制。',
    btn: 'DMarket (外部網站)'
  },
  'ko-KR': {
    back: '← 스캐너로 돌아가기',
    title: '📝 다들 Steam 지갑 현금화 어떻게 하는 걸까? [팁]',
    intro: '게임해서 번 Steam 지갑 잔액, 진짜 돈으로 바꿀 수 없을까 고민해 본 적 있으신가요? 해외 고인물 유저들은 보통 외부 스킨 거래 사이트를 써서 암호화폐나 현금으로 환전한답니다. 그 루트를 간단히 알려드릴게요!',
    step1Title: '1. Steam에서 "잘 팔리는 템" 먼저 사기',
    step1Text: 'Steam 돈을 바로 뺄 수는 없으니, 장터에서 수요가 많은 아이템(CS2 스킨이나 TF2 키 등)을 먼저 삽니다.',
    step1Note: '※ 주의: 템 사고 7일 동안은 거래 제한이 걸리니까 1주일은 묵혀둬야 해요.',
    step2Title: '2. DMarket 같은 곳에서 팔기',
    step2Text: '1주일 지나면 DMarket 같은 유명 스킨 사이트에 Steam 계정으로 로그인해서 그 템을 팔면 됩니다. 급하면 봇한테 바로 넘길 수도 있어요.',
    step3Title: '3. 현금 출금하기',
    step3Text: '팔고 나면 사이트에 달러(USD)가 들어옵니다. 이걸 Payoneer나 암호화폐로 뽑으면 끝!',
    videoTitle: '📺 참고 영상 (실제 환전 과정)',
    warningTitle: '⚠️ Steam 이용 약관 관련 주의사항',
    warningText: '법적으로는 문제없지만, 제3자 사이트를 이용한 아이템 현금화는 엄밀히 말해 Steam의 공식 이용 약관(TOS)에서 지원하지 않는 "회색 지대"입니다. 하지만 DMarket 같은 대형 사이트는 수년간 운영되어 왔으며 Valve도 사실상 묵인하고 있어 일반 게이머가 제재를 받는 일은 거의 없습니다. 어디까지나 커뮤니티의 비공식 "팁"이므로 본인의 책임 하에 활용하세요!',
    footerTitle: '📝 참고 링크',
    footerText: '본 문서에서 소개한 외부 플랫폼의 예시입니다. 실제 아이템 시세나 거래 방식은 아래 사이트에서 확인할 수 있습니다.',
    btn: 'DMarket (외부 사이트)'
  },
  'ru-RU': {
    back: '← Назад к сканеру',
    title: '📝 Как вообще выводят деньги со Steam? [Советы]',
    intro: 'Задавались вопросом, можно ли вывести заработанное в Taskbar Hero в реал? Напрямую нельзя, но опытные игроки используют сторонние сайты скинов для вывода в крипту или на карту. Вот как это работает!',
    step1Title: '1. Покупаем "ликвид" в Steam',
    step1Text: 'Поскольку напрямую вывести нельзя, мы покупаем ходовые скины CS2 или ключи TF2 на Торговой площадке.',
    step1Note: '※ Учтите: после покупки придется подождать 7 дней из-за трейд-бана Steam.',
    step2Title: '2. Продаем на DMarket',
    step2Text: 'Через неделю логинимся через Steam на крупной площадке вроде DMarket, закидываем туда вещи и продаем. Можно слить ботам моментально.',
    step3Title: '3. Выводим кэш',
    step3Text: 'После продажи у вас на балансе будут доллары. Выводим их через крипту или Payoneer, и дело в шляпе!',
    videoTitle: '📺 Видео-руководство (Справка)',
    warningTitle: '⚠️ Важное примечание о правилах Steam',
    warningText: 'Хотя по закону это абсолютно легально, вывод средств через сторонние сайты технически является "серой зоной", не поддерживаемой Условиями обслуживания Steam. Тем не менее, крупные сайты работают годами при молчаливом согласии Valve, и обычных игроков почти никогда не банят. Помните, что это неофициальная "фишка" сообщества, используемая на ваш страх и риск!',
    footerTitle: '📝 Ссылка для справки',
    footerText: 'Это пример внешней платформы, упомянутой в статье. Вы можете проверить реальные рыночные цены на сайте ниже.',
    btn: 'DMarket (Внешний сайт)'
  }
};

export default function CashoutGuide() {
  const [selectedLang, setSelectedLang] = useState('en-US');

  useEffect(() => {
    const saved = localStorage.getItem('preferredLang');
    if (saved) {
      setSelectedLang(saved);
    }
  }, []);

  const t = translations[selectedLang] || translations['en-US'];

  const videoNotes = {
    'ja-JP': '（※英語の動画ですみません！）',
    'zh-Hans': '（※抱歉，视频是英文的！）',
    'zh-Hant': '（※抱歉，影片是英文的！）',
    'ko-KR': '（※죄송합니다. 영상이 영어로 되어 있습니다!）',
    'ru-RU': '(Извините, видео на английском!)',
    'es-ES': '(¡Perdón, el video está en inglés!)',
    'fr-FR': '(Désolé, la vidéo est en anglais !)',
    'de-DE': '(Sorry, das Video ist auf Englisch!)',
    'pt-BR': '(Desculpe, o vídeo está em inglês!)',
    'tr-TR': '(Özür dileriz, video İngilizce!)',
    'vi-VN': '(Xin lỗi, video bằng tiếng Anh!)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <Link href="/" style={{ color: '#2196f3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {t.back}
          </Link>
        </div>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#fff' }}>
          {t.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {t.intro}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ color: '#4caf50', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#4caf50', color: '#000', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>1</span>
              {t.step1Title}
            </h2>
            <p style={{ lineHeight: '1.6' }}>
              {t.step1Text}<br/>
              <span style={{ color: '#f44336', fontSize: '0.9rem' }}>{t.step1Note}</span>
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ color: '#4caf50', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#4caf50', color: '#000', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>2</span>
              {t.step2Title}
            </h2>
            <p style={{ lineHeight: '1.6' }}>
              {t.step2Text}
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ color: '#4caf50', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#4caf50', color: '#000', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1rem', fontWeight: 'bold' }}>3</span>
              {t.step3Title}
            </h2>
            <p style={{ lineHeight: '1.6' }}>
              {t.step3Text}
            </p>
          </div>
        </div>

        {/* Video Guide */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff', borderLeft: '4px solid #2196f3', paddingLeft: '12px', display: 'flex', alignItems: 'center' }}>
            {t.videoTitle}
            {selectedLang !== 'en-US' && videoNotes[selectedLang] && (
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginLeft: '12px', fontWeight: 'normal' }}>
                {videoNotes[selectedLang]}
              </span>
            )}
          </h3>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
            <iframe 
              src="https://www.youtube.com/embed/LjguLW9rQe4" 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>

        {/* Warning / TOS Note */}
        {t.warningTitle && (
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 152, 0, 0.1)', borderLeft: '4px solid #ff9800', borderRadius: '4px' }}>
            <h4 style={{ color: '#ff9800', marginBottom: '10px', fontSize: '1.1rem', margin: '0 0 10px 0' }}>{t.warningTitle}</h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              {t.warningText}
            </p>
          </div>
        )}

        {/* Footer / Reference Link */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#fff' }}>{t.footerTitle}</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{t.footerText}</p>
          <a href="https://dmarket.com/" target="_blank" rel="noopener noreferrer" style={{
            color: '#2196f3',
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            {t.btn} <span>↗</span>
          </a>
        </div>

      </div>
    </div>
  );
}
