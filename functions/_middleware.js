// Cloudflare Pages Function: geo-auto-redirect for language.
//
// Runs on every request through the site. On a request from a country whose
// primary language we support (fr / de / es), if the visitor hasn't already
// signaled a language preference (either by being on a /LANG/ URL, or by
// carrying an `rpo_lang` cookie set by the switcher / a prior auto-redirect),
// respond 302 to the same page in the visitor's language. Also sets the
// cookie so the check is only paid once per browser session.
//
// The cookie is authoritative — a user who explicitly picks a language via
// the switcher gets that language on every future visit, regardless of IP.
// A user who visits from a supported country and doesn't override stays on
// that language too. Anything else falls through to the English original.
//
// Only redirects HTML page requests. Assets, functions/api/*, and anything
// with an extension pass through untouched.

// ISO-3166 country → language mapping. Deliberately conservative: only
// countries where the primary language is one we've translated the site into.
// Switzerland maps to French for simplicity (multilingual — user can override).
// Belgium likewise (Dutch not supported yet; French is the largest fallback).
const COUNTRY_TO_LANG = {
  // French
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", CH: "fr",
  // German
  DE: "de", AT: "de", LI: "de",
  // Spanish (Spain + Latin America)
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", VE: "es",
  UY: "es", PY: "es", BO: "es", EC: "es", DO: "es", CU: "es", GT: "es",
  HN: "es", SV: "es", NI: "es", CR: "es", PA: "es", PR: "es",
  // Japanese
  JP: "ja",
  // Chinese — Simplified for mainland + Singapore; Traditional for
  // Taiwan + Hong Kong + Macau. Matches the extension's default
  // detectBrowserLocale mapping (see extension/i18n.js).
  CN: "zh-Hans", SG: "zh-Hans",
  TW: "zh-Hant", HK: "zh-Hant", MO: "zh-Hant",
};

// Pages that have translated versions. For non-translated pages we still
// redirect visitors to the /LANG/ home so at least they see a translated
// site — better than dropping them mid-flow on an English page.
const TRANSLATED_PAGES = new Set([
  "", "index.html", "pricing.html", "products.html", "coverage.html",
]);

// Skip anything with a file extension that isn't .html. Keeps redirects off
// static assets, favicons, and the JSON api routes.
const NON_HTML_EXT = /\.(css|js|mjs|json|xml|txt|png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf|eot|webmanifest|map|pdf|mp4|webm)$/i;

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const p of parts) {
    const [k, ...v] = p.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Only touch page requests. Assets fall through immediately.
  if (NON_HTML_EXT.test(path)) return next();
  // Any API route defined under functions/api/ — leave alone.
  if (path.startsWith("/api/")) return next();
  // Partner landing pages (/p/<slug>) must never be geo-redirected. A
  // redirect here would drop the sponsor's framing AND lose the referral
  // attribution the whole page exists to record — so a German viewer of a
  // US creator would land on /de/ and count as organic. These pages carry
  // their own language decision; they are campaign destinations, not site
  // navigation.
  if (path === "/p" || path.startsWith("/p/")) return next();
  // If the visitor is already inside a translated dir, no redirect.
  // Note: zh-Hans / zh-Hant have hyphens — safe in URL paths and safe
  // in the regex character-class alternation below.
  if (/^\/(fr|de|es|ja|zh-Hans|zh-Hant)(\/|$)/.test(path)) return next();

  // Respect explicit user choice (from switcher or prior auto-redirect).
  const cookieHeader = request.headers.get("Cookie") || "";
  const chosen = readCookie(cookieHeader, "rpo_lang");
  if (chosen) {
    // If user chose "en" explicitly, we're already serving that — no-op.
    if (chosen === "en") return next();
    // Otherwise redirect to their chosen lang if it's one we support.
    if (
      chosen === "fr" || chosen === "de" || chosen === "es" ||
      chosen === "ja" || chosen === "zh-Hans" || chosen === "zh-Hant"
    ) {
      return redirectToLang(path, chosen, /* setCookie */ false);
    }
    // Any other value is stale/bogus — just pass through.
    return next();
  }

  // No cookie — consult geo. Cloudflare sets CF-IPCountry on every request.
  const country = request.headers.get("CF-IPCountry") || "";
  const targetLang = COUNTRY_TO_LANG[country];
  if (!targetLang) return next();

  return redirectToLang(path, targetLang, /* setCookie */ true);
}

function redirectToLang(currentPath, lang, setCookie) {
  // Determine the target path within the /LANG/ dir.
  const basename = currentPath.replace(/^\//, "").replace(/\/$/, "") || "";
  const filename = basename.endsWith(".html") ? basename : (basename ? basename + ".html" : "");
  const isTranslatable = TRANSLATED_PAGES.has(filename);
  let target;
  if (!isTranslatable) {
    // Untranslated page (why, support, terms, etc.) — send to LANG home
    // so the visitor lands on a translated context rather than being
    // dropped on an English page in the middle of the flow.
    target = `/${lang}/`;
  } else if (filename === "" || filename === "index.html") {
    target = `/${lang}/`;
  } else {
    target = `/${lang}/${filename}`;
  }

  const headers = {
    Location: target,
    // Vary tells caches this response varies by geo + cookie so upstream
    // proxies don't cache a redirect meant for a French user and serve it
    // to an English one.
    Vary: "CF-IPCountry, Cookie",
    // No caching — we want every fresh visitor to re-run the logic.
    "Cache-Control": "no-store",
  };
  if (setCookie) {
    // 1-year cookie. Path=/ so it covers every route. SameSite=Lax so it
    // still ships on top-level GET nav from external links (Google, ads).
    headers["Set-Cookie"] = `rpo_lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  return new Response(null, { status: 302, headers });
}
