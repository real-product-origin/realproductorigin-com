// Cloudflare Pages Function — POST /api/contact
//
// Handles the contact form on /contact.html. Replaces the previous
// mailto: submission (which fails silently on many devices) with a
// proper JSON POST that:
//   1. Validates every field on the server (client validation can be bypassed)
//   2. Verifies a Cloudflare Turnstile token to block bots
//   3. Sends the message to hello@realproductorigin.com via Resend
//   4. Fires an auto-reply to the submitter
//
// ── Environment variables (set in Cloudflare Pages dashboard → Settings → Environment variables) ──
//   RESEND_API_KEY       Resend API key (same one the backend uses)
//   TURNSTILE_SECRET     Cloudflare Turnstile secret key (server-side verification)
//   TURNSTILE_SITE_KEY   Cloudflare Turnstile site key (client-side widget; served via /api/config)
//
// ── Response shapes ──
//   200  { ok: true }                    Email sent + auto-reply attempted
//   400  { ok: false, error, code }      Validation failure (client should show `error`)
//   500  { ok: false, error, code }      Server misconfig or Resend outage
//
// Error `code` values are stable enough to be tested against:
//   bad_json, invalid_name, invalid_email, invalid_topic,
//   invalid_message, missing_turnstile, turnstile_failed,
//   server_config, email_send_failed

const ALLOWED_TOPICS = new Set([
  "general", "beta-access", "retailer-request", "dispute",
  "billing", "privacy", "press", "complaint", "bug", "other",
]);

// Human-readable labels used in the notification email subject line and body.
// Keep the keys in sync with the <select> options in contact.html.
const TOPIC_LABELS = {
  "general": "General inquiry",
  "beta-access": "Chrome private-beta access",
  "retailer-request": "Retailer request",
  "dispute": "Disputing a score",
  "billing": "Billing / refund",
  "privacy": "Privacy / data",
  "press": "Press",
  "complaint": "Complaint",
  "bug": "Bug report",
  "other": "Other",
};

// Deliberately loose — RFC 5322 is a rabbit hole and this pattern catches
// the ~99% case (has an @, has a dot after it, no whitespace). Resend will
// do its own address validation before send, so a wrong-but-plausible
// address here just means we bounce.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (_e) {
    return json({ ok: false, error: "Invalid JSON body.", code: "bad_json" }, 400);
  }

  const { name, email, topic, message, turnstileToken } = body || {};

  // ── Validation ────────────────────────────────────────────────────
  const nameStr = typeof name === "string" ? name.trim() : "";
  if (nameStr.length < 1 || nameStr.length > 100) {
    return json({ ok: false, error: "Name must be 1–100 characters.", code: "invalid_name" }, 400);
  }
  const emailStr = typeof email === "string" ? email.trim() : "";
  if (!EMAIL_RE.test(emailStr) || emailStr.length > 254) {
    return json({ ok: false, error: "Please enter a valid email address.", code: "invalid_email" }, 400);
  }
  if (typeof topic !== "string" || !ALLOWED_TOPICS.has(topic)) {
    return json({ ok: false, error: "Please choose a valid topic.", code: "invalid_topic" }, 400);
  }
  const messageStr = typeof message === "string" ? message.trim() : "";
  if (messageStr.length < 10 || messageStr.length > 5000) {
    return json({ ok: false, error: "Message must be 10–5000 characters.", code: "invalid_message" }, 400);
  }
  if (typeof turnstileToken !== "string" || turnstileToken.length < 1) {
    return json({ ok: false, error: "Please complete the security check.", code: "missing_turnstile" }, 400);
  }

  // ── Turnstile verification ────────────────────────────────────────
  if (!env.TURNSTILE_SECRET) {
    return json({ ok: false, error: "Server misconfigured (Turnstile).", code: "server_config" }, 500);
  }
  const ip = request.headers.get("CF-Connecting-IP") || undefined;
  const turnstileOk = await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, ip);
  if (!turnstileOk) {
    return json({ ok: false, error: "Security check failed. Please refresh the page and try again.", code: "turnstile_failed" }, 400);
  }

  // ── Send emails via Resend ────────────────────────────────────────
  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "Server misconfigured (email).", code: "server_config" }, 500);
  }

  const topicLabel = TOPIC_LABELS[topic] || topic;
  const timestamp = new Date().toISOString();

  // 1) Notification to hello@ — this is the load-bearing send. If it fails,
  //    the user's message is lost, so return 500 and ask them to retry.
  const notifyText = [
    `From:     ${nameStr} <${emailStr}>`,
    `Topic:    ${topicLabel}`,
    `When:     ${timestamp}`,
    ``,
    messageStr,
    ``,
    `---`,
    `Received via https://realproductorigin.com/contact`,
    ip ? `Submitter IP: ${ip}` : `Submitter IP: (not available)`,
  ].join("\n");

  const notifyResult = await sendResendEmail(env.RESEND_API_KEY, {
    from: "Real Product Origin <noreply@realproductorigin.com>",
    to: "hello@realproductorigin.com",
    reply_to: emailStr,
    subject: `[Contact] ${topicLabel} — ${nameStr}`,
    text: notifyText,
  });

  if (!notifyResult.ok) {
    console.error("Resend notification send failed:", notifyResult.error);
    return json({
      ok: false,
      error: "Could not send your message right now. Please try again in a moment.",
      code: "email_send_failed",
    }, 500);
  }

  // 2) Auto-reply to the submitter. If this fails we DON'T fail the whole
  //    request — the internal notification already went through, so the
  //    user's message is safely on our side. Log and move on.
  const autoReplyText = [
    `Thanks for reaching out. We reply within two business days.`,
    ``,
    `— Real Product Origin`,
  ].join("\n");

  const autoResult = await sendResendEmail(env.RESEND_API_KEY, {
    from: "Real Product Origin <hello@realproductorigin.com>",
    to: emailStr,
    subject: "We got your message",
    text: autoReplyText,
  });
  if (!autoResult.ok) {
    console.warn("Resend auto-reply failed for", emailStr, ":", autoResult.error);
  }

  return json({ ok: true }, 200);
}

// Reject non-POST methods with a 405 rather than falling through to CF's
// generic 404. Useful during development when curl-ing the endpoint.
export async function onRequest(context) {
  const { request } = context;
  if (request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "Method not allowed.", code: "method_not_allowed" }, 405);
}

// ── helpers ──────────────────────────────────────────────────────────

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function verifyTurnstile(secret, token, ip) {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    if (!resp.ok) {
      console.warn("Turnstile siteverify non-2xx:", resp.status);
      return false;
    }
    const data = await resp.json();
    return !!data.success;
  } catch (e) {
    console.warn("Turnstile siteverify network error:", e && e.message);
    return false;
  }
}

async function sendResendEmail(apiKey, { from, to, reply_to, subject, text }) {
  const body = { from, to: [to], subject, text };
  if (reply_to) body.reply_to = reply_to;
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      let errBody = "";
      try { errBody = await resp.text(); } catch (_) {}
      return { ok: false, error: `Resend HTTP ${resp.status}: ${errBody.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Resend fetch failed: ${e && e.message}` };
  }
}
