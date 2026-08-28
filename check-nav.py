#!/usr/bin/env python3
"""Every page's top nav offers the same destinations.

Run:  python3 check-nav.py

There is no build step here and no test runner, so a nav is only as correct
as the last person who remembered to edit fifty files. Twice in two days
that failed quietly:

  · `subscribe/` had never carried Support at all. Signing in and clicking
    My Account made a menu item disappear, which reads as a broken page
    rather than as three files nobody updated together.
  · The mobile rules were `nav a:nth-child(3)` and `(4)`, with comments
    naming links that had left the nav long ago. What they were actually
    hiding by then was Pricing. That one is fixed by class rather than by
    this script, but it has the same cause: nav state nobody could see.

So this asserts the SHAPE, not the markup: after normalising a locale
prefix, every page must offer the same ordered list of destinations.
Localised labels are fine and expected; a missing destination is not.
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
LOCALES = ("de", "es", "fr", "ja", "zh-Hans", "zh-Hant")

NAV_RE = re.compile(r"<nav>(.*?)</nav>", re.S)
LINK_RE = re.compile(r'<a[^>]*href="([^"]+)"[^>]*>')


def normalise(href: str) -> str:
    """Collapse the differences that are legitimate.

    A locale page links to its own translation of products and pricing, and
    an index page anchors to `#install` on itself where every other page has
    to say `/#install`. Neither is drift.
    """
    for loc in LOCALES:
        if href.startswith(f"/{loc}/"):
            href = "/" + href[len(loc) + 2:]
    if href == "#install":
        href = "/#install"
    return href


def nav_of(path: Path) -> list[str] | None:
    m = NAV_RE.search(path.read_text(encoding="utf-8"))
    if not m:
        return None
    return [normalise(h) for h in LINK_RE.findall(m.group(1))]


def main() -> int:
    navs: dict[str, list[str]] = {}
    for p in sorted(ROOT.rglob("*.html")):
        n = nav_of(p)
        if n is not None:
            navs[str(p.relative_to(ROOT))] = n

    if not navs:
        print("check-nav: found no page with a <nav> — did the markup change?")
        return 1

    shapes = Counter(tuple(v) for v in navs.values())
    expected, count = shapes.most_common(1)[0]

    odd = {f: v for f, v in navs.items() if tuple(v) != expected}
    if not odd:
        print(f"check-nav: OK — {len(navs)} pages, one nav shape")
        print("           " + " | ".join(expected))
        return 0

    print(f"check-nav: FAIL — {len(odd)} page(s) differ from the other {count}\n")
    print("  expected: " + " | ".join(expected))
    for f, v in sorted(odd.items()):
        missing = [x for x in expected if x not in v]
        extra = [x for x in v if x not in expected]
        detail = []
        if missing:
            detail.append("missing " + ", ".join(missing))
        if extra:
            detail.append("extra " + ", ".join(extra))
        if not detail:
            detail.append("same links, different order")
        print(f"  {f}: {'; '.join(detail)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
