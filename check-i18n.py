#!/usr/bin/env python3
"""Every page that IS translated stays translated, in all six locales.

Run:  python3 check-i18n.py

Levi, 2026-08-27: translation should be standard procedure for every change,
across every thread. This is the part of that a script can enforce.

It deliberately does NOT demand that all nineteen English pages exist in six
languages. Fourteen of them never have — see ENGLISH_ONLY — and a check that
fails on day one gets ignored by day two. What it enforces is the thing that
actually goes wrong: a page that HAS translations quietly losing one, or a
translated page drifting so far from the English that a section only exists
in one language.

So it reports three things:

  · a translated page missing from a locale               → FAIL
  · a page moving out of ENGLISH_ONLY without translations → FAIL
  · how far each translation has drifted in size           → warn

The size warning is a smell, not a rule: a section added to the English page
and not the others shows up as a widening gap long before anyone reads both.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
LOCALES = ("de", "es", "fr", "ja", "zh-Hans", "zh-Hant")

# Pages that have never been translated. Shrinking this list is the work;
# a page leaving it without six translations is a failure.
ENGLISH_ONLY = {
    "404.html", "about.html", "brands.html", "contact-form.html",
    "contact.html", "corrections.html", "history.html",
    "medicine-methodology.html", "privacy.html", "refunds.html",
    "shop.html", "support.html", "terms.html", "why.html",
}

# How far a page may sit from its OWN language's usual ratio before it looks
# like a missing section. Compared per locale, not against English: Chinese
# runs ~41% of the English character count and Japanese ~55% for the same
# meaning, so a flat threshold flagged every CJK page and told us nothing.
DRIFT_WARN = 0.25


def text_size(p: Path) -> int:
    """Roughly how much COPY a page carries — markup and script stripped, so
    a big inline <script> does not read as a lot of prose."""
    s = p.read_text(encoding="utf-8")
    s = re.sub(r"<script.*?</script>", "", s, flags=re.S)
    s = re.sub(r"<style.*?</style>", "", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return len(re.sub(r"\s+", " ", s))


def median(xs: list[float]) -> float:
    xs = sorted(xs)
    n = len(xs)
    if not n:
        return 0.0
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def main() -> int:
    english = sorted(p.name for p in ROOT.glob("*.html"))
    translated = [n for n in english if n not in ENGLISH_ONLY]
    failures: list[str] = []
    warnings: list[str] = []

    # ratios[locale][page] = translated size / English size
    ratios: dict[str, dict[str, float]] = {loc: {} for loc in LOCALES}

    for name in translated:
        en_size = text_size(ROOT / name)
        for loc in LOCALES:
            target = ROOT / loc / name
            if not target.exists():
                failures.append(
                    f"{loc}/{name} is missing — {name} is translated "
                    f"elsewhere, so this locale has lost it")
                continue
            if en_size:
                ratios[loc][name] = text_size(target) / en_size

    for loc in LOCALES:
        page_ratios = ratios[loc]
        if len(page_ratios) < 3:
            continue                      # too few pages to have a norm
        norm = median(list(page_ratios.values()))
        for name, r in sorted(page_ratios.items()):
            if norm and abs(r - norm) / norm > DRIFT_WARN:
                warnings.append(
                    f"{loc}/{name} is {r / norm:.0%} of this locale's usual "
                    f"length — a section may be missing, or extra")

    stale = sorted(n for n in ENGLISH_ONLY if not (ROOT / n).exists())
    if stale:
        warnings.append("ENGLISH_ONLY names pages that no longer exist: "
                        + ", ".join(stale))

    print(f"check-i18n: {len(translated)} translated page(s) x {len(LOCALES)} locales")
    print(f"            {len(ENGLISH_ONLY)} page(s) English-only by known gap")

    for w in warnings:
        print(f"  warn: {w}")
    for f in failures:
        print(f"  FAIL: {f}")

    if failures:
        print(f"\ncheck-i18n: FAILED — {len(failures)} problem(s)")
        return 1
    print("check-i18n: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
