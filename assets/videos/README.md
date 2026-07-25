# Support-page videos — recording specs

Drop finished video files into this directory using the exact filenames below.
Then, in `support.html`, replace the `<div class="video-placeholder">…</div>`
block inside each matching `.video-frame` with:

```html
<video src="/assets/videos/FILENAME.mp4"
       controls muted playsinline preload="metadata"
       poster="/assets/videos/FILENAME-poster.jpg"></video>
```

If you also generate a poster image (a single JPEG frame ~1280px on long
edge), it shows before the visitor hits play — much friendlier than a black
frame. Poster is optional; without it the placeholder just shows a black
first frame.

## Format targets

- **Vertical (9:16)** — mobile-app how-tos. Record phone-native.
  Suggested 1080 × 1920. Keep under 8 MB per file — H.264 MP4, ~2 Mbps.
- **Horizontal (16:9)** — desktop extension how-tos. Screen-recorded via
  QuickTime or OBS. Suggested 1920 × 1080. Under 10 MB per file.
- **Square (1:1)** — used for the "how to contest" flow that could be
  either extension or app. Suggested 1080 × 1080.

Trim to the target duration listed — the videos are meant to be watched all
the way through. If you go long, keep it under 40s absolute max.

Every video should have **no audio track** (or a muted audio track) — the
page auto-plays them muted per browser policy and the value is in seeing
the flow, not hearing narration. If you want narration, record it separately
and add subtitles later.

## The 12 files

### Install (§1)

| Filename | Format | Duration | What to show |
|---|---|---|---|
| `install-chrome.mp4` | 16:9 | ~25s | Land on Chrome Web Store listing → click "Add to Chrome" → approve permission dialog → click puzzle icon in toolbar → pin the extension → open an Amazon product page → badge appears in top-right. |
| `install-ios.mp4` | 9:16 | ~15s | Search "Product Origin Checker" in App Store → tap Get / Install → open the app → land on empty-state home screen. |
| `install-android.mp4` | 9:16 | ~15s | Search "Product Origin Checker" in Play Store → tap Install → open the app → land on empty-state home screen. |

### Score a product (§2)

| Filename | Format | Duration | What to show |
|---|---|---|---|
| `extension-in-action.mp4` | 16:9 | ~25s | Navigate to an Amazon product page (pick one with clear China exposure so the score is interesting) → badge fades in top-right → click badge → expanded card slides open showing four rows with country flags and confidence percentages. |
| `extension-popup.mp4` | 16:9 | ~30s | Click the extension icon in Chrome toolbar → popup opens → walk through: current-page score, "How was this scored?" methodology link, Contest button, Recent history list. |
| `mobile-share.mp4` | 9:16 | ~20s | Amazon app open on a product page → tap Share icon → share sheet → tap "Product Origin Checker" → our app launches → loading spinner → score card appears with four rows. |
| `mobile-barcode.mp4` | 9:16 | ~20s | Home screen of app → tap "Scan barcode" → camera view → point at a product barcode (grocery item works well) → detection line highlights barcode → screen transitions to score card. |
| `mobile-photo.mp4` | 9:16 | ~20s | Home screen → tap "Snap product" → camera view → frame a product (something without a scannable barcode, like a bag of dry goods with only branding) → tap shutter → "Identifying…" spinner → score card. |
| `mobile-paste.mp4` | 9:16 | ~15s | Copy a product URL from Messages or another app → open our app → paste into the URL field at top of home screen → tap Enter → score card appears. |
| `mobile-search-bookmarks.mp4` | 9:16 | ~20s | Home screen with a few past scans visible → tap search field → type "brand name" → list filters in real time → long-press one row → star icon appears → tap the ⭐ chip in the top filter row → list filters down to only bookmarked items. |

### Report an issue (§4)

| Filename | Format | Duration | What to show |
|---|---|---|---|
| `contest-a-score.mp4` | 1:1 or 16:9 | ~25s | Extension popup open on a product with a wrong score → click "Contest" → contest form appears → select which indicator is wrong → type the correction → paste a source URL → hit Submit → success toast. |

## Naming rule

Use lowercase, kebab-case, `.mp4`. If you add more videos later, keep the
same convention so batch commands are easy.

## Optional: poster frames

For each `foo.mp4` you can add `foo-poster.jpg`. Simplest way to make one:

```
ffmpeg -ss 2 -i foo.mp4 -vframes 1 -q:v 3 foo-poster.jpg
```

That grabs frame at 2s in as a nice static preview. Wire it up via the
`poster="…"` attribute on the `<video>` tag.
