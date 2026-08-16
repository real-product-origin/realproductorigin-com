#!/usr/bin/env python3
"""Generate coverage.html (request a retailer) for every supported locale.

Same approach as build-goodbye.py: the site has no template engine, so
rather than hand-write seven pages and let their nav/footer drift, we
clone the header and footer from that locale's existing products.html —
already translated, kept verbatim — and splice our own head and body
between them. Only the page's own copy lives in this file.

Run from the repo root:  python3 build-coverage.py

Why this page is translated at all: it was shipped English-only on
2026-08-03, while the localized pricing and product pages still sent
their "ask us for a store" links to the English contact form. A visitor
reading the site in Japanese asking for a Japanese retailer is exactly
the request we most want, and they were the ones getting an English
page. Repointing those links was a one-time edit, not part of this
script; the footer entry on this page is added here so a regenerated
page never loses it.

Note the form itself posts to the same endpoint in every language and
the API's own strings are never shown: every message the visitor can
see is rendered from M below, keyed off the machine-readable `status`.
The one exception is `supported_as`, a retailer's own name, which is
not translated in any language.
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
API = "https://api.realproductorigin.com"

# locale dir -> html lang attr. "" is the root (English).
LOCALES = {
    "": "en",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ja": "ja",
    "zh-Hans": "zh-Hans",
    "zh-Hant": "zh-Hant",
}

T = {
    "en": {
        "title": "Request a retailer",
        "meta": "Tell us which store you shop at and we'll add it to the list. Requesting is free, takes one field, and needs no account.",
        "og_desc": "Tell us which store you shop at. Free, no account, one field.",
        "schema_desc": "Ask us to support a store. Free, no account required.",
        "h1": "Request a retailer",
        "lede": "Tell us where you shop and we'll add it to the list. It's free, it takes one field, and you don't need an account. We use these requests to decide which store to build next.",
        "q_label": "Which store?",
        "q_hint": "— a web address is easiest, like <code>ikea.com</code>",
        "optional_head": "Optional — all of this helps, none of it is required.",
        "name_label": "What do you call it?",
        "note_label": "What would you use it for?",
        "note_ph": "Most of my furniture comes from there and I have no idea where any of it is made.",
        "email_label": "Email",
        "email_hint": "— only ever used to tell you when this store goes live. Not a mailing list.",
        "submit": "Add to the list",
        "sending": "Sending…",
        "promise_h2": "What a request does, and what it doesn't",
        "p1": "A request is a vote on what we build next. It is not a purchase, and there is nothing to pay — asking is free and always will be.",
        "p2": "Adding a store is more work than it sounds. Each one needs an adapter that finds the product, the brand, the seller, and where it ships from; testing across the different page layouts that store uses; a permanent entry in our regression suite; and then ongoing maintenance every time that retailer redesigns. That last part never ends — it's why we're careful about which ones we take on, and why knowing what people actually want matters.",
        "pull": "Requests tell us where to look. They never affect what we find.",
        "p3": "However a store gets onto our list, the scores it produces are the same scores our methodology would have produced anyway. Nobody can request a result, and no one who asks for a store gets any say in how its products are scored. If we ever add a way to fund coverage, that rule doesn't change — and we'll publish the details before we accept anything.",
        "supported_h2": "Already supported",
        "supported_sub": "No need to request these — the Checker works on them today.",
        "loading": "Loading…",
        "footer_link": "Request a retailer",
        "m": {
            "no_url": "Enter a store's web address first.",
            "rate": "That's a lot of requests at once — give it a minute and try again.",
            "list_fail": "Couldn't load the list just now — see <a href=\"{retailers}\">supported sites</a>.",
            "supported": "<strong>Good news — we already cover {name}.</strong><br>Install the Checker and it'll work there right away. <a href=\"{install}\">Get the extension</a>.",
            "already": "You've already asked for this one — it's on the list.",
            "recorded": "<strong>Thanks — that's on the list.</strong>",
            "count": "{n} people have asked for {domain} so far.",
            "bad_url": "That doesn't look like a store's web address. Try something like ikea.com.",
            "network": "Couldn't reach us just now. Try again, or email <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>.",
        },
    },
    "es": {
        "title": "Solicitar una tienda",
        "meta": "Díganos en qué tienda compra y la añadiremos a la lista. Solicitarlo es gratis, ocupa un campo y no requiere cuenta.",
        "og_desc": "Díganos en qué tienda compra. Gratis, sin cuenta, un solo campo.",
        "schema_desc": "Pídanos que admitamos una tienda. Gratis, sin necesidad de cuenta.",
        "h1": "Solicitar una tienda",
        "lede": "Díganos dónde compra y la añadiremos a la lista. Es gratis, ocupa un solo campo y no necesita una cuenta. Usamos estas solicitudes para decidir qué tienda construir a continuación.",
        "q_label": "¿Qué tienda?",
        "q_hint": "— una dirección web es lo más fácil, como <code>ikea.com</code>",
        "optional_head": "Opcional: todo esto ayuda, nada es obligatorio.",
        "name_label": "¿Cómo la llama?",
        "note_label": "¿Para qué la usaría?",
        "note_ph": "Casi todos mis muebles vienen de ahí y no tengo ni idea de dónde están fabricados.",
        "email_label": "Correo electrónico",
        "email_hint": "— solo se usa para avisarle cuando esta tienda esté disponible. No es una lista de correo.",
        "submit": "Añadir a la lista",
        "sending": "Enviando…",
        "promise_h2": "Lo que hace una solicitud, y lo que no",
        "p1": "Una solicitud es un voto sobre lo que construimos a continuación. No es una compra y no hay nada que pagar: pedirlo es gratis y siempre lo será.",
        "p2": "Añadir una tienda es más trabajo de lo que parece. Cada una necesita un adaptador que encuentre el producto, la marca, el vendedor y desde dónde se envía; pruebas en los distintos diseños de página que usa esa tienda; una entrada permanente en nuestro conjunto de pruebas de regresión; y después mantenimiento continuo cada vez que ese minorista rediseña su sitio. Esa última parte no termina nunca: por eso tenemos cuidado con cuáles aceptamos, y por eso importa saber qué quiere la gente.",
        "pull": "Las solicitudes nos dicen dónde mirar. Nunca afectan a lo que encontramos.",
        "p3": "Sea como sea que una tienda llegue a nuestra lista, las puntuaciones que produce son las mismas que nuestra metodología habría producido de todos modos. Nadie puede solicitar un resultado, y quien pide una tienda no tiene ninguna influencia sobre cómo se puntúan sus productos. Si algún día añadimos una forma de financiar la cobertura, esa regla no cambia, y publicaremos los detalles antes de aceptar nada.",
        "supported_h2": "Ya admitidas",
        "supported_sub": "No hace falta solicitar estas: el Checker ya funciona en ellas.",
        "loading": "Cargando…",
        "footer_link": "Solicitar una tienda",
        "m": {
            "no_url": "Escriba primero la dirección web de una tienda.",
            "rate": "Son muchas solicitudes a la vez. Espere un minuto y vuelva a intentarlo.",
            "list_fail": "No se pudo cargar la lista ahora mismo. Consulte los <a href=\"{retailers}\">sitios admitidos</a>.",
            "supported": "<strong>Buenas noticias: ya admitimos {name}.</strong><br>Instale el Checker y funcionará ahí de inmediato. <a href=\"{install}\">Obtener la extensión</a>.",
            "already": "Ya ha pedido esta: está en la lista.",
            "recorded": "<strong>Gracias, está en la lista.</strong>",
            "count": "{n} personas han pedido {domain} hasta ahora.",
            "bad_url": "Eso no parece la dirección web de una tienda. Pruebe con algo como ikea.com.",
            "network": "No hemos podido conectar ahora mismo. Inténtelo de nuevo o escriba a <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>.",
        },
    },
    "fr": {
        "title": "Demander un détaillant",
        "meta": "Dites-nous où vous faites vos achats et nous ajouterons ce site à la liste. La demande est gratuite, tient en un champ et ne nécessite aucun compte.",
        "og_desc": "Dites-nous où vous faites vos achats. Gratuit, sans compte, un seul champ.",
        "schema_desc": "Demandez-nous de prendre en charge un magasin. Gratuit, sans compte.",
        "h1": "Demander un détaillant",
        "lede": "Dites-nous où vous faites vos achats et nous ajouterons ce site à la liste. C'est gratuit, cela tient en un champ et vous n'avez pas besoin de compte. Ces demandes nous servent à décider quel magasin développer ensuite.",
        "q_label": "Quel magasin ?",
        "q_hint": "— une adresse web est le plus simple, par exemple <code>ikea.com</code>",
        "optional_head": "Facultatif — tout cela nous aide, rien n'est obligatoire.",
        "name_label": "Comment l'appelez-vous ?",
        "note_label": "À quoi cela vous servirait-il ?",
        "note_ph": "La plupart de mes meubles viennent de là et je n'ai aucune idée de leur lieu de fabrication.",
        "email_label": "E-mail",
        "email_hint": "— utilisé uniquement pour vous prévenir quand ce magasin est pris en charge. Ce n'est pas une liste de diffusion.",
        "submit": "Ajouter à la liste",
        "sending": "Envoi…",
        "promise_h2": "Ce qu'une demande fait, et ce qu'elle ne fait pas",
        "p1": "Une demande est un vote sur ce que nous développons ensuite. Ce n'est pas un achat et il n'y a rien à payer : demander est gratuit et le restera.",
        "p2": "Ajouter un magasin représente plus de travail qu'il n'y paraît. Chacun exige un adaptateur capable de trouver le produit, la marque, le vendeur et le lieu d'expédition ; des tests sur les différentes mises en page utilisées par ce magasin ; une entrée permanente dans notre suite de tests de régression ; puis une maintenance continue à chaque refonte du site. Cette dernière partie ne s'arrête jamais — c'est pourquoi nous choisissons avec soin ceux que nous prenons en charge, et pourquoi savoir ce que les gens veulent compte vraiment.",
        "pull": "Les demandes nous disent où chercher. Elles n'influencent jamais ce que nous trouvons.",
        "p3": "Quelle que soit la façon dont un magasin arrive sur notre liste, les scores qu'il produit sont ceux que notre méthodologie aurait produits de toute façon. Personne ne peut demander un résultat, et personne qui réclame un magasin n'a son mot à dire sur la notation de ses produits. Si nous ajoutons un jour un moyen de financer la prise en charge, cette règle ne changera pas — et nous en publierons les détails avant d'accepter quoi que ce soit.",
        "supported_h2": "Déjà pris en charge",
        "supported_sub": "Inutile de les demander — le Checker fonctionne déjà dessus.",
        "loading": "Chargement…",
        "footer_link": "Demander un détaillant",
        "m": {
            "no_url": "Saisissez d'abord l'adresse web d'un magasin.",
            "rate": "Cela fait beaucoup de demandes d'un coup — patientez une minute et réessayez.",
            "list_fail": "Impossible de charger la liste pour le moment — voir les <a href=\"{retailers}\">sites pris en charge</a>.",
            "supported": "<strong>Bonne nouvelle : nous couvrons déjà {name}.</strong><br>Installez le Checker et il fonctionnera aussitôt sur ce site. <a href=\"{install}\">Obtenir l'extension</a>.",
            "already": "Vous avez déjà demandé celui-ci : il est sur la liste.",
            "recorded": "<strong>Merci — c'est sur la liste.</strong>",
            "count": "{n} personnes ont demandé {domain} jusqu'ici.",
            "bad_url": "Cela ne ressemble pas à l'adresse web d'un magasin. Essayez quelque chose comme ikea.com.",
            "network": "Impossible de nous joindre pour le moment. Réessayez ou écrivez à <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>.",
        },
    },
    "de": {
        "title": "Händler vorschlagen",
        "meta": "Sagen Sie uns, wo Sie einkaufen, und wir nehmen den Shop in die Liste auf. Der Vorschlag ist kostenlos, braucht ein Feld und kein Konto.",
        "og_desc": "Sagen Sie uns, wo Sie einkaufen. Kostenlos, ohne Konto, ein Feld.",
        "schema_desc": "Bitten Sie uns, einen Shop zu unterstützen. Kostenlos, kein Konto nötig.",
        "h1": "Händler vorschlagen",
        "lede": "Sagen Sie uns, wo Sie einkaufen, und wir nehmen den Shop in die Liste auf. Das ist kostenlos, braucht ein einziges Feld und kein Konto. Anhand dieser Vorschläge entscheiden wir, welchen Shop wir als nächstes umsetzen.",
        "q_label": "Welcher Shop?",
        "q_hint": "— eine Webadresse ist am einfachsten, etwa <code>ikea.com</code>",
        "optional_head": "Optional — all das hilft, nichts davon ist Pflicht.",
        "name_label": "Wie nennen Sie ihn?",
        "note_label": "Wofür würden Sie ihn nutzen?",
        "note_ph": "Die meisten meiner Möbel kommen von dort und ich weiß bei keinem, wo es hergestellt wurde.",
        "email_label": "E-Mail",
        "email_hint": "— wird ausschließlich verwendet, um Sie zu benachrichtigen, sobald dieser Shop unterstützt wird. Kein Newsletter.",
        "submit": "Zur Liste hinzufügen",
        "sending": "Wird gesendet…",
        "promise_h2": "Was ein Vorschlag bewirkt — und was nicht",
        "p1": "Ein Vorschlag ist eine Stimme dafür, was wir als nächstes bauen. Es ist kein Kauf, und es gibt nichts zu bezahlen: Fragen ist kostenlos und bleibt es.",
        "p2": "Einen Shop aufzunehmen ist mehr Arbeit, als es klingt. Jeder braucht einen Adapter, der Produkt, Marke, Verkäufer und Versandort findet; Tests über die verschiedenen Seitenlayouts dieses Shops hinweg; einen dauerhaften Eintrag in unserer Regressionssuite; und danach laufende Pflege bei jedem Redesign des Händlers. Dieser letzte Teil hört nie auf — deshalb überlegen wir genau, welche wir übernehmen, und deshalb ist es wichtig zu wissen, was die Leute tatsächlich wollen.",
        "pull": "Vorschläge sagen uns, wo wir hinsehen sollen. Sie beeinflussen nie, was wir finden.",
        "p3": "Wie ein Shop auch auf unsere Liste kommt: Die Bewertungen, die er liefert, sind dieselben, die unsere Methodik ohnehin ergeben hätte. Niemand kann ein Ergebnis bestellen, und wer einen Shop vorschlägt, hat kein Mitspracherecht darüber, wie dessen Produkte bewertet werden. Sollten wir jemals eine Möglichkeit einführen, Abdeckung zu finanzieren, ändert das an dieser Regel nichts — und wir veröffentlichen die Einzelheiten, bevor wir irgendetwas annehmen.",
        "supported_h2": "Bereits unterstützt",
        "supported_sub": "Diese müssen Sie nicht vorschlagen — der Checker funktioniert dort schon heute.",
        "loading": "Wird geladen…",
        "footer_link": "Händler vorschlagen",
        "m": {
            "no_url": "Geben Sie zuerst die Webadresse eines Shops ein.",
            "rate": "Das sind viele Anfragen auf einmal — warten Sie eine Minute und versuchen Sie es erneut.",
            "list_fail": "Die Liste ließ sich gerade nicht laden — siehe <a href=\"{retailers}\">unterstützte Websites</a>.",
            "supported": "<strong>Gute Nachricht: {name} unterstützen wir bereits.</strong><br>Installieren Sie den Checker, dann funktioniert er dort sofort. <a href=\"{install}\">Erweiterung holen</a>.",
            "already": "Den haben Sie schon vorgeschlagen — er steht auf der Liste.",
            "recorded": "<strong>Danke — das steht auf der Liste.</strong>",
            "count": "{n} Personen haben {domain} bisher vorgeschlagen.",
            "bad_url": "Das sieht nicht nach der Webadresse eines Shops aus. Versuchen Sie es mit etwas wie ikea.com.",
            "network": "Wir waren gerade nicht erreichbar. Versuchen Sie es erneut oder schreiben Sie an <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>.",
        },
    },
    "ja": {
        "title": "リテーラーをリクエスト",
        "meta": "よく使うお店を教えてください。リストに追加します。リクエストは無料、入力は1項目、アカウントも不要です。",
        "og_desc": "よく使うお店を教えてください。無料、アカウント不要、入力は1項目。",
        "schema_desc": "対応してほしいお店をお知らせください。無料、アカウント不要。",
        "h1": "リテーラーをリクエスト",
        "lede": "よく使うお店を教えてください。リストに追加します。無料で、入力は1項目、アカウントも必要ありません。いただいたリクエストをもとに、次にどのお店へ対応するかを決めています。",
        "q_label": "どのお店ですか",
        "q_hint": "— ウェブアドレスが一番簡単です。例: <code>ikea.com</code>",
        "optional_head": "任意 — どれも参考になりますが、必須ではありません。",
        "name_label": "お店の呼び方は",
        "note_label": "どんなときに使いますか",
        "note_ph": "家具のほとんどをそこで買っていますが、どこで作られたのか全く分かりません。",
        "email_label": "メールアドレス",
        "email_hint": "— このお店に対応したときのお知らせにのみ使用します。メールマガジンではありません。",
        "submit": "リストに追加",
        "sending": "送信中…",
        "promise_h2": "リクエストでできること、できないこと",
        "p1": "リクエストは、次に何を作るかへの一票です。購入ではなく、お支払いいただくものもありません。リクエストは無料で、これからも無料です。",
        "p2": "お店を1つ追加する作業は、見た目より大きなものです。商品・ブランド・販売者・発送元を読み取るアダプターの開発、そのお店が使う複数のページレイアウトでの検証、回帰テストへの恒久的な追加、そしてそのリテーラーがサイトを刷新するたびの継続的な保守が必要です。最後の保守は終わることがありません。だからこそ、どのお店を引き受けるかは慎重に判断しますし、実際に何が求められているかを知ることが重要になります。",
        "pull": "リクエストは、どこを見るかを教えてくれます。何を見つけるかを左右することはありません。",
        "p3": "どのような経緯でお店がリストに加わっても、そこで算出されるスコアは、私たちの方法論が本来出したはずのスコアと同じです。結果をリクエストすることは誰にもできませんし、お店をリクエストした方がその商品の採点に関与することもありません。将来、対応を資金面で支援できる仕組みを設けたとしても、このルールは変わりません。受け付ける前に詳細を公表します。",
        "supported_h2": "対応済み",
        "supported_sub": "これらはリクエスト不要です。Checker は現在すでに動作します。",
        "loading": "読み込み中…",
        "footer_link": "リテーラーをリクエスト",
        "m": {
            "no_url": "まずお店のウェブアドレスを入力してください。",
            "rate": "短時間にリクエストが多すぎます。1分ほど待ってからもう一度お試しください。",
            "list_fail": "リストを読み込めませんでした。<a href=\"{retailers}\">対応サイト</a>をご覧ください。",
            "supported": "<strong>{name} はすでに対応しています。</strong><br>Checker をインストールすれば、すぐにそのサイトで動作します。<a href=\"{install}\">拡張機能を入手</a>。",
            "already": "こちらはすでにリクエスト済みです。リストに入っています。",
            "recorded": "<strong>ありがとうございます。リストに追加しました。</strong>",
            "count": "これまでに {n} 人が {domain} をリクエストしています。",
            "bad_url": "お店のウェブアドレスではないようです。ikea.com のような形式でお試しください。",
            "network": "現在接続できませんでした。もう一度お試しいただくか、<a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a> までご連絡ください。",
        },
    },
    "zh-Hans": {
        "title": "申请新增零售商",
        "meta": "告诉我们您常去哪家店，我们会把它加入清单。申请免费，只需填一项，也不需要账户。",
        "og_desc": "告诉我们您常去哪家店。免费、无需账户、只填一项。",
        "schema_desc": "请我们支持某家商店。免费，无需账户。",
        "h1": "申请新增零售商",
        "lede": "告诉我们您在哪里购物，我们会把它加入清单。免费，只需填一项，也不需要账户。我们依据这些申请来决定下一个要支持哪家商店。",
        "q_label": "哪家商店",
        "q_hint": "— 填网址最方便，例如 <code>ikea.com</code>",
        "optional_head": "选填 —— 这些信息都有帮助，但都不是必填。",
        "name_label": "您怎么称呼它",
        "note_label": "您会用它来做什么",
        "note_ph": "我家里的家具大多来自那里，但完全不知道是在哪里生产的。",
        "email_label": "电子邮箱",
        "email_hint": "— 仅在这家商店上线时用于通知您。不是邮件订阅列表。",
        "submit": "加入清单",
        "sending": "发送中…",
        "promise_h2": "一次申请能做什么，不能做什么",
        "p1": "申请是对我们下一步做什么投下的一票。它不是购买，也不需要支付任何费用：申请是免费的，而且一直都会是。",
        "p2": "新增一家商店的工作量比听起来更大。每一家都需要一个适配器，用来找出商品、品牌、卖家以及发货地；需要在这家商店使用的不同页面版式上做测试；需要在回归测试套件中长期保留一个条目；此后每当这家零售商改版，还要持续维护。最后这部分永远不会结束——这也是我们对接受哪些商店保持谨慎的原因，以及了解大家真正想要什么之所以重要的原因。",
        "pull": "申请告诉我们该看哪里。它从不影响我们看到什么。",
        "p3": "无论一家商店以何种方式进入我们的清单，它产生的评分都与我们的方法论本来会得出的评分一致。没有人可以申请某个结果，提出申请的人对其商品如何评分也没有任何话语权。即使我们将来提供资助覆盖范围的方式，这条规则也不会改变——并且我们会在接受任何款项之前公布细节。",
        "supported_h2": "已支持",
        "supported_sub": "这些无需申请 —— Checker 今天就能在上面使用。",
        "loading": "加载中…",
        "footer_link": "申请新增零售商",
        "m": {
            "no_url": "请先填写商店的网址。",
            "rate": "短时间内提交次数过多，请稍等一分钟再试。",
            "list_fail": "暂时无法加载清单，请查看<a href=\"{retailers}\">支持的网站</a>。",
            "supported": "<strong>好消息：我们已经支持 {name}。</strong><br>安装 Checker 后即可在该网站使用。<a href=\"{install}\">获取扩展程序</a>。",
            "already": "这一家您已经申请过了，它在清单上。",
            "recorded": "<strong>谢谢，已加入清单。</strong>",
            "count": "目前已有 {n} 人申请 {domain}。",
            "bad_url": "这看起来不像商店的网址。请尝试类似 ikea.com 的格式。",
            "network": "暂时无法连接。请重试，或发送邮件至 <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>。",
        },
    },
    "zh-Hant": {
        "title": "申請新增零售商",
        "meta": "告訴我們您常去哪家店，我們會把它加入清單。申請免費，只需填一項，也不需要帳戶。",
        "og_desc": "告訴我們您常去哪家店。免費、無需帳戶、只填一項。",
        "schema_desc": "請我們支援某家商店。免費，無需帳戶。",
        "h1": "申請新增零售商",
        "lede": "告訴我們您在哪裡購物，我們會把它加入清單。免費，只需填一項，也不需要帳戶。我們依據這些申請來決定下一個要支援哪家商店。",
        "q_label": "哪家商店",
        "q_hint": "— 填網址最方便，例如 <code>ikea.com</code>",
        "optional_head": "選填 —— 這些資訊都有幫助，但都不是必填。",
        "name_label": "您怎麼稱呼它",
        "note_label": "您會用它來做什麼",
        "note_ph": "我家裡的家具大多來自那裡，但完全不知道是在哪裡生產的。",
        "email_label": "電子郵件",
        "email_hint": "— 僅在這家商店上線時用於通知您。不是郵件訂閱清單。",
        "submit": "加入清單",
        "sending": "傳送中…",
        "promise_h2": "一次申請能做什麼，不能做什麼",
        "p1": "申請是對我們下一步做什麼投下的一票。它不是購買，也不需要支付任何費用：申請是免費的，而且一直都會是。",
        "p2": "新增一家商店的工作量比聽起來更大。每一家都需要一個轉接程式，用來找出商品、品牌、賣家以及出貨地；需要在這家商店使用的不同頁面版型上測試；需要在回歸測試套件中長期保留一個條目；此後每當這家零售商改版，還要持續維護。最後這部分永遠不會結束——這也是我們對接受哪些商店保持謹慎的原因，以及了解大家真正想要什麼之所以重要的原因。",
        "pull": "申請告訴我們該看哪裡。它從不影響我們看到什麼。",
        "p3": "無論一家商店以何種方式進入我們的清單，它產生的評分都與我們的方法論本來會得出的評分一致。沒有人可以申請某個結果，提出申請的人對其商品如何評分也沒有任何發言權。即使我們將來提供資助支援範圍的方式，這條規則也不會改變——並且我們會在接受任何款項之前公布細節。",
        "supported_h2": "已支援",
        "supported_sub": "這些無需申請 —— Checker 今天就能在上面使用。",
        "loading": "載入中…",
        "footer_link": "申請新增零售商",
        "m": {
            "no_url": "請先填寫商店的網址。",
            "rate": "短時間內送出次數過多，請稍等一分鐘再試。",
            "list_fail": "暫時無法載入清單，請查看<a href=\"{retailers}\">支援的網站</a>。",
            "supported": "<strong>好消息：我們已經支援 {name}。</strong><br>安裝 Checker 後即可在該網站使用。<a href=\"{install}\">取得擴充功能</a>。",
            "already": "這一家您已經申請過了，它在清單上。",
            "recorded": "<strong>謝謝，已加入清單。</strong>",
            "count": "目前已有 {n} 人申請 {domain}。",
            "bad_url": "這看起來不像商店的網址。請嘗試類似 ikea.com 的格式。",
            "network": "暫時無法連線。請重試，或寄信至 <a href=\"mailto:support@realproductorigin.com\">support@realproductorigin.com</a>。",
        },
    },
}

# Page-specific CSS. Identical in every locale — it contains no copy.
STYLE = """<style>
  /* This page predates the shared .wrap container and so never had a
     horizontal gutter: at every width its copy sat flush against the
     viewport edge, which on a phone means text touching the glass. 24px
     is what .wrap uses. Not .wrap itself, because the supported-retailer
     grid below is wider than .wrap's 760px. */
  main { padding-left: 24px; padding-right: 24px; }

  .cov-hero { max-width: 720px; }
  .cov-hero h1 { margin-bottom: 10px; }
  .cov-lede { font-size: 18px; line-height: 1.6; color: var(--muted, #57534e); }

  .cov-form-card {
    background: #fff; border: 1px solid #e7e5e4; border-radius: 14px;
    padding: 26px 26px 22px; max-width: 640px; margin: 28px 0 10px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .cov-field { margin-bottom: 16px; }
  .cov-field label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .cov-field .hint { font-weight: 400; color: #78716c; font-size: 13px; }
  .cov-field input[type="text"],
  .cov-field input[type="email"],
  .cov-field textarea {
    width: 100%; padding: 11px 13px; border: 1px solid #d6d3d1; border-radius: 9px;
    font: inherit; font-size: 15px; background: #fafaf9; box-sizing: border-box;
  }
  .cov-field input:focus, .cov-field textarea:focus {
    outline: none; border-color: #0284c7; background: #fff;
    box-shadow: 0 0 0 3px rgba(2,132,199,0.12);
  }
  .cov-field textarea { min-height: 72px; resize: vertical; }
  .cov-optional {
    border-top: 1px solid #f0efed; margin-top: 20px; padding-top: 18px;
  }
  .cov-optional-head { font-size: 13px; color: #78716c; margin: 0 0 14px; }
  .cov-submit {
    background: #0284c7; color: #fff; border: none; border-radius: 9px;
    padding: 12px 22px; font: inherit; font-weight: 600; font-size: 15px; cursor: pointer;
  }
  .cov-submit:hover { background: #0369a1; }
  .cov-submit:disabled { opacity: 0.6; cursor: default; }

  .cov-result { margin-top: 16px; padding: 13px 16px; border-radius: 10px; font-size: 14.5px; line-height: 1.55; display: none; }
  .cov-result.show { display: block; }
  .cov-result.ok { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
  .cov-result.info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; }
  .cov-result.err { background: #fef2f2; border: 1px solid #fecaca; color: #7f1d1d; }

  .cov-promise { max-width: 720px; margin: 44px 0 0; }
  .cov-promise h2 { font-size: 22px; margin-bottom: 12px; }
  .cov-promise p { line-height: 1.65; margin-bottom: 14px; }
  .cov-pull {
    border-left: 3px solid #ea580c; padding: 4px 0 4px 18px; margin: 20px 0;
    font-size: 17px; line-height: 1.6; font-weight: 500;
  }

  .cov-supported { max-width: 900px; margin: 48px 0 0; }
  .cov-supported h2 { font-size: 22px; margin-bottom: 6px; }
  .cov-supported .sub { color: #78716c; font-size: 14.5px; margin-bottom: 18px; }
  .cov-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .cov-chip {
    background: #fff; border: 1px solid #e7e5e4; border-radius: 999px;
    padding: 6px 14px; font-size: 14px;
  }
  .cov-loading { color: #a8a29e; font-size: 14px; }
</style>"""


def canonical(sub: str) -> str:
    """Extensionless, matching the English page as shipped and the sitemap.

    Cloudflare Pages serves /coverage and /coverage.html as the same
    document, so the canonical picks one and the sitemap agrees with it.
    In-page hrefs keep the .html suffix, which is the site's convention.
    """
    return f"https://realproductorigin.com/{sub + '/' if sub else ''}coverage"


def head_html(sub: str, lang: str, t: dict) -> str:
    alts = "\n".join(
        f'<link rel="alternate" hreflang="{L}" href="{canonical(s)}">'
        for s, L in LOCALES.items()
    )
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://realproductorigin.com/#organization",
                "name": "Real Product Origin",
                "url": "https://realproductorigin.com/",
                "logo": "https://realproductorigin.com/assets/favicon-512.png",
            },
            {
                "@type": "WebPage",
                "@id": canonical(sub),
                "url": canonical(sub),
                "name": f"{t['title']} — Real Product Origin",
                "description": t["schema_desc"],
                "inLanguage": lang,
                "isPartOf": {"@id": "https://realproductorigin.com/#organization"},
            },
        ],
    }
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t['title']} — Real Product Origin</title>
<meta name="description" content="{t['meta']}">
<meta property="og:title" content="{t['title']} — Real Product Origin">
<meta property="og:description" content="{t['og_desc']}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical(sub)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{t['title']} — Real Product Origin">
<meta name="twitter:description" content="{t['og_desc']}">
<link rel="canonical" href="{canonical(sub)}">
{alts}
<link rel="alternate" hreflang="x-default" href="{canonical('')}">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="apple-touch-icon" sizes="192x192" href="/assets/favicon-192.png">
<link rel="stylesheet" href="/assets/styles.css">
<script type="application/ld+json">
{json.dumps(schema, indent=2, ensure_ascii=False)}
</script>
{STYLE}
</head>
<body>
"""


def body_html(t: dict) -> str:
    return f"""
<main>
  <section class="cov-hero">
    <h1>{t['h1']}</h1>
    <p class="cov-lede">{t['lede']}</p>
  </section>

  <form class="cov-form-card" id="cov-form" novalidate>
    <div class="cov-field">
      <label for="cov-url">{t['q_label']}
        <span class="hint">{t['q_hint']}</span>
      </label>
      <input type="text" id="cov-url" name="retailer_url" required
             autocomplete="off" spellcheck="false"
             placeholder="ikea.com">
    </div>

    <div class="cov-optional">
      <p class="cov-optional-head">{t['optional_head']}</p>

      <div class="cov-field">
        <label for="cov-name">{t['name_label']}</label>
        <input type="text" id="cov-name" name="retailer_name" autocomplete="off" placeholder="IKEA">
      </div>

      <div class="cov-field">
        <label for="cov-note">{t['note_label']}</label>
        <textarea id="cov-note" name="note" maxlength="1000"
                  placeholder="{t['note_ph']}"></textarea>
      </div>

      <div class="cov-field">
        <label for="cov-email">{t['email_label']}
          <span class="hint">{t['email_hint']}</span>
        </label>
        <input type="email" id="cov-email" name="contact_email" autocomplete="email" placeholder="you@example.com">
      </div>
    </div>

    <button type="submit" class="cov-submit" id="cov-submit">{t['submit']}</button>
    <div class="cov-result" id="cov-result" role="status" aria-live="polite"></div>
  </form>

  <section class="cov-promise">
    <h2>{t['promise_h2']}</h2>
    <p>{t['p1']}</p>
    <p>{t['p2']}</p>
    <div class="cov-pull">{t['pull']}</div>
    <p>{t['p3']}</p>
  </section>

  <section class="cov-supported">
    <h2>{t['supported_h2']}</h2>
    <p class="sub">{t['supported_sub']}</p>
    <div class="cov-chips" id="cov-supported-list">
      <span class="cov-loading">{t['loading']}</span>
    </div>
  </section>
</main>
"""


def script_html(sub: str, t: dict) -> str:
    prefix = f"/{sub}" if sub else ""
    msgs = dict(t["m"])
    # Resolve the two in-message links to this locale so a French visitor
    # who mistypes a domain isn't sent to the English pricing page.
    msgs["list_fail"] = msgs["list_fail"].replace(
        "{retailers}", f"{prefix}/pricing.html#retailers")
    msgs["supported"] = msgs["supported"].replace("{install}", f"{prefix}/#install")
    m = json.dumps(msgs, indent=2, ensure_ascii=False)
    sending = json.dumps(t["sending"], ensure_ascii=False)
    submit = json.dumps(t["submit"], ensure_ascii=False)

    return f"""
<script>
document.getElementById("year").textContent = new Date().getFullYear();
(function () {{
  try {{
    if (localStorage.getItem("rpo_session_token")) {{
      const a = document.getElementById("nav-account-link");
      if (a) {{ a.textContent = "My Account"; a.href = "/subscribe/account.html"; }}
    }}
  }} catch (_) {{}}
}})();

// Every string the visitor can see is here, in this page's language. The
// API returns a machine-readable `status` and never user-facing prose —
// which is what makes one endpoint serve seven locales.
const M = {m};

// Points at a local backend when the page is served from localhost, so this
// form can be exercised end-to-end before deploying. `?api=http://…`
// overrides the port, because local backends don't always land on 8000.
// Both branches are unreachable on the real site — production always talks
// to production.
const RPO_API = (function () {{
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!isLocal) return "{API}";
  const override = new URLSearchParams(location.search).get("api");
  return (override && /^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/.test(override))
    ? override
    : "http://localhost:8000";
}})();

// ── Supported list ────────────────────────────────────────────────────
// Rendered from the API rather than hardcoded here. A hardcoded list on
// this page would drift from what the backend actually routes, and this
// is the one page where "we already support that" has to be true.
(async function loadSupported() {{
  const host = document.getElementById("cov-supported-list");
  try {{
    const r = await fetch(RPO_API + "/coverage/supported", {{ cache: "no-cache" }});
    if (!r.ok) throw new Error("http " + r.status);
    const data = await r.json();
    if (!data.retailers || !data.retailers.length) throw new Error("empty");
    host.innerHTML = "";
    for (const item of data.retailers) {{
      const chip = document.createElement("span");
      chip.className = "cov-chip";
      chip.textContent = item.display_name;
      host.appendChild(chip);
    }}
  }} catch (_) {{
    // Never leave a spinner behind. Point at the page that lists them.
    host.innerHTML = '<span class="cov-loading">' + M.list_fail + '</span>';
  }}
}})();

// ── Submit ────────────────────────────────────────────────────────────
const form = document.getElementById("cov-form");
const resultEl = document.getElementById("cov-result");
const submitEl = document.getElementById("cov-submit");

function showResult(kind, html) {{
  resultEl.className = "cov-result show " + kind;
  resultEl.innerHTML = html;
}}

form.addEventListener("submit", async function (e) {{
  e.preventDefault();
  const url = document.getElementById("cov-url").value.trim();
  if (!url) {{
    showResult("err", M.no_url);
    document.getElementById("cov-url").focus();
    return;
  }}

  submitEl.disabled = true;
  submitEl.textContent = {sending};

  const payload = {{
    retailer_url: url,
    retailer_name: document.getElementById("cov-name").value.trim() || null,
    note: document.getElementById("cov-note").value.trim() || null,
    contact_email: document.getElementById("cov-email").value.trim() || null,
    source: "marketing"
  }};
  // Don't send empty-string optionals — the API validates email format and
  // an empty string is not a valid address.
  Object.keys(payload).forEach(k => {{ if (payload[k] === null) delete payload[k]; }});

  try {{
    const r = await fetch(RPO_API + "/coverage/request", {{
      method: "POST",
      headers: {{ "Content-Type": "application/json" }},
      body: JSON.stringify(payload)
    }});
    if (r.status === 429) {{
      showResult("err", M.rate);
      return;
    }}
    const data = await r.json();

    if (data.status === "already_supported") {{
      showResult("info", fill(M.supported, {{ name: escapeHtml(data.supported_as) }}));
    }} else if (data.status === "already_recorded") {{
      showResult("ok", M.already);
    }} else if (data.status === "recorded") {{
      let msg = M.recorded;
      if (data.request_count && data.request_count > 1) {{
        msg += "<br>" + fill(M.count, {{
          n: data.request_count,
          domain: escapeHtml(data.retailer_domain)
        }});
      }}
      showResult("ok", msg);
      form.reset();
    }} else {{
      // The API's own `message` is English-only, so it is deliberately not
      // shown — a localized "that isn't a store address" says the same thing.
      showResult("err", M.bad_url);
    }}
  }} catch (_) {{
    showResult("err", M.network);
  }} finally {{
    submitEl.disabled = false;
    submitEl.textContent = {submit};
  }}
}});

// Substitute {{token}} placeholders. Done with a callback rather than a
// plain string replacement because a retailer name containing "$&" would
// otherwise be read by String.replace as a substitution pattern.
function fill(tpl, vals) {{
  return tpl.replace(/\\{{(\\w+)\\}}/g, function (m, k) {{
    return Object.prototype.hasOwnProperty.call(vals, k) ? vals[k] : m;
  }});
}}

function escapeHtml(s) {{
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}}
</script>
<script src="/assets/lang-switcher.js" defer></script>
<script src="/assets/free-quota.js" defer></script>
</body>
</html>
"""


def with_coverage_link(footer: str, sub: str, label: str) -> str:
    """Add 'Request a retailer' to the footer's Product column.

    Idempotent: the English footer already carries the link. Anchored on
    the '#retailers' entry, which is the last item of that column in
    every locale.
    """
    if "coverage.html" in footer:
        return footer
    prefix = f"/{sub}" if sub else ""
    pat = re.compile(r'([ \t]*)(<a href="[^"]*pricing\.html#retailers">[^<]*</a>\n)')
    m = pat.search(footer)
    if not m:
        return footer
    added = f'{m.group(1)}<a href="{prefix}/coverage.html">{label}</a>\n'
    return footer[: m.end()] + added + footer[m.end():]


def build():
    written = []
    for sub, lang in LOCALES.items():
        d = ROOT / sub if sub else ROOT
        donor = d / "products.html"
        if not donor.exists():
            print(f"  SKIP {sub or '.'}: no products.html to take the shell from", file=sys.stderr)
            continue

        s = donor.read_text(encoding="utf-8")
        t = T[lang]

        head_start = s.find("<header")
        head_end = s.find("</header>")
        foot_start = s.rfind("<footer>")
        foot_end = s.rfind("</footer>")
        if -1 in (head_start, head_end, foot_start, foot_end):
            print(f"  SKIP {sub or '.'}: could not locate header/footer", file=sys.stderr)
            continue

        header = s[head_start:head_end + len("</header>")]
        footer = with_coverage_link(
            s[foot_start:foot_end + len("</footer>")], sub, t["footer_link"])

        out = (head_html(sub, lang, t) + "\n" + header + "\n"
               + body_html(t) + "\n" + footer + "\n" + script_html(sub, t))
        (d / "coverage.html").write_text(out, encoding="utf-8")
        written.append(str((d / "coverage.html").relative_to(ROOT)))

    print(f"wrote {len(written)} pages:")
    for w in written:
        print("  ", w)


if __name__ == "__main__":
    build()
