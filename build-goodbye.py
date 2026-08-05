#!/usr/bin/env python3
"""Generate goodbye.html (the exit survey) for every supported locale.

The site has no template engine — each locale is a full static page. So
rather than hand-write seven pages and let their nav/footer drift apart,
we clone the shell from that locale's existing products.html (keeping its
already-translated header and footer verbatim) and splice in the survey
between them. Only the survey copy lives here.

Run from the repo root:  python3 build-goodbye.py

Why this page exists: an uninstall is the one piece of feedback where the
person is already gone. There is no follow-up email, no in-app prompt, no
second chance. Whatever we learn, we learn here or not at all — which is
why the survey is one screen, why nothing is required, and why the
thank-you shows even when the POST fails.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
API = "https://api.realproductorigin.com"

# locale dir -> (html lang attr, strings)
# "" is the root (English).
LOCALES = {
    "": "en",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ja": "ja",
    "zh-Hans": "zh-Hans",
    "zh-Hant": "zh-Hant",
}

# Reason codes MUST match backend/app/services/exit_survey.py REASONS.
# The label is translated; the code never is — storing localized text
# would make "why do people leave" unanswerable across languages.
T = {
    "en": {
        "title": "Sorry to see you go",
        "meta": "Tell us why you uninstalled Real Product Origin — one question, and it genuinely helps.",
        "h1": "Sorry to see you go",
        "lede": "You've uninstalled Real Product Origin. If you have twenty seconds, telling us why is the single most useful thing you can do for the next person who installs it.",
        "lede_cancel": "Your subscription is cancelled. If you have twenty seconds, telling us why is the single most useful thing you can do for the next subscriber.",
        "q": "What made you leave?",
        "optional": "Optional",
        "comment_label": "Anything you'd want us to fix?",
        "comment_ph": "Type as much or as little as you like.",
        "submit": "Send feedback",
        "skip": "No thanks",
        "thanks_h": "Thank you — that genuinely helps.",
        "thanks_p": "We read every one of these. If you ever want to try again, the extension is always here.",
        "home": "Back to the homepage",
        "privacy": "We don't collect your name or email here, and this isn't tied to your identity.",
        "r": {
            "not_on_my_stores": "It didn't work on the stores I shop",
            "score_wrong": "The score seemed wrong",
            "score_unclear": "I didn't understand the score",
            "hit_free_limit": "I ran out of free checks",
            "too_expensive": "Too expensive",
            "in_the_way": "It slowed down or cluttered pages",
            "privacy": "Privacy concerns",
            "not_needed": "I just don't need it",
            "other": "Something else",
        },
        "rc": {
            "too_expensive": "Too expensive for what I used",
            "not_using": "I wasn't using it enough",
            "missing_features": "It was missing something I need",
            "found_alternative": "I found a better alternative",
            "technical_problems": "Technical problems",
            "temporary": "Just taking a break — I'll be back",
            "other": "Something else",
        },
    },
    "es": {
        "title": "Lamentamos que te vayas",
        "meta": "Cuéntanos por qué desinstalaste Real Product Origin: una pregunta, y de verdad ayuda.",
        "h1": "Lamentamos que te vayas",
        "lede": "Has desinstalado Real Product Origin. Si tienes veinte segundos, contarnos por qué es lo más útil que puedes hacer por la próxima persona que lo instale.",
        "lede_cancel": "Tu suscripción está cancelada. Si tienes veinte segundos, contarnos por qué es lo más útil que puedes hacer por el próximo suscriptor.",
        "q": "¿Por qué te vas?",
        "optional": "Opcional",
        "comment_label": "¿Hay algo que te gustaría que arregláramos?",
        "comment_ph": "Escribe todo lo que quieras, o muy poco.",
        "submit": "Enviar comentarios",
        "skip": "No, gracias",
        "thanks_h": "Gracias, de verdad nos ayuda.",
        "thanks_p": "Leemos todos los comentarios. Si algún día quieres volver a probarlo, la extensión sigue aquí.",
        "home": "Volver a la página principal",
        "privacy": "Aquí no recopilamos tu nombre ni tu correo, y esto no está vinculado a tu identidad.",
        "r": {
            "not_on_my_stores": "No funcionaba en las tiendas donde compro",
            "score_wrong": "La puntuación parecía incorrecta",
            "score_unclear": "No entendí la puntuación",
            "hit_free_limit": "Se me acabaron las consultas gratuitas",
            "too_expensive": "Demasiado caro",
            "in_the_way": "Ralentizaba o estorbaba en las páginas",
            "privacy": "Preocupaciones de privacidad",
            "not_needed": "Simplemente no lo necesito",
            "other": "Otra cosa",
        },
        "rc": {
            "too_expensive": "Demasiado caro para el uso que le daba",
            "not_using": "No lo usaba lo suficiente",
            "missing_features": "Le faltaba algo que necesito",
            "found_alternative": "Encontré una alternativa mejor",
            "technical_problems": "Problemas técnicos",
            "temporary": "Solo es un descanso, volveré",
            "other": "Otra cosa",
        },
    },
    "fr": {
        "title": "Désolés de vous voir partir",
        "meta": "Dites-nous pourquoi vous avez désinstallé Real Product Origin — une question, et cela aide vraiment.",
        "h1": "Désolés de vous voir partir",
        "lede": "Vous avez désinstallé Real Product Origin. Si vous avez vingt secondes, nous dire pourquoi est la chose la plus utile que vous puissiez faire pour la prochaine personne qui l'installera.",
        "lede_cancel": "Votre abonnement est résilié. Si vous avez vingt secondes, nous dire pourquoi est la chose la plus utile que vous puissiez faire pour le prochain abonné.",
        "q": "Qu'est-ce qui vous a fait partir ?",
        "optional": "Facultatif",
        "comment_label": "Y a-t-il quelque chose que nous devrions corriger ?",
        "comment_ph": "Écrivez autant ou aussi peu que vous voulez.",
        "submit": "Envoyer",
        "skip": "Non merci",
        "thanks_h": "Merci — cela nous aide vraiment.",
        "thanks_p": "Nous lisons chaque réponse. Si vous voulez réessayer un jour, l'extension sera toujours là.",
        "home": "Retour à l'accueil",
        "privacy": "Nous ne recueillons ici ni votre nom ni votre e-mail, et ceci n'est pas lié à votre identité.",
        "r": {
            "not_on_my_stores": "Ça ne marchait pas sur les sites où j'achète",
            "score_wrong": "Le score semblait faux",
            "score_unclear": "Je n'ai pas compris le score",
            "hit_free_limit": "J'ai épuisé mes vérifications gratuites",
            "too_expensive": "Trop cher",
            "in_the_way": "Ça ralentissait ou encombrait les pages",
            "privacy": "Préoccupations de confidentialité",
            "not_needed": "Je n'en ai tout simplement pas besoin",
            "other": "Autre chose",
        },
        "rc": {
            "too_expensive": "Trop cher pour l'usage que j'en faisais",
            "not_using": "Je ne l'utilisais pas assez",
            "missing_features": "Il manquait quelque chose dont j'ai besoin",
            "found_alternative": "J'ai trouvé une meilleure alternative",
            "technical_problems": "Problèmes techniques",
            "temporary": "Juste une pause — je reviendrai",
            "other": "Autre chose",
        },
    },
    "de": {
        "title": "Schade, dass Sie gehen",
        "meta": "Sagen Sie uns, warum Sie Real Product Origin deinstalliert haben — eine Frage, und sie hilft wirklich.",
        "h1": "Schade, dass Sie gehen",
        "lede": "Sie haben Real Product Origin deinstalliert. Wenn Sie zwanzig Sekunden haben: Uns den Grund zu nennen ist das Nützlichste, was Sie für die nächste Person tun können, die es installiert.",
        "lede_cancel": "Ihr Abonnement ist gekündigt. Wenn Sie zwanzig Sekunden haben: Uns den Grund zu nennen ist das Nützlichste, was Sie für den nächsten Abonnenten tun können.",
        "q": "Warum gehen Sie?",
        "optional": "Optional",
        "comment_label": "Gibt es etwas, das wir beheben sollten?",
        "comment_ph": "Schreiben Sie so viel oder so wenig Sie möchten.",
        "submit": "Feedback senden",
        "skip": "Nein danke",
        "thanks_h": "Danke — das hilft uns wirklich.",
        "thanks_p": "Wir lesen jede Rückmeldung. Falls Sie es noch einmal versuchen möchten: Die Erweiterung ist weiterhin da.",
        "home": "Zurück zur Startseite",
        "privacy": "Wir erfassen hier weder Ihren Namen noch Ihre E-Mail-Adresse, und dies ist nicht mit Ihrer Identität verknüpft.",
        "r": {
            "not_on_my_stores": "Es funktionierte nicht bei den Shops, in denen ich einkaufe",
            "score_wrong": "Die Bewertung wirkte falsch",
            "score_unclear": "Ich habe die Bewertung nicht verstanden",
            "hit_free_limit": "Meine kostenlosen Abfragen waren aufgebraucht",
            "too_expensive": "Zu teuer",
            "in_the_way": "Es hat Seiten verlangsamt oder überladen",
            "privacy": "Datenschutzbedenken",
            "not_needed": "Ich brauche es einfach nicht",
            "other": "Etwas anderes",
        },
        "rc": {
            "too_expensive": "Zu teuer für meine Nutzung",
            "not_using": "Ich habe es zu wenig genutzt",
            "missing_features": "Es fehlte etwas, das ich brauche",
            "found_alternative": "Ich habe eine bessere Alternative gefunden",
            "technical_problems": "Technische Probleme",
            "temporary": "Nur eine Pause — ich komme wieder",
            "other": "Etwas anderes",
        },
    },
    "ja": {
        "title": "ご利用ありがとうございました",
        "meta": "Real Product Origin をアンインストールされた理由をお聞かせください。設問はひとつだけです。",
        "h1": "ご利用ありがとうございました",
        "lede": "Real Product Origin をアンインストールされました。20秒だけいただけるなら、その理由を教えていただくことが、次に使う方のために最も役立ちます。",
        "lede_cancel": "サブスクリプションは解約されました。20秒だけいただけるなら、その理由を教えていただくことが、次の登録者のために最も役立ちます。",
        "q": "やめた理由を教えてください",
        "optional": "任意",
        "comment_label": "改善してほしい点はありますか？",
        "comment_ph": "長くても短くても構いません。",
        "submit": "送信する",
        "skip": "スキップ",
        "thanks_h": "ありがとうございます。とても助かります。",
        "thanks_p": "いただいたご意見はすべて読んでいます。またお試しになりたくなったら、いつでもお待ちしています。",
        "home": "ホームに戻る",
        "privacy": "ここでは氏名やメールアドレスは収集せず、個人を特定する情報とも紐づけません。",
        "r": {
            "not_on_my_stores": "よく使う店舗で動作しなかった",
            "score_wrong": "スコアが間違っているように見えた",
            "score_unclear": "スコアの意味が分からなかった",
            "hit_free_limit": "無料チェックの回数を使い切った",
            "too_expensive": "価格が高い",
            "in_the_way": "ページが重くなる・邪魔になる",
            "privacy": "プライバシーが気になる",
            "not_needed": "単純に必要なくなった",
            "other": "その他",
        },
        "rc": {
            "too_expensive": "使用頻度に対して高かった",
            "not_using": "あまり使っていなかった",
            "missing_features": "必要な機能がなかった",
            "found_alternative": "より良い代替を見つけた",
            "technical_problems": "技術的な問題",
            "temporary": "少し休むだけ。また戻ります",
            "other": "その他",
        },
    },
    "zh-Hans": {
        "title": "很遗憾您要离开",
        "meta": "告诉我们您卸载 Real Product Origin 的原因——只有一个问题，但真的很有帮助。",
        "h1": "很遗憾您要离开",
        "lede": "您已卸载 Real Product Origin。如果您有二十秒钟，告诉我们原因，是您能为下一位使用者做的最有价值的事。",
        "lede_cancel": "您的订阅已取消。如果您有二十秒钟，告诉我们原因，是您能为下一位订阅者做的最有价值的事。",
        "q": "您为什么离开？",
        "optional": "选填",
        "comment_label": "有什么希望我们改进的吗？",
        "comment_ph": "写多写少都可以。",
        "submit": "发送反馈",
        "skip": "暂不填写",
        "thanks_h": "谢谢，这对我们很有帮助。",
        "thanks_p": "每一条反馈我们都会阅读。如果您以后想再试一次，扩展程序随时都在。",
        "home": "返回首页",
        "privacy": "此处不收集您的姓名或邮箱，也不会与您的身份关联。",
        "r": {
            "not_on_my_stores": "在我常逛的商店里用不了",
            "score_wrong": "评分看起来不准确",
            "score_unclear": "我看不懂评分",
            "hit_free_limit": "免费查询次数用完了",
            "too_expensive": "价格太高",
            "in_the_way": "让页面变慢或变乱",
            "privacy": "隐私顾虑",
            "not_needed": "我就是不需要了",
            "other": "其他原因",
        },
        "rc": {
            "too_expensive": "相对使用量来说太贵",
            "not_using": "用得不够多",
            "missing_features": "缺少我需要的功能",
            "found_alternative": "找到了更好的替代品",
            "technical_problems": "技术问题",
            "temporary": "只是暂停一下，我会回来",
            "other": "其他原因",
        },
    },
    "zh-Hant": {
        "title": "很遺憾您要離開",
        "meta": "告訴我們您解除安裝 Real Product Origin 的原因——只有一個問題，但真的很有幫助。",
        "h1": "很遺憾您要離開",
        "lede": "您已解除安裝 Real Product Origin。如果您有二十秒鐘，告訴我們原因，是您能為下一位使用者做的最有價值的事。",
        "lede_cancel": "您的訂閱已取消。如果您有二十秒鐘，告訴我們原因，是您能為下一位訂閱者做的最有價值的事。",
        "q": "您為什麼離開？",
        "optional": "選填",
        "comment_label": "有什麼希望我們改進的嗎？",
        "comment_ph": "寫多寫少都可以。",
        "submit": "送出回饋",
        "skip": "暫不填寫",
        "thanks_h": "謝謝，這對我們很有幫助。",
        "thanks_p": "每一則回饋我們都會閱讀。如果您日後想再試一次，擴充功能隨時都在。",
        "home": "返回首頁",
        "privacy": "此處不會收集您的姓名或電子郵件，也不會與您的身分連結。",
        "r": {
            "not_on_my_stores": "在我常逛的商店無法使用",
            "score_wrong": "評分看起來不正確",
            "score_unclear": "我看不懂評分",
            "hit_free_limit": "免費查詢次數用完了",
            "too_expensive": "價格太高",
            "in_the_way": "讓頁面變慢或變亂",
            "privacy": "隱私疑慮",
            "not_needed": "我就是不需要了",
            "other": "其他原因",
        },
        "rc": {
            "too_expensive": "相對使用量來說太貴",
            "not_using": "用得不夠多",
            "missing_features": "缺少我需要的功能",
            "found_alternative": "找到了更好的替代品",
            "technical_problems": "技術問題",
            "temporary": "只是暫停一下，我會回來",
            "other": "其他原因",
        },
    },
}

STYLE = """
<style>
  .gb { max-width: 620px; margin: 0 auto; padding: 56px 20px 80px; }
  .gb h1 { margin: 0 0 14px; }
  .gb .lede { color: var(--ink-2); font-size: 17px; line-height: 1.6; margin: 0 0 36px; }
  .gb fieldset { border: 0; padding: 0; margin: 0 0 28px; }
  .gb legend { font-weight: 650; font-size: 16px; margin-bottom: 14px; padding: 0; }
  .gb .opt { display: flex; align-items: flex-start; gap: 11px; padding: 11px 13px;
             border: 1px solid var(--rule, #e5e0d5); border-radius: 8px; margin-bottom: 8px;
             cursor: pointer; transition: border-color .12s, background .12s; }
  .gb .opt:hover { border-color: var(--sea, #0284c7); background: rgba(2,132,199,.04); }
  .gb .opt input { margin-top: 3px; flex-shrink: 0; }
  .gb .opt span { line-height: 1.45; }
  .gb label.blk { display: block; font-weight: 650; font-size: 16px; margin: 0 0 8px; }
  .gb .hint { font-weight: 400; color: var(--ink-3, #8a8377); font-size: 14px; }
  .gb textarea { width: 100%; min-height: 108px; padding: 12px 13px; font: inherit; font-size: 15px;
                 border: 1px solid var(--rule, #e5e0d5); border-radius: 8px; resize: vertical;
                 background: #fff; color: inherit; box-sizing: border-box; }
  .gb textarea:focus { outline: 2px solid var(--sea, #0284c7); outline-offset: 1px; border-color: transparent; }
  .gb .actions { display: flex; align-items: center; gap: 18px; margin-top: 26px; flex-wrap: wrap; }
  .gb .privacy { font-size: 13.5px; color: var(--ink-3, #8a8377); margin-top: 26px; line-height: 1.5; }
  .gb .thanks { text-align: center; padding: 40px 0; }
  .gb .thanks h2 { margin: 0 0 12px; }
  .gb .thanks p { color: var(--ink-2); font-size: 16.5px; line-height: 1.6; margin: 0 0 26px; }
  .gb .muted-link { color: var(--ink-3, #8a8377); text-decoration: underline; font-size: 15px; }
</style>
"""


def survey_html(t: dict) -> str:
    """The survey body. Both reason lists ship; JS shows the right one."""
    def opts(d, name):
        return "\n".join(
            f'        <label class="opt"><input type="radio" name="{name}" value="{code}">'
            f'<span>{label}</span></label>'
            for code, label in d.items()
        )

    return f"""
<div class="gb">
  <div id="gb-form">
    <h1>{t['h1']}</h1>
    <p class="lede" id="gb-lede" data-uninstall="{t['lede']}" data-cancel="{t['lede_cancel']}">{t['lede']}</p>

    <fieldset id="gb-reasons-uninstall">
      <legend>{t['q']}</legend>
{opts(t['r'], 'reason')}
    </fieldset>

    <fieldset id="gb-reasons-cancel" hidden>
      <legend>{t['q']}</legend>
{opts(t['rc'], 'reason_cancel')}
    </fieldset>

    <label class="blk" for="gb-comment">{t['comment_label']}
      <span class="hint">— {t['optional']}</span></label>
    <textarea id="gb-comment" placeholder="{t['comment_ph']}"></textarea>

    <div class="actions">
      <button type="button" class="btn" id="gb-submit">{t['submit']}</button>
      <a class="muted-link" href="/" id="gb-skip">{t['skip']}</a>
    </div>

    <p class="privacy">{t['privacy']}</p>
  </div>

  <div id="gb-thanks" class="thanks" hidden>
    <h2>{t['thanks_h']}</h2>
    <p>{t['thanks_p']}</p>
    <a class="btn" href="/">{t['home']}</a>
  </div>
</div>

<script>
(function () {{
  var API = {API!r};
  var qs = new URLSearchParams(location.search);
  var source = qs.get('source') === 'cancellation' ? 'cancellation' : 'uninstall';

  // Swap copy + reason list for the cancellation variant. Both lists are
  // in the DOM already so this needs no second page and no round-trip.
  var lede = document.getElementById('gb-lede');
  if (source === 'cancellation') {{
    lede.textContent = lede.getAttribute('data-cancel');
    document.getElementById('gb-reasons-uninstall').hidden = true;
    document.getElementById('gb-reasons-cancel').hidden = false;
  }}

  function chosen() {{
    var name = source === 'cancellation' ? 'reason_cancel' : 'reason';
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }}

  function done() {{
    document.getElementById('gb-form').hidden = true;
    document.getElementById('gb-thanks').hidden = false;
    window.scrollTo(0, 0);
  }}

  document.getElementById('gb-submit').addEventListener('click', function () {{
    var reason = chosen();
    var comment = document.getElementById('gb-comment').value.trim();

    // Nothing said: treat as a skip rather than posting an empty row.
    if (!reason && !comment) {{ done(); return; }}

    var payload = {{
      source: source,
      reason_code: reason,
      comment: comment || null,
      locale: document.documentElement.lang || null,
      extension_version: qs.get('v') || null,
      install_id: qs.get('iid') || null,
      plan: qs.get('plan') || null
    }};

    // Show the thank-you IMMEDIATELY, before the request settles, and
    // never surface a failure. Someone who just uninstalled has no reason
    // to care that our API had a bad moment, cannot retry, and would only
    // read an error as one more thing this product got wrong.
    done();

    try {{
      fetch(API + '/exit-survey', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify(payload),
        keepalive: true   // survives the tab being closed straight after
      }}).catch(function () {{}});
    }} catch (e) {{ /* ignore */ }}
  }});
}})();
</script>
"""


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

        head_end = s.find("</header>")
        foot_start = s.rfind("<footer>")
        if head_end == -1 or foot_start == -1:
            print(f"  SKIP {sub or '.'}: could not locate header/footer", file=sys.stderr)
            continue

        head = s[: head_end + len("</header>")]
        tail = s[foot_start:]

        # Rewrite the donor's <head> metadata for this page.
        head = re.sub(r"<title>.*?</title>", f"<title>{t['title']} — Real Product Origin</title>",
                      head, count=1, flags=re.S)
        head = re.sub(r'(<meta name="description" content=")[^"]*(")',
                      lambda m: m.group(1) + t["meta"] + m.group(2), head, count=1)
        head = re.sub(r'(<meta property="og:title" content=")[^"]*(")',
                      lambda m: m.group(1) + t["title"] + m.group(2), head, count=1)
        head = re.sub(r'(<meta property="og:description" content=")[^"]*(")',
                      lambda m: m.group(1) + t["meta"] + m.group(2), head, count=1)
        canon = f"https://realproductorigin.com/{sub + '/' if sub else ''}goodbye"
        head = re.sub(r'(<link rel="canonical" href=")[^"]*(")',
                      lambda m: m.group(1) + canon + m.group(2), head, count=1)
        head = re.sub(r'(<meta property="og:url" content=")[^"]*(")',
                      lambda m: m.group(1) + canon + m.group(2), head, count=1)

        # Nobody should find this page in search — it is only ever reached
        # from a Chrome uninstall redirect or the cancellation flow.
        head = head.replace("</head>", '<meta name="robots" content="noindex">\n'
                            + STYLE + "</head>", 1)

        out = head + survey_html(t) + "\n" + tail
        (d / "goodbye.html").write_text(out, encoding="utf-8")
        written.append(str((d / "goodbye.html").relative_to(ROOT)))

    print(f"wrote {len(written)} pages:")
    for w in written:
        print("  ", w)


if __name__ == "__main__":
    build()
