# Marketing site — style + editing brief

This doc is the self-contained brief for anyone editing the
`realproductorigin-com` repo (Bro thread, human collaborators, future
Claude sessions). Read this before making changes.

The site is a static HTML site deployed via Cloudflare Pages. No build
step, no framework. Every page is a self-contained `.html` file that
links to `assets/styles.css` and inlines any page-specific CSS in a
`<style>` block. Cloudflare Pages auto-deploys on push to `main`.

## Design system (CSS variables)

All defined at the top of `assets/styles.css`. Use these — never
hardcode a color or font:

| Variable            | Role                                                | Value       |
|---------------------|-----------------------------------------------------|-------------|
| `--serif`           | Hero + section headings                             | Playfair Display, Georgia, serif |
| `--sans`            | Body copy, nav, buttons                             | Inter, system-ui, sans-serif |
| `--ink-deep`        | Darkest text — headings, dark backgrounds           | Deep near-black |
| `--ink-2`           | Body text (default paragraph color)                 | Dark gray |
| `--ink-3`           | Softer body — subheads, lede paragraphs             | Medium gray |
| `--muted`           | Metadata, captions, faint labels                    | Light gray |
| `--gold`            | Eyebrow labels, subtle accents                      | Warm gold |
| `--accent`          | Primary CTA color — buttons, key links              | Brand red |
| `--bg-cream`        | Section backgrounds (light cream)                   | Cream |
| `--bg-cream-deep`   | Gradient bottom of hero sections                    | Deeper cream |
| `--bg-soft`         | Alternating section background                      | Off-white |
| `--border`          | Card borders, hairline separators                   | Neutral gray |
| `--green`           | Success indicator (list checkmarks, positive stats) | Muted green |

## Nav (top)

Every page must have this exact header block, unchanged:

```html
<header class="topnav">
  <div class="topnav-inner">
    <a class="brand" href="/">
      <span class="mark">
        <!-- The 160x160 logo SVG — see any existing page for the full markup -->
      </span>
      <span class="wordmark">Real Product Origin<span class="period">.</span></span>
    </a>
    <nav>
      <a href="/products.html">Products</a>
      <a href="/why.html">Why It Matters</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/support.html">Support</a>
      <a id="nav-account-link" href="/subscribe/signin.html">Sign in</a>
      <a class="nav-cta" href="/#install">Install</a>
    </nav>
  </div>
</header>
```

**Do NOT reorder nav links.** The mobile CSS media query hides
`nav a:nth-child(3)` and `nav a:nth-child(4)` at ≤ 720px viewport;
those slots are load-bearing.

## Footer

Every page must have this exact footer block, unchanged. Update via a
find-and-replace across all pages if a link needs changing. See any
existing page (e.g. `products.html`) for the full markup — it's a
4-column grid: brand-block / Product / Company / Legal.

## Section patterns

- **`.p-hero`** — first section of the page, cream gradient background,
  contains eyebrow + h1 + lede paragraph. Copy this pattern from any
  existing page (e.g. `products.html`) rather than reinventing.
- **`.p-section`** — subsequent content sections. Even-numbered
  sections get `--bg-soft` automatically via `:nth-of-type(even)`.
- **`.wrap`** — content-width container (max ~960px)
- **`.wrap-wide`** — wider content (max ~1160px), for grids and cards

## Typography rules

- **Serif** (`--serif`) for h1 and h2 hero headings, always with
  `letter-spacing: -0.02em` and `font-weight: 700`. Use `clamp()` for
  responsive sizing:
  ```css
  font-size: clamp(30px, 4vw, 44px);
  ```
- **Sans-serif** (`--sans`) for everything else — body, buttons, nav,
  captions, form controls.
- **Eyebrow labels** — small ALL-CAPS gold text above hero h1:
  ```css
  font-family: var(--sans);
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold);
  ```

## Voice

The site's tone is deliberate. Read a few existing pages before
writing. Key rules:

- **Dry, factual, no marketing hype.** Never "unlock", "boost",
  "supercharge", "delight", "seamless", "empower", "revolutionize".
- **No exclamation points.** Anywhere. Ever.
- **No trailing rhetorical questions** ("Why not try it today?", etc.)
- **Say the boring true thing.** Not "instant scoring" — "answers in
  a few seconds". Not "100% accurate" — "confidence bands that admit
  what we don't know".
- **Contractions are OK** ("you're", "we're", "don't"). Casual but not
  cutesy.
- **Numbers are more honest than adjectives.** Prefer "12 retailers"
  over "many retailers"; "$4.99/mo" over "affordable".

## Voice — AI messaging

The tool is Claude AI + cited public sources. Both matter equally.
When naming AI:

