# realproductorigin.com — marketing site

Static HTML, no build step, no framework. Deploys to Cloudflare Pages
automatically on push to main.

**This is one of two repos.** The product itself — extension, scoring
backend, admin site — lives in `~/projects/origin-app`, which has its
own CLAUDE.md with the scoring rules, the `--workers 2` traps and the
deployment map. If a task touches both, start the session from `~` so
both are reachable.

---

## FIRST COMMAND OF EVERY SESSION, BEFORE READING OR EDITING ANYTHING

    git fetch origin && git status -sb

Several threads work on these repos at once, and this checkout in
particular is easy to leave behind — sessions spend most of their time in
`origin-app` and touch this repo occasionally, so it can sit days stale
while feeling current. Nothing in `git status` warns you.

**Fetching before you PUSH does not cover you.** It surfaces the collision
only after the work is done. On 2026-09-02 a full set of changes was written
against a `history.html` that was three days behind `origin` — the page had
been rewritten with tabs and a sortable table in the meantime — and the work
had to be discarded and redone against the real version.

If `origin/main` moved and touched a file you are about to edit, RE-READ that
file before editing it. An edit computed against a stale copy silently
reverts someone else, and a clean merge will not tell you.

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
python3 check-nav.py
```

Run this after ANY nav edit. There is no build step and no test runner,
so a nav is only as correct as the last person who remembered to edit
fifty-one files — and it has failed quietly twice. `subscribe/` had
never carried Support at all, so signing in and clicking My Account made
a menu item vanish; and the mobile rules were `nav a:nth-child(3)`/`(4)`
with comments naming links that had left the nav long ago, by then
hiding **Pricing**. The script asserts the SHAPE (same ordered
destinations, locale prefixes normalised), not the markup — localised
labels are fine, a missing destination is not.

```bash
python3 check-i18n.py
```

**Translation is part of shipping, not a follow-up.** Levi's standing rule,
2026-08-27, for every thread: a change to a translated page lands in all
seven locales in the same commit, or it is not done. This script fails when
a page that HAS translations loses one, and warns when a translation drifts
from its own language's usual length — a section added to the English and
nowhere else shows up as a size gap long before anyone reads both. It
compares each locale against ITSELF, because Chinese runs ~41% of the
English character count and Japanese ~55%, and a flat threshold flagged
every CJK page.

`ENGLISH_ONLY` in that script is the honest debt list: fourteen pages have
never been translated, including `brands.html` and `history.html`. Shrinking
it is real work — `history.html` in particular builds ~16 user-facing
strings in JavaScript and needs a string table before it can be translated
at all. A page leaving that list without six translations is a failure.

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
