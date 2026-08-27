/* Shared sign-in plumbing for the pages that need an account.
 *
 * subscribe/account.html grew its own getToken / clearToken / goSignIn, and
 * two more pages copying them is how three implementations of "are you signed
 * in" end up disagreeing after somebody fixes one. This is that code, once.
 *
 * The token is the same `rpo_session_token` the account page has always used,
 * so a person already signed in there is already signed in here — there is no
 * second session and no second sign-in.
 */
(function () {
  "use strict";

  var API = "https://api.realproductorigin.com";

  /* Accepts a token arriving by URL (the magic-link return), persists it, and
   * strips it from the address bar so it does not linger in history or in a
   * referer header on the way to some other site. */
  function getToken() {
    try {
      var p = new URLSearchParams(location.search);
      var fromUrl = p.get("session_token");
      if (fromUrl) {
        try { localStorage.setItem("rpo_session_token", fromUrl); } catch (_) {}
        history.replaceState({}, "", location.origin + location.pathname + location.hash);
        return fromUrl;
      }
      return localStorage.getItem("rpo_session_token");
    } catch (_) {
      return null;
    }
  }

  function clearToken() {
    try { localStorage.removeItem("rpo_session_token"); } catch (_) {}
  }

  function goSignIn(returnTo) {
    location.href = "/subscribe/signin.html?return_to="
      + encodeURIComponent(returnTo || location.pathname);
  }

  /* A fetch that carries the session and treats 401 as "your session ended"
   * rather than as an error the page has to invent copy for. Returns null in
   * that case, having already cleared the dead token. */
  async function authedFetch(path, opts) {
    var token = getToken();
    var o = opts || {};
    o.headers = Object.assign({}, o.headers || {},
      token ? { Authorization: "Bearer " + token } : {});
    var r = await fetch(API + path, o);
    if (r.status === 401) {
      clearToken();
      return null;
    }
    return r;
  }

  /* Anonymous callers are first-class on the brand lookup — the free tier has
   * never required an account — so this identifies the browser the same way
   * the extension does, and the two share one allowance when the person later
   * signs in. */
  function installId() {
    try {
      var id = localStorage.getItem("rpo_install_id");
      if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID()
          : "w-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
        localStorage.setItem("rpo_install_id", id);
      }
      return id;
    } catch (_) {
      return null;
    }
  }

  window.RPOAuth = {
    API: API,
    getToken: getToken,
    clearToken: clearToken,
    goSignIn: goSignIn,
    authedFetch: authedFetch,
    installId: installId,
    isSignedIn: function () { return !!getToken(); },
  };
})();
