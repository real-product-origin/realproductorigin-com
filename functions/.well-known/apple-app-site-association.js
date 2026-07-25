// Cloudflare Pages Function — GET /.well-known/apple-app-site-association
//
// Apple's Universal Links spec requires this exact path to be served with
// Content-Type: application/json (no .json extension in the URL) so a
// static file with content-type text/html won't work. This function
// returns the JSON with the correct Content-Type header.
//
// When a user taps an https://realproductorigin.com/… URL on iOS, the OS
// fetches this file, verifies the app's Team ID + bundle ID, and if it
// matches AND our app has `associatedDomains: ["applinks:realproductorigin.com"]`,
// the URL opens in the app instead of Safari.
//
// ── Environment variable required ──
//   APPLE_APP_ID   Format: "<TeamID>.<BundleID>", e.g. "ABCDE12345.com.realproductorigin.app"
//                  Team ID is a 10-char alphanumeric string from Apple Developer Portal
//                  → Membership tab. Only known after enrolling in the Apple
//                  Developer Program. Set in CF Pages dashboard → Settings →
//                  Environment variables → Production.
//
// If APPLE_APP_ID is not yet set, we return a valid-but-empty AASA that
// won't match any app — safe placeholder that stops iOS from caching a
// bad response. Set the env var and redeploy once you have your Team ID.
//
// Reference: https://developer.apple.com/documentation/xcode/supporting-associated-domains

export async function onRequestGet(context) {
  const { env } = context;
  const appId = env.APPLE_APP_ID; // e.g. "ABCDE12345.com.realproductorigin.app"

  const aasa = {
    applinks: {
      details: appId
        ? [
            {
              appIDs: [appId],
              components: [
                // Deep-link Amazon product URLs into the app
                { "/": "/dp/*", comment: "Amazon product page" },
                { "/": "/gp/product/*", comment: "Amazon product page (legacy)" },
                // Deep-link Target product URLs
                { "/": "/p/*/-/A-*", comment: "Target product page" },
                { "/": "/p/-/A-*", comment: "Target product page (bare slug)" },
                // Deep-link Walmart product URLs
                { "/": "/ip/*", comment: "Walmart product page" },
                // Marketing-site deep links (e.g., share a product from realproductorigin.com)
                { "/": "/scored/*", comment: "Real Product Origin scored page" },
              ],
            },
          ]
        : [],
    },
    // webcredentials block enables Password AutoFill / Sign in with Apple
    // for the domain. Kept empty until we ship a sign-in flow on the domain.
    webcredentials: { apps: appId ? [appId] : [] },
  };

  return new Response(JSON.stringify(aasa), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Cache aggressively at the edge — this file only changes when we
      // add/remove supported apps, which is rare. Apple's OS refetches
      // regularly regardless.
      "Cache-Control": "public, max-age=3600",
    },
  });
}
