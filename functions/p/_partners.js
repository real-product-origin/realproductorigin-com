// Partner landing-page copy, one entry per creator (GTM §7.2).
//
// A visitor arriving from a sponsor read should recognise where they came
// from — the creator's own framing, the indicator that creator led with,
// and a demo product their audience would plausibly buy. Familiarity is
// the point: the page should feel like a continuation of the video, not a
// generic site they were dumped on.
//
// WHAT MUST NOT VARY (GTM §7.2): the offer. Everyone gets the same 20 free
// checks and no card. We deliberately run no per-creator discount codes,
// so nothing here may imply a special deal — only a different framing of
// the same product. `lead` picks which of the four questions to foreground,
// which is a messaging choice, never a functional one.
//
// `accent` is a CSS colour used for one rule only. No creator logos or
// photographs: we have no licence to host them, and the site's standing
// rule is no third-party imagery.
//
// Adding a partner = one entry here. Slugs are permanent once printed in a
// video description — a video is not editable after the fact, so never
// rename or delete a slug, even after a partnership ends.

export const PARTNERS = {
  creditshifu: {
    name: "The Credit Shifu",
    host: "Ben",
    // §6A.2a — pitch the seller-of-record angle, NOT origin patriotism.
    // Credit-card and travel-rewards audiences care about purchase
    // protection, chargebacks, returns and warranty claims, all of which
    // turn on who the legal seller of record actually is.
    hook: "You optimised the card. Do you know who you’re actually buying from?",
    blurb:
      "Purchase protection, chargebacks, returns and warranty claims all depend on who the legal seller of record is — and on a marketplace listing that’s often not the brand. This tells you, on the page, before you buy.",
    lead: "Retailer",
    second: "Ships from",
    demo: "a suitcase, a camera, a travel accessory",
    accent: "#0284c7",
  },

  projectfarm: {
    name: "Project Farm",
    hook: "Marketing claims, tested. Origin claims, checked.",
    blurb:
      "You already distrust what a listing says about a product. This checks the part the listing doesn’t say at all — who made it, who’s selling it, and which company actually collects the money — and cites a source for each.",
    lead: "Made in",
    second: "Money goes to",
    demo: "a cordless drill, a socket set, a work light",
    accent: "#b45309",
  },

  torquetest: {
    name: "Torque Test Channel",
    hook: "The spec sheet doesn’t say where it was made. This does.",
    blurb:
      "Brand-parent ownership decides who honours the warranty and who actually built the tool. We trace it through trademark filings and corporate registries, and cite every source.",
    lead: "Made in",
    second: "Money goes to",
    demo: "a cordless drill, an impact wrench",
    accent: "#b45309",
  },

  freakinreviews: {
    name: "Freakin’ Reviews",
    hook: "The listing is the ad. This is the paperwork.",
    blurb:
      "Four things a product listing leaves out: where it was made, where it ships from, who the seller of record is, and which country the brand’s parent company sits in. Every claim cites its source.",
    lead: "Retailer",
    second: "Made in",
    demo: "an As-Seen-On-TV gadget, a marketplace no-name",
    accent: "#7c3aed",
  },

  chinauncensored: {
    name: "China Uncensored",
    hook: "American storefront. American-sounding brand. Foreign parent company.",
    blurb:
      "We trace the seller of record through corporate filings and trademark registries to the parent company that actually collects the money. Colour follows a published State Department list, applied the same way to every country on it.",
    lead: "Money goes to",
    second: "Retailer",
    demo: "an electronics accessory, a household brand you assumed was local",
    accent: "#ea580c",
  },

  americauncovered: {
    name: "America Uncovered",
    hook: "Is that American brand actually American?",
    blurb:
      "An American storefront can still send every dollar abroad. We follow the money to the brand’s parent company and show our sources — including how confident we are, and when we can’t tell.",
    lead: "Money goes to",
    second: "Made in",
    demo: "a kitchen appliance, a tool brand, a clothing label",
    accent: "#ea580c",
  },
};

// Shown when a slug isn't in the table — a mistyped URL, or a partner whose
// entry hasn't landed yet. Still a working page rather than a 404, because
// the URL may already be printed in a video description that cannot be
// edited. No referral cookie is set in this case; see [slug].js.
export const FALLBACK = {
  name: null,
  hook: "Know what you’re really buying. And who you’re really paying.",
  blurb:
    "Four things a product listing leaves out: where it was made, where it ships from, who the seller of record is, and where the money goes. Every claim cites its source.",
  lead: "Made in",
  second: "Money goes to",
  demo: "anything you’re about to buy",
  accent: "#ea580c",
};
