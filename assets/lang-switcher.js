// Marketing site language switcher.
//
// Renders a small dropdown in the header nav. Reads the current locale from
// <html lang="…">, computes the target URL for the selected language, and
// navigates.
//
// URL routing rules:
//   * Home:      /  <->  /fr/  <->  /de/  <->  /es/
//   * pricing.html and products.html exist in fr/de/es; other pages don't.
//     For a page that isn't translated in the target language, we fall
//     back to that language's home (/fr/, /de/, /es/) so the user still
//     sees the translated site.
//
// Kept ~50 lines and dependency-free so it can load with `defer` from a
// single <script> tag across every marketing page.
(function () {
  var LANGS = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
  ];
  // Pages that have translated versions under /fr/, /de/, /es/. If the current
  // path matches one, the switcher preserves the page; otherwise switching
  // language goes to the home of that language.
  var TRANSLATED_PAGES = ["index.html", "pricing.html", "products.html"];

  function currentLang() {
    var tag = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    if (tag.indexOf("zh") === 0) return tag; // not currently supported for marketing but future-proof
    return tag.split("-")[0];
  }

  function currentPageBasename() {
    // Strip any /fr/, /de/, /es/ prefix, keep the trailing filename.
    var path = location.pathname.replace(/^\/(fr|de|es)\//, "/");
    if (path === "/" || path === "") return "index.html";
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function targetUrlForLang(lang) {
    var page = currentPageBasename();
    var isTranslated = TRANSLATED_PAGES.indexOf(page) !== -1;
    if (lang === "en") {
      // If the current page has a translated version, switching back to en
      // means the English page. If not, we're already on the English-only
      // page — keep the user on it rather than sending them to home.
      if (isTranslated) return page === "index.html" ? "/" : "/" + page;
      return location.pathname;
    }
    if (isTranslated) {
      return page === "index.html" ? "/" + lang + "/" : "/" + lang + "/" + page;
    }
    return "/" + lang + "/";
  }

  function build() {
    var nav = document.querySelector("header nav");
    if (!nav) return;
    if (nav.querySelector(".lang-switcher")) return; // idempotent
    var active = currentLang();

    var wrap = document.createElement("div");
    wrap.className = "lang-switcher";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-switcher__toggle";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    var activeLangMeta = LANGS.find(function (l) { return l.code === active; }) || LANGS[0];
    btn.textContent = activeLangMeta.label + " ▾";

    var menu = document.createElement("ul");
    menu.className = "lang-switcher__menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;
    LANGS.forEach(function (l) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = targetUrlForLang(l.code);
      a.textContent = l.label;
      a.setAttribute("role", "option");
      a.setAttribute("hreflang", l.code);
      a.setAttribute("lang", l.code);
      if (l.code === active) a.setAttribute("aria-current", "true");
      // Set the rpo_lang cookie on click. Cloudflare Pages `_middleware.js`
      // reads this cookie and treats it as authoritative — it overrides
      // CF-IPCountry-based auto-redirect, so a user who explicitly picks
      // a language keeps it on every future visit regardless of IP.
      a.addEventListener("click", function () {
        try {
          document.cookie = "rpo_lang=" + l.code +
            "; Path=/; Max-Age=31536000; SameSite=Lax";
        } catch (_) {}
      });
      li.appendChild(a);
      menu.appendChild(li);
    });

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = !menu.hidden;
      menu.hidden = open;
      btn.setAttribute("aria-expanded", String(!open));
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target) && !menu.hidden) {
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    // Insert before the sign-in link if present, else at the end of nav.
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
