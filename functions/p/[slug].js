// Partner landing pages — /p/<slug>  (GTM §7.2, §11)
//
// Two jobs, and the second one is the reason this exists.
//
// 1. Make the visitor feel they're still with the creator who sent them:
//    that creator's framing, the indicator they led with, a demo product
//    their audience would actually buy.
//
// 2. Record WHICH creator sent them, and carry it far enough that we can
//    still answer "did this channel produce customers, or applause?" thirty
//    days later. §7.5 says never renew a partner on installs alone and §11
//    makes day-30 retention by channel the deciding number — neither is
//    answerable without this.
//
// The attribution hop that makes it hard
// --------------------------------------
// Install goes through the Chrome Web Store, which is a different origin
// and strips anything we attach to the visitor. So we persist the referral
// on OUR origin in two places:
//
//   * `rpo_ref` cookie — survives the round trip, readable server-side on
//     any later request to the site.
//   * `localStorage.rpo_ref` — what the extension actually reads. On first
//     run the extension opens/queries our site and the existing auth_sync
//     bridge hands it over, exactly as it already does for session tokens.
//     THIS FILE IS ONLY THE SITE HALF: the extension must read the key and
//     send it with the install, and the backend must store it on the
//     install row. Without those two, this page records a referral that
//     nothing ever collects.
//
// First-touch wins. A visitor who arrives via one creator and later clicks
// another keeps the first, because the first is what caused the install.
//
// What must NOT vary per partner
// ------------------------------
// The offer. Everyone gets 20 free checks and no card (§7.2 — deliberately
// no per-creator discount codes, which also keeps us clear of negative-
// option rules). Only the framing changes.
//
// noindex: these are campaign destinations. Letting six near-duplicate
// pages compete with the homepage for the same terms would be a net loss.

import { PARTNERS, FALLBACK } from "./_partners.js";

const CWS_URL =
  "https://chromewebstore.google.com/detail/product-origin-checker/";

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Slugs appear in video descriptions and are typed by hand. Keep the
// accepted shape narrow so a junk path can't be reflected into the page.
const SLUG_OK = /^[a-z0-9][a-z0-9-]{0,38}$/;

export async function onRequest(context) {
  const { params } = context;
  const raw = String(params.slug || "").toLowerCase();
  const slug = SLUG_OK.test(raw) ? raw : "";
  const known = Object.prototype.hasOwnProperty.call(PARTNERS, slug);
  const p = known ? PARTNERS[slug] : FALLBACK;

  const html = render(p, known ? slug : null);

  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    // Per-visitor Set-Cookie — must not be shared by a cache.
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  });

  // Only record a referral for a slug we actually recognise. An unknown
  // slug still gets a working page (the URL may already be printed in a
  // video that cannot be edited) but must not pollute channel reporting
  // with a value no partner corresponds to.
  if (known) {
    headers.append(
      "Set-Cookie",
      `rpo_ref=${slug}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    );
  }

  return new Response(html, { headers });
}

function render(p, slug) {
  const who = p.name ? `${esc(p.name)} sent you` : "Welcome";
  const title = p.name
    ? `${esc(p.name)} × Product Origin Checker`
    : "Product Origin Checker";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${esc(p.hook)}">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" sizes="192x192" href="/assets/favicon-192.png">
<link rel="stylesheet" href="/assets/styles.css">
<style>
  :root { --partner-accent: ${esc(p.accent)}; }
  .pw { max-width: 720px; margin: 0 auto; padding: 56px 24px 72px; }
  .pref {
    display: inline-block; font-size: 12px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--partner-accent); margin-bottom: 14px;
  }
  .pw h1 {
    font-family: var(--serif, Georgia, serif); font-weight: 700;
    letter-spacing: -0.02em; font-size: clamp(28px, 4vw, 40px);
    line-height: 1.15; margin: 0 0 16px;
  }
  .pblurb { font-size: 18px; line-height: 1.6; color: var(--ink-3, #57534e); margin: 0 0 24px; }
  .plead {
    border-left: 3px solid var(--partner-accent); padding: 10px 0 10px 18px;
    margin: 0 0 28px; font-size: 16px; line-height: 1.6;
  }
  .plead strong { font-weight: 600; }
  .pcta { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 14px; }
  .pnote { font-size: 14px; color: var(--muted, #78716c); line-height: 1.6; margin: 0 0 8px; }
  .pfine { font-size: 12.5px; color: var(--muted, #78716c); line-height: 1.5; margin: 26px 0 0; }
  .pfour { margin: 34px 0 0; padding: 0; list-style: none; }
  .pfour li {
    padding: 11px 0; border-top: 1px solid var(--border, #e7e5e4);
    font-size: 15.5px; line-height: 1.5;
  }
  .pfour li b { display: inline-block; min-width: 132px; font-weight: 600; }
  .pfour li.is-lead b { color: var(--partner-accent); }
</style>
</head>
<body>
<main class="pw">
  <p class="pref">${who}</p>
  <h1>${esc(p.hook)}</h1>
  <p class="pblurb">${esc(p.blurb)}</p>

  <div class="plead">
    Try it on ${esc(p.demo)}. Start with <strong>${esc(p.lead)}</strong> —
    then look at <strong>${esc(p.second)}</strong>.
  </div>

  <div class="pcta">
    <a class="btn btn-primary" href="${CWS_URL}" rel="noopener">Get the extension</a>
    <a class="btn btn-secondary" href="/products.html#methodology">How it works</a>
  </div>
  <p class="pnote">
    Your first 20 checks are free, no card. Same offer everyone gets —
    we don’t run discount codes.
  </p>

  <ul class="pfour">
    ${["Made in", "Ships from", "Retailer", "Money goes to"].map((k) => {
      const desc = {
        "Made in": "the country the unit was actually built in",
        "Ships from": "where it physically leaves from",
        "Retailer": "who the legal seller of record is",
        "Money goes to": "the country of the brand’s parent company",
      }[k];
      const isLead = k === p.lead || k === p.second;
      return `<li class="${isLead ? "is-lead" : ""}"><b>${k}</b> ${desc}</li>`;
    }).join("\n    ")}
  </ul>

  <p class="pfine">
    Scores are estimates with published confidence, not verdicts, and every
    one cites its sources. Claude is a trademark of Anthropic, PBC; we are a
    customer of Anthropic and not affiliated with, endorsed by, or sponsored
    by them. Retailer and brand names are trademarks of their respective
    owners.
  </p>
</main>
<script>
// First-touch attribution. The cookie above survives the Chrome Web Store
// round trip; this copy is the one the extension reads on first run via the
// existing auth_sync bridge. Do not overwrite an earlier referral — the
// creator who caused the install is the one who should be credited.
(function () {
  var ref = ${slug ? JSON.stringify(slug) : "null"};
  if (!ref) return;
  try {
    if (!localStorage.getItem("rpo_ref")) {
      localStorage.setItem("rpo_ref", ref);
      localStorage.setItem("rpo_ref_at", String(Date.now()));
    }
  } catch (e) { /* private mode — the cookie still carries it */ }
})();
</script>
</body>
</html>`;
}