- **"AI-powered" is OK in kickers, headlines, and category signals.**
  It's the phrase shoppers actually recognize and search for. Fine to
  use where the audience needs to know at a glance that this is an
  AI-based tool (hero kicker, ad copy, meta descriptions).
- **In prose, prefer specific verbs.** Say what the AI does — "reads
  the product page", "cross-checks trademark filings", "weighs
  evidence" — rather than "AI-powered scoring" as a stand-alone
  phrase. Specific verbs earn trust; the label alone sounds like
  marketing.
- **Name the model by name.** Say "Claude" or "Claude (Anthropic's
  frontier model)". Not "our proprietary AI", not just "AI" when
  space allows the specific name.
- **Always pair AI mention with sources.** AI alone = magic. Sources
  alone = tedious. Both together = "we did the work." Rule of thumb:
  if a paragraph mentions the AI, it should also mention at least one
  concrete source category (trademark filings, customs records,
  corporate registries, seller storefronts, etc.).

## Retailer list — short-form in prose, categorized grid on landing pages

**As of the 25-retailer batch (2026-07-27), we've moved away from
listing every retailer inline.** With 25 supported sites, spelled-out
prose lists became unreadable. Two rules now:

**In prose / running text / SEO descriptions:**
Use the short form: **"Amazon, Target, Walmart, and 22 other major
retailers"** — headline the three biggest names, then acknowledge the
count. If the audience needs specificity (privacy policy, terms), link
to the products page's categorized grid instead of listing all 25.

**On landing pages (home, products, support, pricing):**
Use the categorized grid — 6 groups:
1. **General merchants** — Amazon, Target, Walmart, Costco, Best Buy
2. **Home & Garden** — Home Depot, Lowe's, Wayfair, Crate & Barrel,
   Williams-Sonoma, Pottery Barn, West Elm, Ace Hardware, Build.com
3. **Apparel & Style** — Macy's, Nordstrom, Anthropologie, Free People
4. **Beauty** — Sephora, Ulta Beauty
5. **Outdoor & Sports** — REI, Patagonia, Backcountry, Sierra,
   Bass Pro Shops, Cabela's
6. **Auto & Rural** — Tractor Supply, AutoZone, RockAuto

25 scrapers covering 29 domains total. Sister-brand groups
(Williams-Sonoma trio, Bass Pro pair, URBN pair) share code
under the hood.

**The exact-order rule (kept for consistency in the short form):**
When mentioning the three biggest names, always order **Amazon,
Target, Walmart** — matches what shoppers recognize by market share
and matches the manifest.json declaration order.

## Pages that already exist

Don't duplicate content. If your topic overlaps with an existing page,
extend that page rather than creating a new one.

- `index.html` — landing page (hero + install CTA + 5 short sections)
- `products.html` — the 2 products (extension + mobile), what they
  answer, retailer support grid, methodology
- `why.html` — long-form essay: why product origin matters, cited
- `pricing.html` — 4 tiers, feature matrix, supported retailers callout
- `support.html` — install / usage / troubleshooting / contact
- `about.html` — team + provenance
- `contact.html` — contact form
- `lookup.html` — paste-a-URL scoring for extension-less users
- `refunds.html`, `privacy.html`, `terms.html` — legal (edit only when
  legal counsel signs off)
- `404.html` — the 404 page
- `subscribe/*.html` — auth-related pages (see next section)
- `MARKETING_STYLE.md` — this file
- `README.md`

## What NOT to touch

These files are load-bearing. Ask before editing:

- `subscribe/signin.html`, `subscribe/success.html`,
  `subscribe/account.html` — auth flow, wired to backend + extension.
  Touching them can break sign-in for real users.
- `_redirects` — Cloudflare Pages redirect + 404 rules. Wrong syntax
  here silently breaks SEO.
- `sitemap.xml`, `robots.txt` — search-engine facing. Add new pages
  when they ship; don't remove.
- `assets/styles.css` — shared across all pages. A stray edit here
  can cascade site-wide. If you need a page-specific style, inline it
  in the page's `<style>` block, not here.

## When you make a change

- Test in a real browser at 375px, 720px, and 1200px viewport widths.
  Use `python3 -m http.server` to serve locally (`.claude/launch.json`
  sets this up).
- Update `sitemap.xml` when you add a new page.
- Update the nav link order in every page's `<header>` if adding a
  new nav entry (all 12 pages need to match; positional CSS depends on
  order).
- Commit + push to `main`. Cloudflare Pages will deploy in ~1 minute.

## Coordinating with other threads

If a Claude Code session or Bro thread is also editing the marketing
repo:

- Announce which page you're working on in the shared thread before
  starting.
- Pull latest before starting a session (`git pull`).
- Small commits are cheap. Push often. Merge conflicts on static HTML
  are almost always trivial to resolve.
