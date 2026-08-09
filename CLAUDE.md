# realproductorigin.com — marketing site

Static HTML, no build step, no framework. Deploys to Cloudflare Pages
automatically on push to main.

**This is one of two repos.** The product itself — extension, scoring
backend, admin site — lives in `~/projects/origin-app`, which has its
own CLAUDE.md with the scoring rules, the `--workers 2` traps and the
deployment map. If a task touches both, start the session from `~` so
both are reachable.

---

## Standing product decisions (do not relitigate)

- **No affiliate links, ever.** Outbound links are plain: no tag, no
  redirect through us, no click tracking on the way out. The product is
  "we tell you the truth about origin"; a commission on the click gives
  us a financial interest in what we rank, and a shopper cannot tell a
  ranking from a paid ranking.
- **No product images.** Hotlinking retailer CDNs carries the same
  terms-of-service exposure that stopped us storing retailer
  descriptions, many retailers block it by Referer anyway, and the one
  licensed route for Amazon images (PA-API) requires an Associates
  account — i.e. being an affiliate, which is ruled out above.
  `/shop` leads with a country flag instead. Amazon already has the
  photo; what they cannot show is where it was made.
- **No production users** until Levi says otherwise.

## Structure

```
/*.html                 English pages (14 of them)
/es /fr /de /ja /zh-Hans /zh-Hant
                        locale dirs — ONLY index, pricing, products,
                        coverage, goodbye. Everything else is
                        English-only.
/assets/                styles.css, lang-switcher.js, favicons
/subscribe/             sign-in + account pages
/functions/             Cloudflare Pages Functions
build-goodbye.py        generates goodbye.html for all 7 locales
build-coverage.py       generates coverage.html for all 7 locales
```

The two `build-*.py` scripts are the only generated pages. Edit the copy
in the script and re-run it — editing the generated HTML directly means
the next run silently reverts you. Both take their header and footer
from that locale's `products.html`, so a nav or footer change to the
translated pages propagates on the next run.

`assets/lang-switcher.js` has its own `TRANSLATED_PAGES` list. A page
translated into every locale has to be added there too, or the language
switcher drops the visitor on the locale home page instead of the
translation that exists.

Seven locales total: en (root) + six subdirectories.

## Conventions

- **No build step.** Edit HTML directly. There is no bundler, no
  templating engine, nothing to compile.
- **Adding a page in every locale**: clone that locale's existing shell
  (usually `products.html`) so its already-translated header, nav and
  footer stay verbatim, then replace the body. That is what
  `build-goodbye.py` does — copy the pattern rather than hand-writing
  seven pages that then drift apart.
- **Outbound retailer links**: `rel="noopener nofollow"`,
  `target="_blank"`.
- **API base**: `https://api.realproductorigin.com`.
- Pages that should not be indexed (e.g. `goodbye.html`, reached only
  from a Chrome uninstall redirect) need `<meta name="robots"
  content="noindex">`.

## Verifying a change

Render it. Do not reason about the markup.

```bash
python3 -m http.server 4321   # or use the `marketing` preview config
```

Two bugs on this site were found only by rendering and would have passed
any markup assertion:

- A header that did not wrap, pushing "Sign out" off-screen. The test
  asserted the HTML *contained* "Sign out" — which it did, invisibly.
- `.sh-more { display: block }` silently overrode the `[hidden]`
  attribute, so a "Show more" button stayed visible with nothing left to
  load. An explicit `display` rule always beats `[hidden]`.

## Credentials

Nothing belongs in this file — it is committed and pushed, and git
history is permanent. `git push` already works from the machine's
configured credentials. Backend/admin secrets live in
`~/projects/origin-app/backend/.env` (gitignored).
