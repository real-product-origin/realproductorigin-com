/* "Keep a history of what I check" — one implementation, three pages.
 *
 * It belongs on /history.html (where you read it), on /brands.html (where
 * you make the entries), and on the account page (where you'd go looking
 * for a setting). Three inline copies is how the extension ended up with a
 * version that quietly reset a different setting; see below.
 *
 * Usage — mark up a checkbox and a status line, then:
 *
 *     RPOHistoryToggle.attach({
 *       checkbox: document.getElementById("hist-enabled"),
 *       status:   document.getElementById("hist-status"),   // optional
 *       onChange: function (enabled) { ... },               // optional
 *     });
 *
 * Requires account-guard.js (RPOAuth) to have loaded first.
 */
(function () {
  "use strict";

  var instances = [];

  /* PATCH /account/settings REQUIRES auto_check_preference, and null there
   * means "reset to the plan default" — a real operation, not an omission.
   * Every copy of this code so far has sent a bare null, so switching your
   * history on silently reset whether the extension scores automatically.
   * We read the stored value and hand it straight back. */
  async function currentAutoCheck() {
    try {
      var r = await RPOAuth.authedFetch("/account/quota");
      if (!r || !r.ok) return null;
      var d = await r.json();
      return typeof d.auto_check_preference === "boolean"
        ? d.auto_check_preference : null;
    } catch (_) {
      return null;
    }
  }

  function paint(inst, enabled, reachable) {
    inst.checkbox.checked = !!enabled;
    inst.checkbox.disabled = !reachable;
    if (!inst.status) return;
    if (!reachable) {
      inst.status.textContent = "";
    } else {
      inst.status.textContent = enabled
        ? "On — we're keeping a list for you."
        : "Off — we're keeping no record of what you check.";
    }
  }

  /* Repaint every toggle on the page, not just the one that changed. A page
   * can legitimately show this in two places (the brand tool and a settings
   * block), and two checkboxes disagreeing about the same account is worse
   * than showing it once. */
  function paintAll(enabled, reachable) {
    instances.forEach(function (i) { paint(i, enabled, reachable); });
  }

  async function refresh() {
    if (!instances.length) return;
    try {
      var r = await RPOAuth.authedFetch("/account/history?limit=1");
      if (!r || !r.ok) { paintAll(false, false); return null; }
      var d = await r.json();
      paintAll(!!d.enabled, true);
      return d;
    } catch (_) {
      paintAll(false, false);
      return null;
    }
  }

  async function set(enabled) {
    var pref = await currentAutoCheck();
    var r = await RPOAuth.authedFetch("/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auto_check_preference: pref,
        save_history: !!enabled,
      }),
    });
    return !!(r && r.ok);
  }

  function attach(opts) {
    if (!opts || !opts.checkbox) return;
    var inst = {
      checkbox: opts.checkbox,
      status: opts.status || null,
      onChange: opts.onChange || null,
    };
    instances.push(inst);

    inst.checkbox.addEventListener("change", async function () {
      var on = inst.checkbox.checked;
      /* Off used to DELETE, which meant a stray click destroyed a list
       * built up over months. It no longer does — off stops recording and
       * nothing else — so there is nothing here to confirm. Deleting is a
       * separate, deliberate act on /history.html. */
      var ok = await set(on);
      if (!ok) {
        inst.checkbox.checked = !on;
        return;
      }
      var d = await refresh();
      instances.forEach(function (i) {
        if (i.onChange) i.onChange(!!(d && d.enabled), d);
      });
    });

    refresh();
  }

  window.RPOHistoryToggle = {
    attach: attach,
    refresh: refresh,
    set: set,
  };
})();
