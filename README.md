# realproductorigin.com

Marketing site for **Real Product Origin**. Static HTML/CSS — no build step. Deployed to Cloudflare Pages.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `methodology.html` | Plain-English methodology explainer |
| `privacy.html` | Privacy Policy *(draft — needs lawyer review)* |
| `terms.html` | Terms of Service *(draft — needs lawyer review)* |
| `contact.html` | Contact + about |
| `assets/styles.css` | Shared CSS for all pages |
| `assets/logo-*.svg` + `favicon*` | Brand assets |

## Deploy

Cloudflare Pages auto-deploys this repo on every push to `main`.

- **Production URL:** https://realproductorigin.com
- **Cloudflare Pages preview:** auto-generated URL per branch

## Local preview

```bash
cd ~/projects/realproductorigin-com
python3 -m http.server 4321
# open http://localhost:4321
```

## Brand

A product by **Real Product Origin**.

Mark: tilted map fragment + dashed shipping route + pin pressed in at the destination. Three story-elements composed into one mark.

Wordmark: "Real Product Origin." in Inter 800 with the period rendered as a small accent-red dot that echoes the pin's center — gives the brand a subtle "stamped" / "signed" quality.

Tagline (short, inline): *Know what you're buying.*
Tagline (long, marketing hero): *Know what you're getting, and who you're paying.*

## Related repos

- **Application code** (backend, extension, mobile): https://github.com/real-product-origin/origin-app
