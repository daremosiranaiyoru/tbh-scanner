'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const translations = {
  'en-US': {
    back: '← Back to Scanner',
    title: '📝 Loophole cashout route for Steam Wallet',
    intro: 'Ever wondered if you can turn the Steam Wallet funds you earned from Taskbar Hero into real money? While you can\'t withdraw directly from Steam, veteran players use third-party skin sites to cash out to your bank account. Here\'s a quick rundown of how the community does it!',
    step1Title: 'Register on an external skin trading site',
    step1Text: <>Since you can't withdraw from your Steam wallet directly, you need to use an external trading site to cash out. First, log into a global skin trading platform like <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> using your Steam account. It's a relatively safe platform with millions of users.</>,
    step1Note: '',
    step2Title: 'Buy highly liquid items on Steam',
    step2Text: 'Next, buy "globally traded items" on the Steam Community Market. The trick is to check the demand on the trading site beforehand and pick high-volume items like Counter-Strike 2 skins or Team Fortress 2 keys. However, due to Steam\'s security, there is a 7-day waiting period before you can trade purchased items again.',
    step3Title: 'Sell on the trading site and withdraw cash',
    step3Text: 'After the 7-day waiting period, list your items on a trading site like DMarket. You can use their automatic bots to instant-sell if you\'re in a hurry, or use peer-to-peer trading to get a bit more cash. Once sold and you get a USD balance, you can easily withdraw it to your bank account via services like Payoneer to complete the cashout.',
    videoTitle: '📺 Video Guide (Reference)',
    warningTitle: '⚠️ Important Note Regarding Steam TOS',
    warningText: 'While legally completely fine, cashing out items via third-party sites is technically a gray area not officially supported by Steam\'s Terms of Service. However, massive sites like DMarket have operated for years under Valve\'s tacit approval. Everyday gamers doing standard cashouts are almost never penalized. Just remember it\'s an unofficial community "trick" used at your own risk!',
    footerTitle: '📝 Reference Link',
    footerText: 'This is an example of the external platforms mentioned in this article. You can check the actual market prices and trading mechanisms on sites like the one below.',
    btn: 'DMarket (External Site)'
  },
  'ja-JP': {
    back: '← スキャナーに戻る',
    title: '📝 steamウォレットの抜け道的な換金ルートについて',
    intro: 'Taskbar Heroなどのゲームで貯まったSteamウォレット残高ですが、実はSteam外のサービスを経由することで、現金として引き出すことが可能です。ここでは、海外のトレーダーやゲーマーの間で一般的に利用されている「アイテムを通じた換金手順」について、その仕組みを分かりやすく解説します。',
    step1Title: '外部のスキン取引サイトに登録を行う',
    step1Text: <>Steamウォレットを直接出金することはできないため、換金には外部の取引サイトを経由する必要があります。まずは世界的なスキン売買プラットフォームである「<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>」などに自身のSteamアカウントでログイン（登録）しておきましょう。数百万人規模のユーザー数がいる比較的安全なプラットフォームです。<br /><span style={{ color: '#f44336', fontSize: '0.9rem' }}>※サイトは日本語選択ができないので、翻訳ツールなどで頑張ってください！</span></>,
    step1Note: '',
    step2Title: '流動性の高いアイテムを購入する',
    step2Text: '次に、Steamのコミュニティマーケットで「世界中で常に取引されているアイテム」を購入します。登録した取引サイトで事前に需要を確認し、取引量の多い『Counter-Strike 2』のスキンや『Team Fortress 2』の鍵（Key）などを選ぶのがコツです。ただし、Steamのセキュリティ仕様上、購入したアイテムを再度トレードするのに7日間の待機期間が必要です。',
    step3Title: '取引サイトに出品し売上金を引き出す',
    step3Text: '7日間の待機期間が過ぎたら、購入したアイテムをDMarketなどの取引サイトに出品します。すぐに換金したい場合はサイト側の自動買取（BOT）を利用し、少しでも高く売りたい場合はプレイヤー間取引を利用するのが一般的です。アイテムが売却されてアカウントに米ドル（USD）が反映されたら、Payoneer経由などで日本の銀行口座へ振り込ませることで換金完了となります。',
    videoTitle: '📺 参考動画（実際の換金手順）',
    warningTitle: '⚠️ 利用に関する注意点（規約について）',
    warningText: '法律上は全く問題ありませんが、外部サイトを使ったアイテムの現金化は、厳密にはSteamの公式利用規約（TOS）ではサポートされていない「グレーゾーン」の行為です。ただし、DMarketのような世界最大規模の取引サイトは長年運営されており、Valve（Steam運営）も事実上黙認しているため、一般ゲーマーがBANされることはほぼありません。あくまで自己責任の「裏技」として活用してください！',
    footerTitle: '📝 参考リンク',
    footerText: '本記事で紹介した外部プラットフォームの一例です。実際のアイテム相場や取引の仕組みについては、下記のサイトなどで確認できます。',
    btn: 'DMarket (外部サイト)'
  },
  'zh-Hans': {
    back: '← 返回扫描器',
    title: '📝 关于Steam钱包的“漏洞”提现路线',
    intro: '你有没有想过，在挂机游戏里赚的Steam余额到底能不能变成真钱？其实，很多老玩家都在用第三方饰品网站把余额提现成现金。这里简单给大家科普一下社区里常用的“搬砖”套路！',
    step1Title: '在外部饰品交易网站上注册',
    step1Text: <>因为不能直接从Steam钱包提现，所以你需要通过外部交易网站来套现。首先，使用你的Steam账号登录像<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>这样的全球饰品交易平台。这是一个拥有数百万用户的相对安全的平台。</>,
    step1Note: '',
    step2Title: '购买高流动性的饰品',
    step2Text: '接着，在Steam社区市场购买“全球流通的热门饰品”。诀窍是提前在交易网站上确认需求，选择交易量大的Counter-Strike 2皮肤或Team Fortress 2钥匙。但是，根据Steam的安全规定，购买的物品需要等待7天才能再次交易。',
    step3Title: '在交易网站上出售并提现',
    step3Text: '7天冷却期结束后，将购买的饰品挂在DMarket等交易网站上出售。想秒出的话可以直接卖给网站的自动收购机器人，想多卖点钱则可以选择玩家间交易。饰品售出并在你的账户中显示美元（USD）余额后，就可以通过Payoneer等渠道提现到你的银行账户，完成套现。',
    videoTitle: '📺 参考视频（实际提现流程）',
    warningTitle: '⚠️ 关于Steam服务条款的注意事项',
    warningText: '虽然这在法律上是合法的，但通过第三方网站提现严格来说属于Steam服务条款中未正式支持的“灰色地带”。不过，像DMarket这样的大型交易网站已经运营多年，Valve（Steam官方）也基本默许了这种行为，普通玩家几乎不会因此被封号。请记住，这只是玩家社区的一个“搬砖技巧”，风险需自行承担！',
    footerTitle: '📝 参考链接',
    footerText: '本文章中介绍的外部平台示例。您可以在下面的网站上查看实际的市场价格和交易机制。',
    btn: 'DMarket (外部网站)'
  },
  'zh-Hant': {
    back: '← 返回掃描器',
    title: '📝 關於Steam錢包的「漏洞」提現路線',
    intro: '你有沒有想過，在掛機遊戲裡賺的Steam餘額到底能不能變成真錢？其實，很多老玩家都在用第三方飾品網站把餘額提現成現金。這裡簡單給大家科普一下社群裡常用的「搬磚」套路！',
    step1Title: '在外部飾品交易網站上註冊',
    step1Text: <>因為不能直接從Steam錢包提現，所以你需要透過外部交易網站來套現。首先，使用你的Steam帳號登入像<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>這樣的全球飾品交易平台。這是一個擁有數百萬用戶的相對安全的平台。</>,
    step1Note: '',
    step2Title: '購買高流動性的飾品',
    step2Text: '接著，在Steam社群市場購買「全球流通的熱門飾品」。訣竅是提前在交易網站上確認需求，選擇交易量大的Counter-Strike 2皮膚或Team Fortress 2鑰匙。但是，根據Steam的安全規定，購買的物品需要等待7天才能再次交易。',
    step3Title: '在交易網站上出售並提現',
    step3Text: '7天冷卻期結束後，將購買的飾品掛在DMarket等交易網站上出售。想秒出的話可以直接賣給網站的自動收購機器人，想多賣點錢則可以選擇玩家間交易。飾品售出並在你的帳戶中顯示美金（USD）餘額後，就可以透過Payoneer等管道提現到你的銀行帳戶，完成套現。',
    videoTitle: '📺 參考影片（實際提現流程）',
    warningTitle: '⚠️ 關於Steam服務條款的注意事項',
    warningText: '雖然這在法律上是合法的，但透過第三方網站提現嚴格來說屬於Steam服務條款中未正式支援的「灰色地帶」。不過，像DMarket這樣的大型交易網站已經營運多年，Valve（Steam官方）也基本默許了這種行為，普通玩家幾乎不會因此被封號。請記住，這只是玩家社群的一個「搬磚技巧」，風險需自行承擔！',
    footerTitle: '📝 參考連結',
    footerText: '本文章中介紹的外部平台示例。您可以在下面的網站上查看實際的市場價格和交易機制。',
    btn: 'DMarket (外部網站)'
  },
  'ko-KR': {
    back: '← 스캐너로 돌아가기',
    title: '📝 Steam 지갑의 우회적인 현금화 루트',
    intro: '게임해서 번 Steam 지갑 잔액, 진짜 돈으로 바꿀 수 없을까 고민해 본 적 있으신가요? 해외 고인물 유저들은 보통 외부 스킨 거래 사이트를 써서 현금으로 환전한답니다. 그 루트를 간단히 알려드릴게요!',
    step1Title: '외부 스킨 거래 사이트 가입하기',
    step1Text: <>Steam 지갑의 자금을 직접 출금할 수 없기 때문에 외부 거래 사이트를 거쳐 현금화해야 합니다. 먼저 <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>과 같은 세계적인 스킨 거래 플랫폼에 본인의 Steam 계정으로 로그인해 둡니다. 수백만 명의 유저가 사용하는 비교적 안전한 플랫폼입니다.</>,
    step1Note: '',
    step2Title: '거래량이 많은 아이템 구매하기',
    step2Text: '다음으로 Steam 커뮤니티 장터에서 "전 세계적으로 거래가 활발한 아이템"을 구매합니다. 가입한 거래 사이트에서 미리 수요를 확인하고 Counter-Strike 2 스킨이나 Team Fortress 2 키 등을 고르는 것이 요령입니다. 단, Steam의 보안 정책상 구매한 아이템을 다시 거래하려면 7일간의 대기 기간이 필요합니다.',
    step3Title: '거래 사이트에 판매하고 출금하기',
    step3Text: '7일간의 대기 기간이 지나면 구매한 아이템을 DMarket 등 거래 사이트에 판매합니다. 즉시 현금화하고 싶다면 사이트의 자동 매입(BOT)을 이용하고, 조금이라도 비싸게 팔려면 유저 간 거래를 이용하는 것이 일반적입니다. 아이템이 판매되어 계정에 달러(USD) 잔액이 들어오면 Payoneer 등을 통해 본인의 은행 계좌로 출금하여 현금화를 완료합니다.',
    videoTitle: '📺 참고 영상 (실제 환전 과정)',
    warningTitle: '⚠️ Steam 이용 약관 관련 주의사항',
    warningText: '법적으로는 문제없지만, 제3자 사이트를 이용한 아이템 현금화는 엄밀히 말해 Steam의 공식 이용 약관(TOS)에서 지원하지 않는 "회색 지대"입니다. 하지만 DMarket 같은 대형 사이트는 수년간 운영되어 왔으며 Valve도 사실상 묵인하고 있어 일반 게이머가 제재를 받는 일은 거의 없습니다. 어디까지나 커뮤니티의 비공식 "팁"이므로 본인의 책임 하에 활용하세요!',
    footerTitle: '📝 참고 링크',
    footerText: '본 문서에서 소개한 외부 플랫폼의 예시입니다. 실제 아이템 시세나 거래 방식은 아래 사이트에서 확인할 수 있습니다.',
    btn: 'DMarket (외부 사이트)'
  },
  'ru-RU': {
    back: '← Назад к сканеру',
    title: '📝 Обходной путь вывода средств из кошелька Steam',
    intro: 'Задавались вопросом, можно ли вывести заработанное в Taskbar Hero в реал? Напрямую нельзя, но опытные игроки используют сторонние сайты скинов для вывода в наличные. Вот как работает эта схема!',
    step1Title: 'Регистрация на внешнем сайте торговли скинами',
    step1Text: <>Поскольку вывести средства напрямую из кошелька Steam нельзя, для обналичивания нужно использовать сторонние торговые площадки. Сначала авторизуйтесь на глобальной платформе вроде <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> через свой аккаунт Steam. Это относительно безопасная платформа, которой пользуются миллионы людей.</>,
    step1Note: '',
    step2Title: 'Покупка высоколиквидных предметов',
    step2Text: 'Затем купите на Торговой площадке Steam «ходовые предметы». Хитрость в том, чтобы заранее проверить спрос на сайте и выбрать предметы с высоким объемом торгов, такие как скины Counter-Strike 2 или ключи Team Fortress 2. Однако из-за политики безопасности Steam для повторной продажи купленных предметов необходимо подождать 7 дней.',
    step3Title: 'Продажа на сайте и вывод средств',
    step3Text: 'Спустя 7 дней выставьте купленные предметы на продажу на сайте вроде DMarket. Если деньги нужны срочно, продайте их автоматическим ботам, а если хотите получить немного больше — используйте торговлю между игроками. Как только предметы продадутся и на балансе появятся доллары (USD), просто выведите их на банковский счет через такие сервисы, как Payoneer.',
    videoTitle: '📺 Видео-руководство (Справка)',
    warningTitle: '⚠️ Важное примечание о правилах Steam',
    warningText: 'Хотя по закону это абсолютно легально, вывод средств через сторонние сайты технически является "серой зоной", не поддерживаемой Условиями обслуживания Steam. Тем не менее, крупные сайты работают годами при молчаливом согласии Valve, и обычных игроков почти никогда не банят. Помните, что это неофициальная "фишка" сообщества, используемая на ваш страх и риск!',
    footerTitle: '📝 Ссылка для справки',
    footerText: 'Это пример внешней платформы, упомянутой в статье. Вы можете проверить реальные рыночные цены на сайте ниже.',
    btn: 'DMarket (Внешний сайт)'
  },
  'es-ES': {
    back: '← Volver al escáner',
    title: '📝 Ruta alternativa para retirar fondos de la Cartera de Steam',
    intro: '¿Alguna vez te has preguntado si puedes convertir el saldo de Steam en dinero real? Aunque no puedes retirarlo directamente de Steam, los jugadores veteranos usan sitios de skins de terceros para retirarlo en efectivo. ¡Aquí te explicamos cómo lo hace la comunidad!',
    step1Title: 'Regístrate en un sitio externo de comercio de skins',
    step1Text: <>Dado que no puedes retirar fondos directamente de tu cartera de Steam, debes usar un sitio comercial externo para retirar dinero. Primero, inicia sesión en una plataforma global de comercio de skins como <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando tu cuenta de Steam. Es una plataforma relativamente segura con millones de usuarios.</>,
    step1Note: '',
    step2Title: 'Comprar artículos de alta liquidez en Steam',
    step2Text: 'A continuación, compra "artículos de comercio mundial" en el Mercado de la Comunidad de Steam. El truco es verificar la demanda en el sitio de comercio de antemano y elegir artículos de alto volumen como skins de Counter-Strike 2 o llaves de Team Fortress 2. Sin embargo, debido a la seguridad de Steam, hay un período de espera de 7 días antes de poder intercambiar los artículos comprados nuevamente.',
    step3Title: 'Vender en el sitio y retirar el efectivo',
    step3Text: 'Después del período de espera de 7 días, pon a la venta tus artículos en un sitio comercial como DMarket. Si tienes prisa, puedes venderlos al instante a sus bots, o usar el comercio entre jugadores si quieres obtener un poco más de dinero. Una vez que se vendan y obtengas un saldo en dólares (USD), puedes transferirlo fácilmente a tu cuenta bancaria a través de servicios como Payoneer para completar el retiro.',
    videoTitle: '📺 Guía en video (Referencia)',
    warningTitle: '⚠️ Nota importante sobre los Términos de Servicio de Steam',
    warningText: 'Aunque es legal, retirar artículos a través de sitios de terceros es técnicamente un área gris no respaldada oficialmente por los Términos de Servicio de Steam. Sin embargo, sitios enormes como DMarket han operado durante años bajo la aprobación tácita de Valve. Los jugadores nunca son penalizados. ¡Solo recuerda que es un "truco" de la comunidad usado bajo tu propio riesgo!',
    footerTitle: '📝 Enlace de referencia',
    footerText: 'Este es un ejemplo de las plataformas externas mencionadas en este artículo. Puedes consultar los precios y mecanismos en el siguiente sitio.',
    btn: 'DMarket (Sitio externo)'
  },
  'fr-FR': {
    back: '← Retour au scanner',
    title: '📝 Itinéraire alternatif pour retirer les fonds du portefeuille Steam',
    intro: 'Vous vous êtes déjà demandé si vous pouviez transformer les fonds Steam en argent réel ? Bien que vous ne puissiez pas les retirer directement de Steam, les joueurs vétérans utilisent des sites de skins tiers pour les retirer en espèces. Voici comment la communauté procède !',
    step1Title: 'S\'inscrire sur un site externe d\'échange de skins',
    step1Text: <>Puisque vous ne pouvez pas retirer des fonds directement de votre portefeuille Steam, vous devez utiliser un site externe pour encaisser. Tout d'abord, connectez-vous à une plateforme mondiale d'échange de skins comme <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> en utilisant votre compte Steam. Il s'agit d'une plateforme relativement sûre comptant des millions d'utilisateurs.</>,
    step1Note: '',
    step2Title: 'Acheter des articles très liquides sur Steam',
    step2Text: 'Ensuite, achetez des "articles mondialement échangés" sur le marché de la communauté Steam. L\'astuce consiste à vérifier la demande sur le site d\'échange au préalable et à choisir des articles à fort volume comme des skins Counter-Strike 2 ou des clés Team Fortress 2. Cependant, en raison de la sécurité de Steam, il y a une période d\'attente de 7 jours avant de pouvoir échanger à nouveau les articles achetés.',
    step3Title: 'Vendre sur le site et retirer l\'argent',
    step3Text: 'Après la période d\'attente de 7 jours, mettez vos articles en vente sur un site comme DMarket. Vous pouvez utiliser leurs bots pour une vente instantanée si vous êtes pressé, ou utiliser l\'échange entre joueurs pour obtenir un peu plus d\'argent. Une fois vendus et que vous avez un solde en dollars (USD), vous pouvez facilement le transférer sur votre compte bancaire via des services comme Payoneer pour terminer le retrait.',
    videoTitle: '📺 Guide vidéo (Référence)',
    warningTitle: '⚠️ Remarque importante sur les conditions de Steam',
    warningText: 'Bien que légal, le retrait via des sites tiers est techniquement une zone grise non officiellement soutenue par les conditions de service de Steam. Cependant, des sites massifs comme DMarket opèrent depuis des années avec l\'approbation tacite de Valve. Rappelez-vous simplement qu\'il s\'agit d\'une "astuce" de la communauté.',
    footerTitle: '📝 Lien de référence',
    footerText: 'Ceci est un exemple des plateformes externes mentionnées. Vous pouvez vérifier les prix sur le site ci-dessous.',
    btn: 'DMarket (Site externe)'
  },
  'de-DE': {
    back: '← Zurück zum Scanner',
    title: '📝 Alternativer Weg zur Auszahlung von Steam-Guthaben',
    intro: 'Haben Sie sich jemals gefragt, ob Sie Steam-Guthaben in echtes Geld verwandeln können? Obwohl Sie es nicht direkt von Steam abheben können, nutzen erfahrene Spieler Skin-Seiten von Drittanbietern, um es sich in bar auszahlen zu lassen. Hier ist eine kurze Erklärung, wie die Community das macht!',
    step1Title: 'Auf einer externen Skin-Handelsseite registrieren',
    step1Text: <>Da Sie Ihr Steam-Guthaben nicht direkt auszahlen können, müssen Sie eine externe Handelsseite nutzen. Melden Sie sich zunächst mit Ihrem Steam-Konto bei einer globalen Skin-Handelsplattform wie <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> an. Es ist eine relativ sichere Plattform mit Millionen von Nutzern.</>,
    step1Note: '',
    step2Title: 'Hochliquide Gegenstände auf Steam kaufen',
    step2Text: 'Kaufen Sie als Nächstes "weltweit gehandelte Gegenstände" auf dem Steam-Community-Markt. Der Trick besteht darin, die Nachfrage auf der Handelsseite im Voraus zu prüfen und Gegenstände mit hohem Volumen wie Counter-Strike 2-Skins oder Team Fortress 2-Schlüssel auszuwählen. Aufgrund der Sicherheit von Steam gibt es jedoch eine 7-tägige Wartezeit, bevor Sie gekaufte Gegenstände wieder handeln können.',
    step3Title: 'Auf der Handelsseite verkaufen und Geld abheben',
    step3Text: 'Listen Sie Ihre Gegenstände nach der 7-tägigen Wartezeit auf einer Handelsseite wie DMarket auf. Sie können sie sofort an deren Bots verkaufen, wenn Sie es eilig haben, oder den Handel zwischen Spielern nutzen, um etwas mehr Geld zu bekommen. Sobald sie verkauft sind und Sie ein USD-Guthaben haben, können Sie dieses über Dienste wie Payoneer problemlos auf Ihr Bankkonto überweisen, um die Auszahlung abzuschließen.',
    videoTitle: '📺 Video-Anleitung (Referenz)',
    warningTitle: '⚠️ Wichtiger Hinweis zu den Steam-Nutzungsbedingungen',
    warningText: 'Obwohl legal, ist die Auszahlung über Drittanbieter technisch gesehen eine Grauzone, die von den Steam-Nutzungsbedingungen nicht offiziell unterstützt wird. Allerdings operieren riesige Seiten wie DMarket seit Jahren unter stillschweigender Billigung von Valve. Denken Sie daran, dass es ein inoffizieller "Trick" der Community ist.',
    footerTitle: '📝 Referenzlink',
    footerText: 'Dies ist ein Beispiel für die genannten externen Plattformen. Sie können die Preise auf der untenstehenden Website überprüfen.',
    btn: 'DMarket (Externe Seite)'
  },
  'pt-BR': {
    back: '← Voltar ao Scanner',
    title: '📝 Rota alternativa para sacar fundos da Carteira Steam',
    intro: 'Já se perguntou se você pode transformar os fundos do Steam em dinheiro real? Embora você não possa sacar diretamente do Steam, jogadores veteranos usando sites de skins de terceiros para sacar em dinheiro. Aqui está um rápido resumo de como a comunidade faz isso!',
    step1Title: 'Registre-se em um site de comércio de skins',
    step1Text: <>Como você não pode sacar fundos diretamente da sua carteira Steam, você precisa usar um site de terceiros para sacar. Primeiro, faça o login em uma plataforma global de comércio de skins como o <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando sua conta Steam. É uma plataforma relativamente segura com milhões de usuários.</>,
    step1Note: '',
    step2Title: 'Compre itens de alta liquidez no Steam',
    step2Text: 'Em seguida, compre "itens comercializados globalmente" no Mercado da Comunidade Steam. O truque é verificar a demanda no site de negociação com antecedência e escolher itens de alto volume, como skins de Counter-Strike 2 ou chaves de Team Fortress 2. No entanto, devido à segurança do Steam, há um período de espera de 7 dias antes de você poder trocar os itens comprados novamente.',
    step3Title: 'Venda no site de comércio e saque o dinheiro',
    step3Text: 'Após o período de espera de 7 dias, liste seus itens em um site como o DMarket. Se estiver com pressa, você pode vendê-los instantaneamente para os bots deles, ou usar a negociação entre jogadores para conseguir um pouco mais de dinheiro. Depois que os itens forem vendidos e o saldo em dólares (USD) for refletido em sua conta, você pode sacá-lo para sua conta bancária por meio de serviços como o Payoneer para concluir o processo.',
    videoTitle: '📺 Guia em Vídeo (Referência)',
    warningTitle: '⚠️ Nota Importante sobre os Termos do Steam',
    warningText: 'Embora seja legal, sacar itens em sites de terceiros é uma área cinzenta não apoiada oficialmente pelos Termos do Steam. Mas sites como DMarket operam há anos sob a aprovação de Valve. Lembre-se, é um "truque" da comunidade.',
    footerTitle: '📝 Link de Referência',
    footerText: 'Este é um exemplo de plataformas externas. Você pode verificar os preços reais no site abaixo.',
    btn: 'DMarket (Site Externo)'
  },
  'tr-TR': {
    back: '← Tarayıcıya Dön',
    title: '📝 Steam Cüzdanı için alternatif nakit çekme rotası',
    intro: 'Steam fonlarını gerçek paraya dönüştürüp dönüştüremeyeceğinizi hiç merak ettiniz mi? Doğrudan Steam\'den çekemeseniz de usta oyuncular nakit çekmek için üçüncü taraf görünüm (skin) sitelerini kullanırlar. İşte topluluğun bunu nasıl yaptığına dair kısa bir özet!',
    step1Title: 'Harici bir görünüm ticareti sitesine kaydolun',
    step1Text: <>Steam cüzdanınızdan doğrudan para çekemediğiniz için, nakit çekmek adına harici bir ticaret sitesi kullanmanız gerekir. Öncelikle, Steam hesabınızı kullanarak <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> gibi küresel bir platforma giriş yapın. Milyonlarca kullanıcısı olan nispeten güvenli bir platformdur.</>,
    step1Note: '',
    step2Title: 'Steam\'de yüksek likiditeye sahip öğeler satın alın',
    step2Text: 'Ardından, Steam Topluluk Pazarında "küresel olarak ticareti yapılan öğeler" satın alın. İşin püf noktası, ticaret sitesindeki talebi önceden kontrol etmek ve Counter-Strike 2 görünümleri veya Team Fortress 2 anahtarları gibi yüksek hacimli öğeleri seçmektir. Ancak, Steam\'in güvenliği nedeniyle, satın alınan öğeleri tekrar takas edebilmek için 7 günlük bir bekleme süresi vardır.',
    step3Title: 'Ticaret sitesinde satın ve paranızı çekin',
    step3Text: '7 günlük bekleme süresinden sonra, öğelerinizi DMarket gibi bir ticaret sitesinde listeleyin. Aceleniz varsa botlarına anında satabilir veya biraz daha fazla para kazanmak için oyuncular arası ticareti kullanabilirsiniz. Satıldıktan ve bir USD bakiyesi elde ettikten sonra, işlemi tamamlamak için Payoneer gibi hizmetler aracılığıyla bunu banka hesabınıza kolayca çekebilirsiniz.',
    videoTitle: '📺 Video Kılavuzu (Referans)',
    warningTitle: '⚠️ Steam TOS Hakkında Önemli Not',
    warningText: 'Yasal olmasına rağmen, üçüncü taraf siteler aracılığıyla nakit çekmek, Steam\'in Hizmet Şartları tarafından resmi olarak desteklenmeyen gri bir alandır. Ancak, DMarket gibi devasa siteler Valve\'in zımni onayı altında yıllardır faaliyet göstermektedir. Bunun topluluğun resmi olmayan bir "hilesi" olduğunu unutmayın.',
    footerTitle: '📝 Referans Bağlantısı',
    footerText: 'Bu, bahsedilen harici platformların bir örneğidir. Fiyatları aşağıdaki siteden kontrol edebilirsiniz.',
    btn: 'DMarket (Harici Site)'
  },
  'vi-VN': {
    back: '← Quay lại máy quét',
    title: '📝 Lộ trình rút tiền thay thế cho Ví Steam',
    intro: 'Bạn đã bao giờ tự hỏi liệu mình có thể biến quỹ Steam thành tiền thật không? Mặc dù bạn không thể rút trực tiếp từ Steam, nhưng những người chơi kỳ cựu sử dụng các trang web giao diện của bên thứ ba để rút tiền mặt. Dưới đây là tóm tắt nhanh về cách cộng đồng thực hiện điều đó!',
    step1Title: 'Đăng ký trên một trang web giao dịch skin bên ngoài',
    step1Text: <>Vì bạn không thể rút tiền trực tiếp từ ví Steam của mình, bạn cần sử dụng một trang web giao dịch bên ngoài để rút tiền mặt. Đầu tiên, hãy đăng nhập vào nền tảng giao dịch skin toàn cầu như <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> bằng tài khoản Steam của bạn. Đây là một nền tảng tương đối an toàn với hàng triệu người dùng.</>,
    step1Note: '',
    step2Title: 'Mua các mặt hàng có tính thanh khoản cao',
    step2Text: 'Tiếp theo, hãy mua "các mặt hàng được giao dịch trên toàn cầu" trên Chợ cộng đồng Steam. Bí quyết là kiểm tra nhu cầu trên trang web giao dịch trước và chọn các mặt hàng có khối lượng giao dịch lớn như skin Counter-Strike 2 hoặc chìa khóa Team Fortress 2. Tuy nhiên, do bảo mật của Steam, có một thời gian chờ 7 ngày trước khi bạn có thể giao dịch lại các mặt hàng đã mua.',
    step3Title: 'Bán trên trang web giao dịch và rút tiền',
    step3Text: 'Sau thời gian chờ 7 ngày, hãy niêm yết các mặt hàng của bạn trên một trang web giao dịch như DMarket. Bạn có thể bán ngay cho bot của họ nếu đang vội hoặc sử dụng giao dịch giữa những người chơi để kiếm thêm một chút tiền. Sau khi bán và bạn nhận được số dư USD, bạn có thể dễ dàng rút số tiền này về tài khoản ngân hàng của mình thông qua các dịch vụ như Payoneer để hoàn tất việc rút tiền.',
footerTitle: '📝 Reference Link',
    footerText: 'This is an example of the external platforms mentioned in this article. You can check the actual market prices and trading mechanisms on sites like the one below.',
    btn: 'DMarket (External Site)'
  },
  'ja-JP': {
    back: '← スキャナーに戻る',
    title: '📝 steamウォレットの抜け道的な換金ルートについて',
    intro: 'Taskbar Heroなどのゲームで貯まったSteamウォレット残高ですが、実はSteam外のサービスを経由することで、現金として引き出すことが可能です。ここでは、海外のトレーダーやゲーマーの間で一般的に利用されている「アイテムを通じた換金手順」について、その仕組みを分かりやすく解説します。',
    step1Title: '外部のスキン取引サイトに登録を行う',
    step1Text: <>Steamウォレットを直接出金することはできないため、換金には外部の取引サイトを経由する必要があります。まずは世界的なスキン売買プラットフォームである「<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>」などに自身のSteamアカウントでログイン（登録）しておきましょう。数百万人規模のユーザー数がいる比較的安全なプラットフォームです。<br /><span style={{ color: '#f44336', fontSize: '0.9rem' }}>※サイトは日本語選択ができないので、翻訳ツールなどで頑張ってください！</span></>,
    step1Note: '',
    step2Title: '流動性の高いアイテムを購入する',
    step2Text: '次に、Steamのコミュニティマーケットで「世界中で常に取引されているアイテム」を購入します。登録した取引サイトで事前に需要を確認し、取引量の多い『Counter-Strike 2』のスキンや『Team Fortress 2』の鍵（Key）などを選ぶのがコツです。ただし、Steamのセキュリティ仕様上、購入したアイテムを再度トレードするのに7日間の待機期間が必要です。',
    step3Title: '取引サイトに出品し売上金を引き出す',
    step3Text: '7日間の待機期間が過ぎたら、購入したアイテムをDMarketなどの取引サイトに出品します。すぐに換金したい場合はサイト側の自動買取（BOT）を利用し、少しでも高く売りたい場合はプレイヤー間取引を利用するのが一般的です。アイテムが売却されてアカウントに米ドル（USD）が反映されたら、Payoneer経由などで日本の銀行口座へ振り込ませることで換金完了となります。',
    videoTitle: '📺 参考動画（実際の換金手順）',
    warningTitle: '⚠️ 利用に関する注意点（規約について）',
    warningText: '法律上は全く問題ありませんが、外部サイトを使ったアイテムの現金化は、厳密にはSteamの公式利用規約（TOS）ではサポートされていない「グレーゾーン」の行為です。ただし、DMarketのような世界最大規模の取引サイトは長年運営されており、Valve（Steam運営）も事実上黙認しているため、一般ゲーマーがBANされることはほぼありません。あくまで自己責任の「裏技」として活用してください！',
    footerTitle: '📝 参考リンク',
    footerText: '本記事で紹介した外部プラットフォームの一例です。実際のアイテム相場や取引の仕組みについては、下記のサイトなどで確認できます。',
    btn: 'DMarket (外部サイト)'
  },
  'zh-Hans': {
    back: '← 返回扫描器',
    title: '📝 关于Steam钱包的“漏洞”提现路线',
    intro: '你有没有想过，在挂机游戏里赚的Steam余额到底能不能变成真钱？其实，很多老玩家都在用第三方饰品网站把余额提现成现金。这里简单给大家科普一下社区里常用的“搬砖”套路！',
    step1Title: '在外部饰品交易网站上注册',
    step1Text: <>因为不能直接从Steam钱包提现，所以你需要通过外部交易网站来套现。首先，使用你的Steam账号登录像<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>这样的全球饰品交易平台。这是一个拥有数百万用户的相对安全的平台。</>,
    step1Note: '',
    step2Title: '购买高流动性的饰品',
    step2Text: '接着，在Steam社区市场购买“全球流通的热门饰品”。诀窍是提前在交易网站上确认需求，选择交易量大的Counter-Strike 2皮肤或Team Fortress 2钥匙。但是，根据Steam的安全规定，购买的物品需要等待7天才能再次交易。',
    step3Title: '在交易网站上出售并提现',
    step3Text: '7天冷却期结束后，将购买的饰品挂在DMarket等交易网站上出售。想秒出的话可以直接卖给网站的自动收购机器人，想多卖点钱则可以选择玩家间交易。饰品售出并在你的账户中显示美元（USD）余额后，就可以通过Payoneer等渠道提现到你的银行账户，完成套现。',
    videoTitle: '📺 参考视频（实际提现流程）',
    warningTitle: '⚠️ 关于Steam服务条款的注意事项',
    warningText: '虽然这在法律上是合法的，但通过第三方网站提现严格来说属于Steam服务条款中未正式支持的“灰色地带”。不过，像DMarket这样的大型交易网站已经运营多年，Valve（Steam官方）也基本默许了这种行为，普通玩家几乎不会因此被封号。请记住，这只是玩家社区的一个“搬砖技巧”，风险需自行承担！',
    footerTitle: '📝 参考链接',
    footerText: '本文章中介绍的外部平台示例。您可以在下面的网站上查看实际的市场价格和交易机制。',
    btn: 'DMarket (外部网站)'
  },
  'zh-Hant': {
    back: '← 返回掃描器',
    title: '📝 關於Steam錢包的「漏洞」提現路線',
    intro: '你有沒有想過，在掛機遊戲裡賺的Steam餘額到底能不能變成真錢？其實，很多老玩家都在用第三方飾品網站把餘額提現成現金。這裡簡單給大家科普一下社群裡常用的「搬磚」套路！',
    step1Title: '在外部飾品交易網站上註冊',
    step1Text: <>因為不能直接從Steam錢包提現，所以你需要透過外部交易網站來套現。首先，使用你的Steam帳號登入像<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>這樣的全球飾品交易平台。這是一個擁有數百萬用戶的相對安全的平台。</>,
    step1Note: '',
    step2Title: '購買高流動性的飾品',
    step2Text: '接著，在Steam社群市場購買「全球流通的熱門飾品」。訣竅是提前在交易網站上確認需求，選擇交易量大的Counter-Strike 2皮膚或Team Fortress 2鑰匙。但是，根據Steam的安全規定，購買的物品需要等待7天才能再次交易。',
    step3Title: '在交易網站上出售並提現',
    step3Text: '7天冷卻期結束後，將購買的飾品掛在DMarket等交易網站上出售。想秒出的話可以直接賣給網站的自動收購機器人，想多賣點錢則可以選擇玩家間交易。飾品售出並在你的帳戶中顯示美金（USD）餘額後，就可以透過Payoneer等管道提現到你的銀行帳戶，完成套現。',
    videoTitle: '📺 參考影片（實際提現流程）',
    warningTitle: '⚠️ 關於Steam服務條款的注意事項',
    warningText: '雖然這在法律上是合法的，但透過第三方網站提現嚴格來說屬於Steam服務條款中未正式支援的「灰色地帶」。不過，像DMarket這樣的大型交易網站已經營運多年，Valve（Steam官方）也基本默許了這種行為，普通玩家幾乎不會因此被封號。請記住，這只是玩家社群的一個「搬磚技巧」，風險需自行承擔！',
    footerTitle: '📝 參考連結',
    footerText: '本文章中介紹的外部平台示例。您可以在下面的網站上查看實際的市場價格和交易機制。',
    btn: 'DMarket (外部網站)'
  },
  'ko-KR': {
    back: '← 스캐너로 돌아가기',
    title: '📝 Steam 지갑의 우회적인 현금화 루트',
    intro: '게임해서 번 Steam 지갑 잔액, 진짜 돈으로 바꿀 수 없을까 고민해 본 적 있으신가요? 해외 고인물 유저들은 보통 외부 스킨 거래 사이트를 써서 현금으로 환전한답니다. 그 루트를 간단히 알려드릴게요!',
    step1Title: '외부 스킨 거래 사이트 가입하기',
    step1Text: <>Steam 지갑의 자금을 직접 출금할 수 없기 때문에 외부 거래 사이트를 거쳐 현금화해야 합니다. 먼저 <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>과 같은 세계적인 스킨 거래 플랫폼에 본인의 Steam 계정으로 로그인해 둡니다. 수백만 명의 유저가 사용하는 비교적 안전한 플랫폼입니다.</>,
    step1Note: '',
    step2Title: '거래량이 많은 아이템 구매하기',
    step2Text: '다음으로 Steam 커뮤니티 장터에서 "전 세계적으로 거래가 활발한 아이템"을 구매합니다. 가입한 거래 사이트에서 미리 수요를 확인하고 Counter-Strike 2 스킨이나 Team Fortress 2 키 등을 고르는 것이 요령입니다. 단, Steam의 보안 정책상 구매한 아이템을 다시 거래하려면 7일간의 대기 기간이 필요합니다.',
    step3Title: '거래 사이트에 판매하고 출금하기',
    step3Text: '7일간의 대기 기간이 지나면 구매한 아이템을 DMarket 등 거래 사이트에 판매합니다. 즉시 현금화하고 싶다면 사이트의 자동 매입(BOT)을 이용하고, 조금이라도 비싸게 팔려면 유저 간 거래를 이용하는 것이 일반적입니다. 아이템이 판매되어 계정에 달러(USD) 잔액이 들어오면 Payoneer 등을 통해 본인의 은행 계좌로 출금하여 현금화를 완료합니다.',
    videoTitle: '📺 참고 영상 (실제 환전 과정)',
    warningTitle: '⚠️ Steam 이용 약관 관련 주의사항',
    warningText: '법적으로는 문제없지만, 제3자 사이트를 이용한 아이템 현금화는 엄밀히 말해 Steam의 공식 이용 약관(TOS)에서 지원하지 않는 "회색 지대"입니다. 하지만 DMarket 같은 대형 사이트는 수년간 운영되어 왔으며 Valve도 사실상 묵인하고 있어 일반 게이머가 제재를 받는 일은 거의 없습니다. 어디까지나 커뮤니티의 비공식 "팁"이므로 본인의 책임 하에 활용하세요!',
    footerTitle: '📝 참고 링크',
    footerText: '본 문서에서 소개한 외부 플랫폼의 예시입니다. 실제 아이템 시세나 거래 방식은 아래 사이트에서 확인할 수 있습니다.',
    btn: 'DMarket (외부 사이트)'
  },
  'ru-RU': {
    back: '← Назад к сканеру',
    title: '📝 Обходной путь вывода средств из кошелька Steam',
    intro: 'Задавались вопросом, можно ли вывести заработанное в Taskbar Hero в реал? Напрямую нельзя, но опытные игроки используют сторонние сайты скинов для вывода в наличные. Вот как работает эта схема!',
    step1Title: 'Регистрация на внешнем сайте торговли скинами',
    step1Text: <>Поскольку вывести средства напрямую из кошелька Steam нельзя, для обналичивания нужно использовать сторонние торговые площадки. Сначала авторизуйтесь на глобальной платформе вроде <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> через свой аккаунт Steam. Это относительно безопасная платформа, которой пользуются миллионы людей.</>,
    step1Note: '',
    step2Title: 'Покупка высоколиквидных предметов',
    step2Text: 'Затем купите на Торговой площадке Steam «ходовые предметы». Хитрость в том, чтобы заранее проверить спрос на сайте и выбрать предметы с высоким объемом торгов, такие как скины Counter-Strike 2 или ключи Team Fortress 2. Однако из-за политики безопасности Steam для повторной продажи купленных предметов необходимо подождать 7 дней.',
    step3Title: 'Продажа на сайте и вывод средств',
    step3Text: 'Спустя 7 дней выставьте купленные предметы на продажу на сайте вроде DMarket. Если деньги нужны срочно, продайте их автоматическим ботам, а если хотите получить немного больше — используйте торговлю между игроками. Как только предметы продадутся и на балансе появятся доллары (USD), просто выведите их на банковский счет через такие сервисы, как Payoneer.',
    videoTitle: '📺 Видео-руководство (Справка)',
    warningTitle: '⚠️ Важное примечание о правилах Steam',
    warningText: 'Хотя по закону это абсолютно легально, вывод средств через сторонние сайты технически является "серой зоной", не поддерживаемой Условиями обслуживания Steam. Тем не менее, крупные сайты работают годами при молчаливом согласии Valve, и обычных игроков почти никогда не банят. Помните, что это неофициальная "фишка" сообщества, используемая на ваш страх и риск!',
    footerTitle: '📝 Ссылка для справки',
    footerText: 'Это пример внешней платформы, упомянутой в статье. Вы можете проверить реальные рыночные цены на сайте ниже.',
    btn: 'DMarket (Внешний сайт)'
  },
  'es-ES': {
    back: '← Volver al escáner',
    title: '📝 Ruta alternativa para retirar fondos de la Cartera de Steam',
    intro: '¿Alguna vez te has preguntado si puedes convertir el saldo de Steam en dinero real? Aunque no puedes retirarlo directamente de Steam, los jugadores veteranos usan sitios de skins de terceros para retirarlo en efectivo. ¡Aquí te explicamos cómo lo hace la comunidad!',
    step1Title: 'Regístrate en un sitio externo de comercio de skins',
    step1Text: <>Dado que no puedes retirar fondos directamente de tu cartera de Steam, debes usar un sitio comercial externo para retirar dinero. Primero, inicia sesión en una plataforma global de comercio de skins como <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando tu cuenta de Steam. Es una plataforma relativamente segura con millones de usuarios.</>,
    step1Note: '',
    step2Title: 'Comprar artículos de alta liquidez en Steam',
    step2Text: 'A continuación, compra "artículos de comercio mundial" en el Mercado de la Comunidad de Steam. El truco es verificar la demanda en el sitio de comercio de antemano y elegir artículos de alto volumen como skins de Counter-Strike 2 o llaves de Team Fortress 2. Sin embargo, debido a la seguridad de Steam, hay un período de espera de 7 días antes de poder intercambiar los artículos comprados nuevamente.',
    step3Title: 'Vender en el sitio y retirar el efectivo',
    step3Text: 'Después del período de espera de 7 días, pon a la venta tus artículos en un sitio comercial como DMarket. Si tienes prisa, puedes venderlos al instante a sus bots, o usar el comercio entre jugadores si quieres obtener un poco más de dinero. Una vez que se vendan y obtengas un saldo en dólares (USD), puedes transferirlo fácilmente a tu cuenta bancaria a través de servicios como Payoneer para completar el retiro.',
    videoTitle: '📺 Guía en video (Referencia)',
    warningTitle: '⚠️ Nota importante sobre los Términos de Servicio de Steam',
    warningText: 'Aunque es legal, retirar artículos a través de sitios de terceros es técnicamente un área gris no respaldada oficialmente por los Términos de Servicio de Steam. Sin embargo, sitios enormes como DMarket han operado durante años bajo la aprobación tácita de Valve. Los jugadores nunca son penalizados. ¡Solo recuerda que es un "truco" de la comunidad usado bajo tu propio riesgo!',
    footerTitle: '📝 Enlace de referencia',
    footerText: 'Este es un ejemplo de las plataformas externas mencionadas en este artículo. Puedes consultar los precios y mecanismos en el siguiente sitio.',
    btn: 'DMarket (Sitio externo)'
  },
  'fr-FR': {
    back: '← Retour au scanner',
    title: '📝 Itinéraire alternatif pour retirer les fonds du portefeuille Steam',
    intro: 'Vous vous êtes déjà demandé si vous pouviez transformer les fonds Steam en argent réel ? Bien que vous ne puissiez pas les retirer directement de Steam, les joueurs vétérans utilisent des sites de skins tiers pour les retirer en espèces. Voici comment la communauté procède !',
    step1Title: 'S\'inscrire sur un site externe d\'échange de skins',
    step1Text: <>Puisque vous ne pouvez pas retirer des fonds directement de votre portefeuille Steam, vous devez utiliser un site externe pour encaisser. Tout d'abord, connectez-vous à une plateforme mondiale d'échange de skins comme <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> en utilisant votre compte Steam. Il s'agit d'une plateforme relativement sûre comptant des millions d'utilisateurs.</>,
    step1Note: '',
    step2Title: 'Acheter des articles très liquides sur Steam',
    step2Text: 'Ensuite, achetez des "articles mondialement échangés" sur le marché de la communauté Steam. L\'astuce consiste à vérifier la demande sur le site d\'échange au préalable et à choisir des articles à fort volume comme des skins Counter-Strike 2 ou des clés Team Fortress 2. Cependant, en raison de la sécurité de Steam, il y a une période d\'attente de 7 jours avant de pouvoir échanger à nouveau les articles achetés.',
    step3Title: 'Vendre sur le site et retirer l\'argent',
    step3Text: 'Après la période d\'attente de 7 jours, mettez vos articles en vente sur un site comme DMarket. Vous pouvez utiliser leurs bots pour une vente instantanée si vous êtes pressé, ou utiliser l\'échange entre joueurs pour obtenir un peu plus d\'argent. Une fois vendus et que vous avez un solde en dollars (USD), vous pouvez facilement le transférer sur votre compte bancaire via des services comme Payoneer pour terminer le retrait.',
    videoTitle: '📺 Guide vidéo (Référence)',
    warningTitle: '⚠️ Remarque importante sur les conditions de Steam',
    warningText: 'Bien que légal, le retrait via des sites tiers est techniquement une zone grise non officiellement soutenue par les conditions de service de Steam. Cependant, des sites massifs comme DMarket opèrent depuis des années avec l\'approbation tacite de Valve. Rappelez-vous simplement qu\'il s\'agit d\'une "astuce" de la communauté.',
    footerTitle: '📝 Lien de référence',
    footerText: 'Ceci est un exemple des plateformes externes mentionnées. Vous pouvez vérifier les prix sur le site ci-dessous.',
    btn: 'DMarket (Site externe)'
  },
  'de-DE': {
    back: '← Zurück zum Scanner',
    title: '📝 Alternativer Weg zur Auszahlung von Steam-Guthaben',
    intro: 'Haben Sie sich jemals gefragt, ob Sie Steam-Guthaben in echtes Geld verwandeln können? Obwohl Sie es nicht direkt von Steam abheben können, nutzen erfahrene Spieler Skin-Seiten von Drittanbietern, um es sich in bar auszahlen zu lassen. Hier ist eine kurze Erklärung, wie die Community das macht!',
    step1Title: 'Auf einer externen Skin-Handelsseite registrieren',
    step1Text: <>Da Sie Ihr Steam-Guthaben nicht direkt auszahlen können, müssen Sie eine externe Handelsseite nutzen. Melden Sie sich zunächst mit Ihrem Steam-Konto bei einer globalen Skin-Handelsplattform wie <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> an. Es ist eine relativ sichere Plattform mit Millionen von Nutzern.</>,
    step1Note: '',
    step2Title: 'Hochliquide Gegenstände auf Steam kaufen',
    step2Text: 'Kaufen Sie als Nächstes "weltweit gehandelte Gegenstände" auf dem Steam-Community-Markt. Der Trick besteht darin, die Nachfrage auf der Handelsseite im Voraus zu prüfen und Gegenstände mit hohem Volumen wie Counter-Strike 2-Skins oder Team Fortress 2-Schlüssel auszuwählen. Aufgrund der Sicherheit von Steam gibt es jedoch eine 7-tägige Wartezeit, bevor Sie gekaufte Gegenstände wieder handeln können.',
    step3Title: 'Auf der Handelsseite verkaufen und Geld abheben',
    step3Text: 'Listen Sie Ihre Gegenstände nach der 7-tägigen Wartezeit auf einer Handelsseite wie DMarket auf. Sie können sie sofort an deren Bots verkaufen, wenn Sie es eilig haben, oder den Handel zwischen Spielern nutzen, um etwas mehr Geld zu bekommen. Sobald sie verkauft sind und Sie ein USD-Guthaben haben, können Sie dieses über Dienste wie Payoneer problemlos auf Ihr Bankkonto überweisen, um die Auszahlung abzuschließen.',
    videoTitle: '📺 Video-Anleitung (Referenz)',
    warningTitle: '⚠️ Wichtiger Hinweis zu den Steam-Nutzungsbedingungen',
    warningText: 'Obwohl legal, ist die Auszahlung über Drittanbieter technisch gesehen eine Grauzone, die von den Steam-Nutzungsbedingungen nicht offiziell unterstützt wird. Allerdings operieren riesige Seiten wie DMarket seit Jahren unter stillschweigender Billigung von Valve. Denken Sie daran, dass es ein inoffizieller "Trick" der Community ist.',
    footerTitle: '📝 Referenzlink',
    footerText: 'Dies ist ein Beispiel für die genannten externen Plattformen. Sie können die Preise auf der untenstehenden Website überprüfen.',
    btn: 'DMarket (Externe Seite)'
  },
  'pt-BR': {
    back: '← Voltar ao Scanner',
    title: '📝 Rota alternativa para sacar fundos da Carteira Steam',
    intro: 'Já se perguntou se você pode transformar os fundos do Steam em dinheiro real? Embora você não possa sacar diretamente do Steam, jogadores veteranos usando sites de skins de terceiros para sacar em dinheiro. Aqui está um rápido resumo de como a comunidade faz isso!',
    step1Title: 'Registre-se em um site de comércio de skins',
    step1Text: <>Como você não pode sacar fundos diretamente da sua carteira Steam, você precisa usar um site de terceiros para sacar. Primeiro, faça o login em uma plataforma global de comércio de skins como o <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando sua conta Steam. É uma plataforma relativamente segura com milhões de usuários.</>,
    step1Note: '',
    step2Title: 'Compre itens de alta liquidez no Steam',
    step2Text: 'Em seguida, compre "itens comercializados globalmente" no Mercado da Comunidade Steam. O truque é verificar a demanda no site de negociação com antecedência e escolher itens de alto volume, como skins de Counter-Strike 2 ou chaves de Team Fortress 2. No entanto, devido à segurança do Steam, há um período de espera de 7 dias antes de você poder trocar os itens comprados novamente.',
    step3Title: 'Venda no site de comércio e saque o dinheiro',
    step3Text: 'Após o período de espera de 7 dias, liste seus itens em um site como o DMarket. Se estiver com pressa, você pode vendê-los instantaneamente para os bots deles, ou usar a negociação entre jogadores para conseguir um pouco mais de dinheiro. Depois que os itens forem vendidos e o saldo em dólares (USD) for refletido em sua conta, você pode sacá-lo para sua conta bancária por meio de serviços como o Payoneer para concluir o processo.',
    videoTitle: '📺 Guia em Vídeo (Referência)',
    warningTitle: '⚠️ Nota Importante sobre os Termos do Steam',
    warningText: 'Embora seja legal, sacar itens em sites de terceiros é uma área cinzenta não apoiada oficialmente pelos Termos do Steam. Mas sites como DMarket operam há anos sob a aprovação de Valve. Lembre-se, é um "truque" da comunidade.',
    footerTitle: '📝 Link de Referência',
    footerText: 'Este é um exemplo de plataformas externas. Você pode verificar os preços reais no site abaixo.',
    btn: 'DMarket (Site Externo)'
  },
  'tr-TR': {
    back: '← Tarayıcıya Dön',
    title: '📝 Steam Cüzdanı için alternatif nakit çekme rotası',
    intro: 'Steam fonlarını gerçek paraya dönüştürüp dönüştüremeyeceğinizi hiç merak ettiniz mi? Doğrudan Steam\'den çekemeseniz de usta oyuncular nakit çekmek için üçüncü taraf görünüm (skin) sitelerini kullanırlar. İşte topluluğun bunu nasıl yaptığına dair kısa bir özet!',
    step1Title: 'Harici bir görünüm ticareti sitesine kaydolun',
    step1Text: <>Steam cüzdanınızdan doğrudan para çekemediğiniz için, nakit çekmek adına harici bir ticaret sitesi kullanmanız gerekir. Öncelikle, Steam hesabınızı kullanarak <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> gibi küresel bir platforma giriş yapın. Milyonlarca kullanıcısı olan nispeten güvenli bir platformdur.</>,
    step1Note: '',
    step2Title: 'Steam\'de yüksek likiditeye sahip öğeler satın alın',
    step2Text: 'Ardından, Steam Topluluk Pazarında "küresel olarak ticareti yapılan öğeler" satın alın. İşin püf noktası, ticaret sitesindeki talebi önceden kontrol etmek ve Counter-Strike 2 görünümleri veya Team Fortress 2 anahtarları gibi yüksek hacimli öğeleri seçmektir. Ancak, Steam\'in güvenliği nedeniyle, satın alınan öğeleri tekrar takas edebilmek için 7 günlük bir bekleme süresi vardır.',
    step3Title: 'Ticaret sitesinde satın ve paranızı çekin',
    step3Text: '7 günlük bekleme süresinden sonra, öğelerinizi DMarket gibi bir ticaret sitesinde listeleyin. Aceleniz varsa botlarına anında satabilir veya biraz daha fazla para kazanmak için oyuncular arası ticareti kullanabilirsiniz. Satıldıktan ve bir USD bakiyesi elde ettikten sonra, işlemi tamamlamak için Payoneer gibi hizmetler aracılığıyla bunu banka hesabınıza kolayca çekebilirsiniz.',
    videoTitle: '📺 Video Kılavuzu (Referans)',
    warningTitle: '⚠️ Steam TOS Hakkında Önemli Not',
    warningText: 'Yasal olmasına rağmen, üçüncü taraf siteler aracılığıyla nakit çekmek, Steam\'in Hizmet Şartları tarafından resmi olarak desteklenmeyen gri bir alandır. Ancak, DMarket gibi devasa siteler Valve\'in zımni onayı altında yıllardır faaliyet göstermektedir. Bunun topluluğun resmi olmayan bir "hilesi" olduğunu unutmayın.',
    footerTitle: '📝 Referans Bağlantısı',
    footerText: 'Bu, bahsedilen harici platformların bir örneğidir. Fiyatları aşağıdaki siteden kontrol edebilirsiniz.',
    btn: 'DMarket (Harici Site)'
  },
  'vi-VN': {
    back: '← Quay lại máy quét',
    title: '📝 Lộ trình rút tiền thay thế cho Ví Steam',
    intro: 'Bạn đã bao giờ tự hỏi liệu mình có thể biến quỹ Steam thành tiền thật không? Mặc dù bạn không thể rút trực tiếp từ Steam, nhưng những người chơi kỳ cựu sử dụng các trang web giao diện của bên thứ ba để rút tiền mặt. Dưới đây là tóm tắt nhanh về cách cộng đồng thực hiện điều đó!',
    step1Title: 'Đăng ký trên một trang web giao dịch skin bên ngoài',
    step1Text: <>Vì bạn không thể rút tiền trực tiếp từ ví Steam của mình, bạn cần sử dụng một trang web giao dịch bên ngoài để rút tiền mặt. Đầu tiên, hãy đăng nhập vào nền tảng giao dịch skin toàn cầu như <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> bằng tài khoản Steam của bạn. Đây là một nền tảng tương đối an toàn với hàng triệu người dùng.</>,
    step1Note: '',
    step2Title: 'Mua các mặt hàng có tính thanh khoản cao',
    step2Text: 'Tiếp theo, hãy mua "các mặt hàng được giao dịch trên toàn cầu" trên Chợ cộng đồng Steam. Bí quyết là kiểm tra nhu cầu trên trang web giao dịch trước và chọn các mặt hàng có khối lượng giao dịch lớn như skin Counter-Strike 2 hoặc chìa khóa Team Fortress 2. Tuy nhiên, do bảo mật của Steam, có một thời gian chờ 7 ngày trước khi bạn có thể giao dịch lại các mặt hàng đã mua.',
    step3Title: 'Bán trên trang web giao dịch và rút tiền',
    step3Text: 'Sau thời gian chờ 7 ngày, hãy niêm yết các mặt hàng của bạn trên một trang web giao dịch như DMarket. Bạn có thể bán ngay cho bot của họ nếu đang vội hoặc sử dụng giao dịch giữa những người chơi để kiếm thêm một chút tiền. Sau khi bán và bạn nhận được số dư USD, bạn có thể dễ dàng rút số tiền này về tài khoản ngân hàng của mình thông qua các dịch vụ như Payoneer để hoàn tất việc rút tiền.',
    videoTitle: '📺 Hướng dẫn bằng video (Tham khảo)',
    warningTitle: '⚠️ Lưu ý quan trọng về Điều khoản Steam',
    warningText: 'Mặc dù hoàn toàn hợp pháp, nhưng việc rút tiền mặt qua các trang web bên thứ ba về mặt kỹ thuật là một vùng xám không được Điều khoản Dịch vụ của Steam chính thức hỗ trợ. Tuy nhiên, các trang web lớn như DMarket đã hoạt động trong nhiều năm dưới sự chấp thuận ngầm của Valve. Hãy nhớ rằng đây là một "mẹo" không chính thức của cộng đồng!',
    footerTitle: '📝 Liên kết tham khảo',
    footerText: 'Đây là một ví dụ về các nền tảng bên ngoài. Bạn có thể kiểm tra giá trên trang web bên dưới.',
    btn: 'DMarket (Trang web bên ngoài)'
  },
  'id-ID': {
    back: '← Kembali ke Pemindai',
    title: '📝 Rute pencairan alternatif untuk Steam Wallet',
    intro: 'Pernahkah Anda bertanya-tanya apakah Anda dapat mengubah dana Steam Wallet yang Anda peroleh dari Taskbar Hero menjadi uang sungguhan? Meskipun Anda tidak dapat menariknya secara langsung dari Steam, pemain veteran menggunakan situs skin pihak ketiga untuk mencairkannya ke rekening bank. Berikut penjelasan singkat tentang cara komunitas melakukannya!',
    step1Title: 'Daftar di situs perdagangan skin eksternal',
    step1Text: <>Karena Anda tidak dapat menarik dana langsung dari dompet Steam Anda, Anda perlu menggunakan situs perdagangan eksternal untuk menguangkannya. Pertama, masuk ke platform perdagangan skin global seperti <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> menggunakan akun Steam Anda. Ini adalah platform yang relatif aman dengan jutaan pengguna.</>,
    step1Note: '',
    step2Title: 'Beli item dengan likuiditas tinggi di Steam',
    step2Text: 'Selanjutnya, beli "item yang diperdagangkan secara global" di Pasar Komunitas Steam. Triknya adalah dengan memeriksa permintaan di situs perdagangan terlebih dahulu dan memilih item dengan volume tinggi seperti skin Counter-Strike 2 atau kunci Team Fortress 2. Namun, karena keamanan Steam, ada masa tunggu 7 hari sebelum Anda dapat memperdagangkan kembali item yang dibeli.',
    step3Title: 'Jual di situs perdagangan dan tarik tunai',
    step3Text: 'Setelah masa tunggu 7 hari, daftarkan item Anda di situs perdagangan seperti DMarket. Anda dapat menjual langsung ke bot mereka jika sedang terburu-buru, atau menggunakan perdagangan antar pemain jika ingin mendapatkan sedikit lebih banyak uang. Setelah terjual dan Anda mendapatkan saldo USD, Anda dapat dengan mudah menariknya ke rekening bank Anda melalui layanan seperti Payoneer untuk menyelesaikan pencairan.',
    videoTitle: '📺 Panduan Video (Referensi)',
    warningTitle: '⚠️ Catatan Penting Mengenai TOS Steam',
    warningText: 'Meskipun sepenuhnya legal, mencairkan dana melalui situs pihak ketiga secara teknis merupakan area abu-abu yang tidak didukung secara resmi oleh Ketentuan Layanan Steam. Namun, situs besar seperti DMarket telah beroperasi selama bertahun-tahun di bawah persetujuan diam-diam Valve. Ingatlah bahwa ini adalah "trik" komunitas tidak resmi yang Anda gunakan dengan risiko Anda sendiri!',
    footerTitle: '📝 Tautan Referensi',
    footerText: 'Ini adalah contoh platform eksternal yang disebutkan dalam artikel ini. Anda dapat memeriksa harga pasar yang sebenarnya di situs di bawah ini.',
    btn: 'DMarket (Situs Eksternal)'
  },
  'th-TH': {
    back: '← กลับไปที่สแกนเนอร์',
    title: '📝 เส้นทางถอนเงินทางเลือกสำหรับ Steam Wallet',
    intro: 'เคยสงสัยไหมว่าคุณสามารถเปลี่ยนเงินใน Steam Wallet ที่ได้จาก Taskbar Hero เป็นเงินจริงได้หรือไม่ แม้ว่าคุณจะไม่สามารถถอนออกจาก Steam ได้โดยตรง แต่ผู้เล่นมือเก๋าใช้เว็บไซต์ซื้อขายสกินของบุคคลที่สามเพื่อถอนเงินเข้าบัญชีธนาคาร นี่คือบทสรุปสั้นๆ ว่าพวกเขาทำได้อย่างไร!',
    step1Title: 'ลงทะเบียนบนเว็บไซต์ซื้อขายสกินภายนอก',
    step1Text: <>เนื่องจากคุณไม่สามารถถอนเงินออกจากกระเป๋าเงิน Steam ของคุณได้โดยตรง คุณต้องใช้เว็บไซต์ซื้อขายภายนอกเพื่อถอนเงินเป็นเงินสด ขั้นแรก ให้เข้าสู่ระบบแพลตฟอร์มการซื้อขายสกินระดับโลกอย่าง <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> โดยใช้บัญชี Steam ของคุณ มันเป็นแพลตฟอร์มที่ค่อนข้างปลอดภัยและมีผู้ใช้งานหลายล้านคน</>,
    step1Note: '',
    step2Title: 'ซื้อไอเทมที่มีสภาพคล่องสูงบน Steam',
    step2Text: 'ต่อไป ซื้อ "ไอเทมที่มีการซื้อขายทั่วโลก" ในตลาดชุมชน Steam เคล็ดลับคือตรวจสอบความต้องการบนเว็บไซต์ซื้อขายล่วงหน้าและเลือกไอเทมที่มีปริมาณการซื้อขายสูง เช่น สกิน Counter-Strike 2 หรือกุญแจ Team Fortress 2 อย่างไรก็ตาม เนื่องจากระบบความปลอดภัยของ Steam จึงมีระยะเวลารอคอย 7 วันก่อนที่คุณจะสามารถซื้อขายไอเทมที่ซื้อมาได้อีกครั้ง',
    step3Title: 'ขายบนเว็บไซต์ซื้อขายและถอนเงินสด',
    step3Text: 'หลังจากระยะเวลารอ 7 วัน ให้นำไอเทมของคุณไปวางขายบนเว็บไซต์ซื้อขายอย่าง DMarket คุณสามารถขายให้กับบอทของพวกเขาได้ทันทีหากคุณรีบ หรือใช้การซื้อขายระหว่างผู้เล่นหากต้องการเงินเพิ่มขึ้นเล็กน้อย เมื่อขายได้และคุณมียอดคงเหลือเป็น USD คุณสามารถถอนเข้าบัญชีธนาคารของคุณผ่านบริการอย่าง Payoneer เพื่อถอนเงินให้เสร็จสมบูรณ์ได้อย่างง่ายดาย',
    videoTitle: '📺 วิดีโอแนะนำ (ข้อมูลอ้างอิง)',
    warningTitle: '⚠️ หมายเหตุสำคัญเกี่ยวกับข้อตกลงในการให้บริการของ Steam',
    warningText: 'แม้ว่าจะถูกต้องตามกฎหมายอย่างสมบูรณ์ แต่การถอนเงินผ่านเว็บไซต์ของบุคคลที่สามในทางเทคนิคถือเป็นพื้นที่สีเทาที่ไม่ได้รับการสนับสนุนอย่างเป็นทางการจากข้อตกลงในการให้บริการของ Steam อย่างไรก็ตาม เว็บไซต์ขนาดใหญ่อย่าง DMarket ได้เปิดดำเนินการมาหลายปีภายใต้การอนุมัติโดยปริยายของ Valve โปรดจำไว้ว่านี่เป็น "เคล็ดลับ" ของชุมชนอย่างไม่เป็นทางการที่คุณต้องรับความเสี่ยงเอง!',
    footerTitle: '📝 ลิงก์อ้างอิง',
    footerText: 'นี่คือตัวอย่างของแพลตภอร์มภายนอกที่กล่าวถึงในบทความนี้ คุณสามารถตรวจสอบราคาตลาดจริงได้ที่เว็บไซต์ด้านล่าง',
    btn: 'DMarket (เว็บไซต์ภายนอก)'
  },
  'pl-PL': {
    back: '← Powrót do skanera',
    title: '📝 Alternatywna trasa wypłaty z Portfela Steam',
    intro: 'Zastanawiałeś się kiedyś, czy możesz zamienić środki w Portfelu Steam zarobione w Taskbar Hero na prawdziwe pieniądze? Chociaż nie możesz ich wypłacić bezpośrednio ze Steam, weterani używają zewnętrznych stron ze skinami, aby wypłacić je na konto bankowe. Oto krótkie podsumowanie, jak społeczność to robi!',
    step1Title: 'Zarejestruj się na zewnętrznej stronie wymiany skinów',
    step1Text: <>Ponieważ nie możesz wypłacić środków bezpośrednio ze swojego portfela Steam, musisz użyć zewnętrznej strony do handlu, aby wypłacić gotówkę. Najpierw zaloguj się na globalną platformę handlu skinami, taką jak <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>, używając swojego konta Steam. Jest to stosunkowo bezpieczna platforma z milionami użytkowników.</>,
    step1Note: '',
    step2Title: 'Kupuj przedmioty o wysokiej płynności na Steam',
    step2Text: 'Następnie kup "globalnie handlowane przedmioty" na Rynku Społeczności Steam. Sztuką jest wcześniejsze sprawdzenie popytu na stronie handlowej i wybranie przedmiotów o dużej liczbie transakcji, takich jak skiny do Counter-Strike 2 lub klucze do Team Fortress 2. Jednak ze względu na bezpieczeństwo Steam istnieje 7-dniowy okres oczekiwania, zanim będzie można ponownie handlować kupionymi przedmiotami.',
    step3Title: 'Sprzedaj na stronie handlowej i wypłać gotówkę',
    step3Text: 'Po 7-dniowym okresie oczekiwania wystaw swoje przedmioty na stronie handlowej, takiej jak DMarket. Możesz natychmiast sprzedać je ich botom, jeśli się spieszysz, lub użyć handlu między graczami, aby uzyskać trochę więcej gotówki. Po sprzedaży i uzyskaniu salda w USD możesz łatwo wypłacić je na swoje konto bankowe za pośrednictwem usług takich jak Payoneer, aby zakończyć wypłatę.',
    videoTitle: '📺 Przewodnik wideo (Odniesienie)',
    warningTitle: '⚠️ Ważna uwaga dotycząca warunków świadczenia usług Steam',
    warningText: 'Chociaż jest to całkowicie legalne, wypłacanie przedmiotów za pośrednictwem witryn stron trzecich jest technicznie szarą strefą, która nie jest oficjalnie obsługiwana przez Warunki świadczenia usług Steam. Jednak ogromne witryny, takie jak DMarket, działają od lat za milczącą zgodą Valve. Pamiętaj tylko, że jest to nieoficjalna "sztuczka" społeczności używana na własne ryzyko!',
    footerTitle: '📝 Link referencyjny',
    footerText: 'To jest przykład zewnętrznych platform wymienionych w tym artykule. Możesz sprawdzić rzeczywiste ceny rynkowe na poniższej stronie.',
    btn: 'DMarket (Strona zewnętrzna)'
  },
  'uk-UA': {
    back: '← Назад до сканера',
    title: '📝 Альтернативний маршрут виведення коштів з Гаманця Steam',
    intro: 'Коли-небудь замислювалися, чи можна перетворити кошти з Гаманця Steam, зароблені в Taskbar Hero, на реальні гроші? Хоча ви не можете вивести їх безпосередньо зі Steam, ветерани використовують сторонні сайти зі скінами для виведення на банківський рахунок. Ось короткий огляд того, як це робить спільнота!',
    step1Title: 'Зареєструйтеся на зовнішньому сайті обміну скінами',
    step1Text: <>Оскільки ви не можете вивести кошти безпосередньо зі свого гаманця Steam, вам потрібно використовувати сторонній торговий майданчик для виведення коштів. Спочатку увійдіть на глобальну платформу торгівлі скінами, таку як <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>, використовуючи свій обліковий запис Steam. Це відносно безпечна платформа з мільйонами користувачів.</>,
    step1Note: '',
    step2Title: 'Купуйте високоліквідні предмети в Steam',
    step2Text: 'Далі купуйте "предмети, якими торгують у всьому світі" на Торговому майданчику спільноти Steam. Хитрість полягає в тому, щоб заздалегідь перевірити попит на торговому сайті і вибрати предмети з великим обсягом торгів, такі як скіни Counter-Strike 2 або ключі Team Fortress 2. Однак через політику безпеки Steam існує 7-денний період очікування, перш ніж ви зможете знову торгувати придбаними предметами.',
    step3Title: 'Продайте на торговому сайті та виведіть готівку',
    step3Text: 'Після 7-денного періоду очікування виставте свої предмети на торговому сайті, такому як DMarket. Ви можете миттєво продати їхнім ботам, якщо поспішаєте, або використовувати торгівлю між гравцями, щоб отримати трохи більше готівки. Після продажу та отримання балансу в доларах США ви можете легко вивести їх на свій банківський рахунок через такі сервіси, як Payoneer, щоб завершити виведення.',
    videoTitle: '📺 Відеопосібник (Довідка)',
    warningTitle: '⚠️ Важлива примітка щодо Умов обслуговування Steam',
    warningText: 'Хоча юридично це абсолютно нормально, виведення коштів через сторонні сайти технічно є "сірою зоною", яка офіційно не підтримується Умовами обслуговування Steam. Однак великі сайти, такі як DMarket, працюють роками за мовчазної згоди Valve. Просто пам\'ятайте, що це неофіційна "фішка" спільноти, яку ви використовуєте на свій страх і ризик!',
    footerTitle: '📝 Довідкове посилання',
    footerText: 'Це приклад зовнішніх платформ, згаданих у цій статті. Ви можете перевірити реальні ринкові ціни на сайті нижче.',
    btn: 'DMarket (Зовнішній сайт)'
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
          <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{
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
