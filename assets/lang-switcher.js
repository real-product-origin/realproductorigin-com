// Marketing site language switcher.
//
// Renders a compact button in the header nav that opens a floating panel
// listing every supported locale (native name + English gloss + current
// pick indicated). Reads the current locale from <html lang="…">, computes
// the target URL for the selected language, sets the `rpo_lang` cookie
// (which the Cloudflare Pages middleware treats as authoritative — the
// visitor's manual choice sticks across visits regardless of geo), then
// navigates.
//
// URL routing rules:
//   * Home:      /  <->  /LANG/
//   * pricing.html + products.html exist in every translated locale.
//     Other pages (why, support, etc.) don't — for those, switching to
//     a non-English language sends the visitor to the language home
//     rather than dropping them on an English page mid-flow. Switching
//     back to English on a non-translated page keeps the current URL.
//
// Dependency-free (~110 lines including UI + click handlers + CSS
// selectors). Loads with `defer` from a single <script> tag across
// every marketing page (see assets/styles.css for the visual styles).

(function () {
  var LANGS = [
    { code: "en",      native: "English",       gloss: "English"             },
    { code: "fr",      native: "Français",      gloss: "French"              },
    { code: "de",      native: "Deutsch",       gloss: "German"              },
    { code: "es",      native: "Español",       gloss: "Spanish"             },
    { code: "ja",      native: "日本語",         gloss: "Japanese"            },
    { code: "zh-Hans", native: "简体中文",       gloss: "Chinese (Simplified)"},
    { code: "zh-Hant", native: "繁體中文",       gloss: "Chinese (Traditional)"},
  ];

  // Pages that have translated versions under each /LANG/. If the current
  // path matches one, the switcher preserves the page; otherwise switching
  // language goes to the language home.
  var TRANSLATED_PAGES = ["index.html", "pricing.html", "products.html"];

  // Match all supported LANG prefixes in the URL path so we can strip them
  // to figure out "what page is this, agnostic of language".
  var LANG_PREFIX_RE = /^\/(fr|de|es|ja|zh-Hans|zh-Hant)\//;

  function currentLang() {
    var tag = (document.documentElement.getAttribute("lang") || "en");
    // Normalize case for the Chinese script subtag: html lang="zh-Hans"
    // is the canonical form; also accept lowercase from other tools.
    if (/^zh/i.test(tag)) {
      if (/hant/i.test(tag)) return "zh-Hant";
      return "zh-Hans";
    }
    return tag.toLowerCase().split("-")[0];
  }

  function currentPageBasename() {
    var path = location.pathname.replace(LANG_PREFIX_RE, "/");
    if (path === "/" || path === "") return "index.html";
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function targetUrlForLang(lang) {
    var page = currentPageBasename();
    var isTranslated = TRANSLATED_PAGES.indexOf(page) !== -1;
    if (lang === "en") {
      if (isTranslated) return page === "index.html" ? "/" : "/" + page;
      return location.pathname.replace(LANG_PREFIX_RE, "/"); // stay on this en-only page
    }
    if (isTranslated) {
      return page === "index.html" ? "/" + lang + "/" : "/" + lang + "/" + page;
    }
    return "/" + lang + "/";
  }

  function build() {
    var nav = document.querySelector("header nav");
    if (!nav) return;
    if (nav.querySelector(".lang-switcher")) return;
    var active = currentLang();
    var activeMeta = LANGS.find(function (l) { return l.code === active; }) || LANGS[0];

    var wrap = document.createElement("div");
    wrap.className = "lang-switcher";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-switcher__toggle";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Change language — currently " + activeMeta.native);
    btn.innerHTML =
      '<svg class="lang-switcher__globe" viewBox="0 0 20 20" aria-hidden="true">' +
        '<circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
        '<path d="M 10 2.5 Q 4 10 10 17.5 M 10 2.5 Q 16 10 10 17.5 M 2.5 10 L 17.5 10" ' +
              'fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      '</svg>' +
      '<span class="lang-switcher__label">' + activeMeta.native + '</span>' +
      '<svg class="lang-switcher__caret" viewBox="0 0 12 12" aria-hidden="true">' +
        '<path d="M 3 4.5 L 6 8 L 9 4.5" fill="none" stroke="currentColor" ' +
              'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    var panel = document.createElement("div");
    panel.className = "lang-switcher__panel";
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", "Language");
    panel.hidden = true;

    LANGS.forEach(function (l) {
      var opt = document.createElement("a");
      opt.className = "lang-switcher__option" + (l.code === active ? " is-active" : "");
      opt.href = targetUrlForLang(l.code);
      opt.setAttribute("role", "option");
      opt.setAttribute("hreflang", l.code);
      opt.setAttribute("lang", l.code);
      if (l.code === active) opt.setAttribute("aria-current", "true");
      opt.innerHTML =
        '<span class="lang-switcher__native">' + l.native + '</span>' +
        '<span class="lang-switcher__gloss">' + l.gloss + '</span>' +
        (l.code === active
          ? '<svg class="lang-switcher__check" viewBox="0 0 14 14" aria-hidden="true">' +
              '<path d="M 3 7 L 6 10 L 11 4" fill="none" stroke="currentColor" ' +
                    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>'
          : '');
      opt.addEventListener("click", function () {
        // Cookie is authoritative — geo-redirect middleware respects a
        // manually-picked language on every future visit, regardless of IP.
        try {
          document.cookie = "rpo_lang=" + l.code +
            "; Path=/; Max-Age=31536000; SameSite=Lax";
        } catch (_) {}
      });
      panel.appendChild(opt);
    });

    function open() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      wrap.classList.add("is-open");
    }
    function close() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      wrap.classList.remove("is-open");
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (panel.hidden) open(); else close();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target) && !panel.hidden) close();
    });
    // Esc closes the panel and returns focus to the toggle — standard
    // WAI-ARIA behavior for a listbox popup.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { close(); btn.focus(); }
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    var signIn = nav.querySelector("#nav-account-link");
    if (signIn) nav.insertBefore(wrap, signIn);
    else nav.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
