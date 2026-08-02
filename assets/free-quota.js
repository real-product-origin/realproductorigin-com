// Keep the published free-check number in sync with the number the product
// actually enforces.
//
// The free cap is an operational lever — an admin changes it on
// /admin/pricing without a deploy (free_tier_config.quota_per_month, which
// overrides free.checks.limit in plans.json). Every marketing page used to
// hard-code it, so changing the cap silently turned ~50 sentences across 7
// locales into false advertising. This is the fix for that class of drift:
// the sentence stays static and translated, but the NUMBER comes from the
// same source that enforces it.
//
// Usage — wrap only the digits, never the surrounding words:
//   <span data-rpo-free-quota>20</span> checks
// The static text inside is the fallback, so the page reads correctly with
// JS off, on a failed fetch, or before this script runs. That fallback is
// why this script only ever *replaces* a number and never writes one into
// an empty element.
//
// Deliberately NOT handled here: the period wording ("one time, not
// monthly" vs "per month"). That is translated prose, it lives in seven
// locales, and a JS string table would be a second place for it to drift.
// If the free tier ever becomes genuinely monthly, the copy needs a human
// pass in every locale anyway — see the `period` field on /pricing.
(function () {
  "use strict";

  var NODES = document.querySelectorAll("[data-rpo-free-quota]");
  if (!NODES.length) return;

  // Same endpoint the pricing page already calls; it sets a 60s
  // Cache-Control, so a visitor loading two pages pays for one request.
  fetch("https://api.realproductorigin.com/pricing")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var checks = data && data.free && data.free.checks;
      var limit = checks && checks.limit;
      // Guard hard. A null/0/undefined limit means "unlimited" or "we
      // don't know" — writing either into "your first N checks are free"
      // produces a worse sentence than the static fallback.
      if (typeof limit !== "number" || limit <= 0) return;

      var text = String(limit);
      for (var i = 0; i < NODES.length; i++) {
        if (NODES[i].textContent.trim() !== text) NODES[i].textContent = text;
      }
    })
    .catch(function () {
      // Offline, blocked, or API down — the static number stands. Never
      // blank the element or show a spinner: a missing number in the
      // middle of a sentence reads as a broken page.
    });
})();
