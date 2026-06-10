'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const translations = {
  'en-US': {
    back: '← Back to Scanner',
    title: '📝 Loophole cashout route for Steam Wallet',
    intro: 'Ever wondered if you can turn the Steam Wallet funds you earned from Taskbar Hero into real money? While you can\'t withdraw directly from Steam, veteran players use third-party skin sites to cash out to your bank account. Here\'s a quick rundown of how the community does it!',
    step1Title: 'Buy "Liquid" Items on Steam',
    step1Text: 'Since you can\'t withdraw funds directly, you use your Steam balance to buy highly demanded items on the Community Market. CS2 skins or TF2 keys are usually the go-to.',
    step1Note: '※ Note: Steam makes you wait 7 days before you can trade newly bought items, so you just gotta wait it out.',
    step2Title: 'Sell them on external sites (like DMarket)',
    step2Text: <>After 7 days, log into a global skin trading platform like <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> using your Steam account. It is a relatively safe platform with millions of users. Select your items and sell them. You can instant-sell to their bots if you're in a hurry, or use peer-to-peer trading to get a bit more cash.</>,
    step3Title: 'Withdraw your cash (USD)',
    step3Text: 'Once sold, you get a USD balance on the site. You can easily withdraw this to your bank account via services like Payoneer. Easy!',
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
    step1Title: 'Steamマーケットで「流動性の高いアイテム」を購入する',
    step1Text: 'Steamウォレットを直接出金することはできないため、まずはSteamのコミュニティマーケットで「世界中で常に取引されているアイテム」を購入します。取引量の多い『CS2』のスキンや『TF2』の鍵（Key）などがよく選ばれます。',
    step1Note: '※注意：Steamのセキュリティ仕様上、購入したアイテムは7日間トレード（移動）ができないため、外部サイトへ持ち出すまでに1週間の待機期間が必要です。',
    step2Title: '外部の取引サイト（DMarket等）へ出品する',
    step2Text: <>7日間の待機期間が過ぎたら、世界的なスキン売買プラットフォームである「<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>」などに自身のSteamアカウントでログインします。数百万人規模のユーザー数がいる比較的安全なプラットフォームになっています。サイト上で該当のアイテムを選択し、売却手続きを行います。すぐに換金したい場合はサイト側の自動買取（BOT）を利用し、少しでも高く売りたい場合はプレイヤー間取引を利用するのが一般的です。</>,
    step3Title: '売上金（USD）を引き出す',
    step3Text: 'サイト内でアイテムが売却されると、あなたのアカウントに米ドル（USD）の残高が反映されます。あとはこの残高を、Payoneer経由などで日本の銀行口座へ振り込ませることで換金完了となります。',
    videoTitle: '📺 参考動画（実際の換金手順）',
    warningTitle: '⚠️ 利用に関する注意点（規約について）',
    warningText: '法律上は全く問題ありませんが、外部サイトを使ったアイテムの現金化は、厳密にはSteamの公式利用規約（TOS）ではサポートされていない「グレーゾーン」の行為です。ただし、DMarketのような世界最大規模の取引サイトは長年運営されており、Valve（Steam運営）も事実上黙認しているため、一般ゲーマーがBANされることはほぼありません。あくまで自己責任の「裏技」として活用してください！',
    footerTitle: '📝 参考リンク',
    footerText: '本記事で紹介した外部プラットフォームの一例です。実際のアイテム相場や取引の仕組みについては、下記のサイトなどで確認できます。サイトは日本語選択ができないので、翻訳ツールなどで頑張ってください！',
    btn: 'DMarket (外部サイト)'
  },
  'zh-Hans': {
    back: '← 返回扫描器',
    title: '📝 关于Steam钱包的“漏洞”提现路线',
    intro: '你有没有想过，在挂机游戏里赚的Steam余额到底能不能变成真钱？其实，很多老玩家都在用第三方饰品网站把余额提现成现金。这里简单给大家科普一下社区里常用的“搬砖”套路！',
    step1Title: '在Steam买“硬通货”',
    step1Text: '因为Steam不能直接提现，所以大家一般先去社区市场买一些全球流通的热门饰品，比如CS2的皮肤或者TF2的钥匙。',
    step1Note: '※ 注意：Steam规定刚买的饰品有7天交易冷却，所以得先放库里等一周。',
    step2Title: '拿去DMarket等外部网站卖掉',
    step2Text: <>等7天后，用Steam账号直接登录<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>等全球性的饰品交易平台。这是一个拥有数百万用户的相对安全的平台。选中你的饰品卖掉就行了，想秒出的话可以直接丢给自动收购机器人，想多卖点钱就挂玩家间交易。</>,
    step3Title: '提现到手（USD）',
    step3Text: '卖掉后网站里就会有美刀（USD）余额啦。接着用Payoneer等渠道转到你的银行卡里就彻底搞定了！',
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
    step1Title: '在Steam買「硬通貨」',
    step1Text: '因為Steam不能直接提現，所以大家一般先去社群市場買一些全球流通的熱門飾品，比如CS2的皮膚或者TF2的鑰匙。',
    step1Note: '※ 注意：Steam規定剛買的飾品有7天交易冷卻，所以得先放庫裡等一週。',
    step2Title: '拿去DMarket等外部網站賣掉',
    step2Text: <>等7天後，用Steam帳號直接登入<a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>等全球性的飾品交易平台。這是一個擁有數百萬用戶的相對安全的平台。選中你的飾品賣掉就行了，想秒出的話可以直接丟給自動收購機器人，想多賣點錢就掛玩家間交易。</>,
    step3Title: '提現到手（USD）',
    step3Text: '賣掉後網站裡就會有美金（USD）餘額啦。接著用Payoneer等管道轉到你的銀行帳戶裡就徹底搞定了！',
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
    step1Title: 'Steam에서 "잘 팔리는 템" 먼저 사기',
    step1Text: 'Steam 돈을 바로 뺄 수는 없으니, 장터에서 수요가 많은 아이템(CS2 스킨이나 TF2 키 등)을 먼저 삽니다.',
    step1Note: '※ 주의: 템 사고 7일 동안은 거래 제한이 걸리니까 1주일은 묵혀둬야 해요.',
    step2Title: '외부 거래 사이트(DMarket 등)에 올리기',
    step2Text: <>1주일 지나면 <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> 같은 세계적인 스킨 거래 플랫폼에 Steam 계정으로 로그인합니다. 수백만 명의 유저가 사용하는 비교적 안전한 플랫폼입니다. 사이트에서 아이템을 선택하고 팔면 됩니다. 급하면 자동 매입 봇한테 바로 넘기고, 조금 더 비싸게 팔려면 유저 간 거래를 쓰는 게 일반적입니다.</>,
    step3Title: '판매금(USD) 출금하기',
    step3Text: '팔고 나면 사이트에 달러(USD)가 들어옵니다. 이걸 Payoneer 등을 통해 본인의 은행 계좌로 이체하면 환전 끝입니다!',
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
    step1Title: 'Покупаем "ликвид" в Steam',
    step1Text: 'Поскольку напрямую вывести нельзя, мы покупаем ходовые скины CS2 или ключи TF2 на Торговой площадке.',
    step1Note: '※ Учтите: после покупки придется подождать 7 дней из-за трейд-бана Steam.',
    step2Title: 'Продаем на внешних сайтах (например, DMarket)',
    step2Text: <>Через неделю логинимся через Steam на крупной международной платформе вроде <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a>. Это относительно безопасная платформа, которой пользуются миллионы людей. Выбираем предметы и продаем. Можно слить ботам моментально, или продать реальным игрокам чуть дороже.</>,
    step3Title: 'Выводим кэш (USD)',
    step3Text: 'После продажи у вас на балансе будут доллары. Выводим их через сервисы вроде Payoneer на свой банковский счет, и дело в шляпе!',
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
    step1Title: 'Comprar artículos "líquidos" en Steam',
    step1Text: 'Como no puedes retirar los fondos directamente, usas tu saldo de Steam para comprar artículos muy solicitados en el Mercado de la Comunidad. Las skins de CS2 o las llaves de TF2 suelen ser la mejor opción.',
    step1Note: '※ Nota: Steam te hace esperar 7 días antes de poder intercambiar artículos recién comprados, así que tendrás que esperar.',
    step2Title: 'Venderlos en sitios externos (como DMarket)',
    step2Text: <>Después de 7 días, inicia sesión en una plataforma global de comercio de skins como <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando tu cuenta de Steam. Es una plataforma relativamente segura con millones de usuarios. Selecciona tus artículos y véndelos. Puedes venderlos al instante a sus bots si tienes prisa, o usar el comercio entre jugadores para obtener un poco más de dinero.</>,
    step3Title: 'Retirar tu efectivo (USD)',
    step3Text: 'Una vez vendido, obtendrás un saldo en USD en el sitio. Puedes retirar esto fácilmente a tu cuenta bancaria a través de servicios como Payoneer. ¡Fácil!',
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
    step1Title: 'Achetez des articles "liquides" sur Steam',
    step1Text: 'Comme vous ne pouvez pas retirer les fonds directement, vous utilisez votre solde Steam pour acheter des articles très demandés sur le marché de la communauté. Les skins CS2 ou les clés TF2 sont généralement les plus populaires.',
    step1Note: '※ Remarque : Steam vous fait attendre 7 jours avant de pouvoir échanger des articles récemment achetés, vous devrez donc patienter.',
    step2Title: 'Vendez-les sur des sites externes (comme DMarket)',
    step2Text: <>Après 7 jours, connectez-vous à une plateforme mondiale de commerce de skins comme <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> en utilisant votre compte Steam. Il s'agit d'une plateforme relativement sûre comptant des millions d'utilisateurs. Sélectionnez vos articles et vendez-les. Vous pouvez les vendre instantanément à leurs bots si vous êtes pressé, ou utiliser le commerce entre joueurs pour obtenir un peu plus d'argent.</>,
    step3Title: 'Retirez votre argent (USD)',
    step3Text: 'Une fois vendu, vous obtenez un solde en USD sur le site. Vous pouvez facilement le retirer sur votre compte bancaire via des services comme Payoneer. Facile !',
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
    step1Title: '"Liquide" Gegenstände auf Steam kaufen',
    step1Text: 'Da Sie das Geld nicht direkt abheben können, nutzen Sie Ihr Steam-Guthaben, um stark nachgefragte Gegenstände auf dem Community-Markt zu kaufen. CS2-Skins oder TF2-Schlüssel sind in der Regel die beste Wahl.',
    step1Note: '※ Hinweis: Steam zwingt Sie, 7 Tage zu warten, bevor Sie neu gekaufte Gegenstände handeln können. Sie müssen also einfach abwarten.',
    step2Title: 'Verkauf auf externen Seiten (wie DMarket)',
    step2Text: <>Melden Sie sich nach 7 Tagen mit Ihrem Steam-Konto bei einer globalen Skin-Handelsplattform wie <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> an. Es ist eine relativ sichere Plattform mit Millionen von Nutzern. Wählen Sie Ihre Artikel aus und verkaufen Sie sie. Sie können sie sofort an deren Bots verkaufen, wenn Sie es eilig haben, oder den Handel zwischen Spielern nutzen, um etwas mehr Geld zu bekommen.</>,
    step3Title: 'Bargeld abheben (USD)',
    step3Text: 'Sobald es verkauft ist, erhalten Sie ein USD-Guthaben auf der Seite. Sie können dieses problemlos über Dienste wie Payoneer auf Ihr Bankkonto abheben. Einfach!',
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
    step1Title: 'Compre itens "líquidos" no Steam',
    step1Text: 'Como você não pode sacar fundos diretamente, você usa seu saldo do Steam para comprar itens muito procurados no Mercado da Comunidade. Skins de CS2 ou chaves de TF2 geralmente são as melhores opções.',
    step1Note: '※ Nota: O Steam faz você esperar 7 dias antes de poder negociar itens recém-comprados, então você só precisa esperar.',
    step2Title: 'Venda-os em sites externos (como DMarket)',
    step2Text: <>Após 7 dias, faça login em uma plataforma global de negociação de skins como o <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> usando sua conta Steam. É uma plataforma relativamente segura com milhões de usuários. Selecione seus itens e venda-os. Você pode vender instantaneamente para os bots deles se estiver com pressa, ou usar a negociação entre jogadores para conseguir um pouco mais de dinheiro.</>,
    step3Title: 'Saque seu dinheiro (USD)',
    step3Text: 'Depois de vendido, você ganha um saldo em USD no site. Você pode sacar isso facilmente para sua conta bancária por meio de serviços como o Payoneer. Fácil!',
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
    step1Title: 'Steam\'de "Likit" Öğeler Satın Alın',
    step1Text: 'Fonları doğrudan çekemediğiniz için, Steam bakiyenizi Topluluk Pazarında çok talep gören öğeleri satın almak için kullanırsınız. CS2 görünümleri veya TF2 anahtarları genellikle en iyi seçenektir.',
    step1Note: '※ Not: Steam, yeni satın alınan öğeleri takas etmeden önce 7 gün beklemenizi sağlar, bu yüzden beklemeniz gerekir.',
    step2Title: 'Bunları harici sitelerde (DMarket gibi) satın',
    step2Text: <>7 gün sonra, Steam hesabınızı kullanarak <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> gibi küresel bir görünüm ticareti platformuna giriş yapın. Milyonlarca kullanıcısı olan nispeten güvenli bir platformdur. Öğelerinizi seçin ve satın. Aceleniz varsa botlarına anında satabilir veya biraz daha fazla para kazanmak için oyuncular arası ticareti kullanabilirsiniz.</>,
    step3Title: 'Nakit paranızı çekin (USD)',
    step3Text: 'Satıldıktan sonra sitede bir USD bakiyesi elde edersiniz. Bunu Payoneer gibi hizmetler aracılığıyla banka hesabınıza kolayca çekebilirsiniz. Kolay!',
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
    step1Title: 'Mua các mặt hàng "Dễ thanh khoản" trên Steam',
    step1Text: 'Vì bạn không thể rút tiền trực tiếp nên bạn sử dụng số dư Steam của mình để mua các mặt hàng có nhu cầu cao trên Chợ cộng đồng. Giao diện CS2 hoặc chìa khóa TF2 thường là lựa chọn tối ưu.',
    step1Note: '※ Lưu ý: Steam bắt bạn đợi 7 ngày trước khi có thể giao dịch các mặt hàng mới mua, vì vậy bạn chỉ cần chờ đợi.',
    step2Title: 'Bán chúng trên các trang web bên ngoài (như DMarket)',
    step2Text: <>Sau 7 ngày, hãy đăng nhập vào nền tảng giao dịch skin toàn cầu như <a href="https://dmarket.com?ref=yrnXt5qgIo" target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>DMarket</a> bằng tài khoản Steam của bạn. Đây là một nền tảng tương đối an toàn với hàng triệu người dùng. Chọn mặt hàng của bạn và bán chúng. Bạn có thể bán ngay cho bot của họ nếu đang vội hoặc sử dụng giao dịch giữa những người chơi để kiếm thêm một chút tiền.</>,
    step3Title: 'Rút tiền mặt của bạn (USD)',
    step3Text: 'Sau khi bán, bạn sẽ nhận được số dư USD trên trang web. Bạn có thể dễ dàng rút số tiền này về tài khoản ngân hàng của mình thông qua các dịch vụ như Payoneer. Quá dễ!',
    videoTitle: '📺 Hướng dẫn bằng video (Tham khảo)',
    warningTitle: '⚠️ Lưu ý quan trọng về Điều khoản Steam',
    warningText: 'Mặc dù hoàn toàn hợp pháp, nhưng việc rút tiền mặt qua các trang web bên thứ ba về mặt kỹ thuật là một vùng xám không được Điều khoản Dịch vụ của Steam chính thức hỗ trợ. Tuy nhiên, các trang web lớn như DMarket đã hoạt động trong nhiều năm dưới sự chấp thuận ngầm của Valve. Hãy nhớ rằng đây là một "mẹo" không chính thức của cộng đồng!',
    footerTitle: '📝 Liên kết tham khảo',
    footerText: 'Đây là một ví dụ về các nền tảng bên ngoài. Bạn có thể kiểm tra giá trên trang web bên dưới.',
    btn: 'DMarket (Trang web bên ngoài)'
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
