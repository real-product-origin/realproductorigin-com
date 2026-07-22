// Cloudflare Pages Function — GET /api/config
//
// Returns non-secret client-side configuration values that need to come from
// env vars rather than being hardcoded. Right now: the Turnstile SITE key
// (public, but keeping it in env means one place to update if we rotate).
//
// Env vars used:
//   TURNSTILE_SITE_KEY — public Cloudflare Turnstile site key
//
// Response: 200 { turnstileSiteKey: string | null }
//   Returns null (rather than 500) if not configured, so the client can
//   render a helpful "contact form is temporarily unavailable" state rather
//   than a hard failure.

export async function onRequestGet(context) {
  const { env } = context;
  return new Response(
    JSON.stringify({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || null }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Small edge cache so we're not hitting env-var lookup on every
        // contact-page load. Site key changes are rare and 5 min is fine.
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
