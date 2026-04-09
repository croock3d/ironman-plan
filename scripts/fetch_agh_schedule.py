#!/usr/bin/env python3
"""
Fetches pool schedules:
  - basen.agh.edu.pl: weekly schedule image → assets/agh-schedule.jpg
  - przystannaeisenberga.pl: 2 newest PDF URLs → assets/eisenberga-schedule-meta.json

Usage: python3 scripts/fetch_agh_schedule.py
"""

import json
import os
import re
import sys
import urllib.request
from urllib.parse import urljoin
from datetime import datetime, timezone
from html.parser import HTMLParser


# ---- AGH ----
AGH_BASE_URL = "https://basen.agh.edu.pl"
AGH_SCHEDULE_URL = f"{AGH_BASE_URL}/plywalnia/rezerwacje"
AGH_OUTPUT_IMAGE = "assets/agh-schedule.webp"
AGH_OUTPUT_META = "assets/agh-schedule-meta.json"

# ---- Eisenberga ----
EISENBERGA_BASE_URL = "https://www.przystannaeisenberga.pl"
EISENBERGA_HARMONOGRAM_URL = f"{EISENBERGA_BASE_URL}/harmonogram/"
EISENBERGA_OUTPUT_META = "assets/eisenberga-schedule-meta.json"


# ============================================================
# Shared helpers
# ============================================================


def fetch_page(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; pool-schedule-fetcher/1.0)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def head_url(url):
    """Returns HTTP status code for a HEAD request."""
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "Mozilla/5.0 (compatible; pool-schedule-fetcher/1.0)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status
    except Exception:
        return 0


def load_json(path):
    if os.path.exists(path):
        try:
            with open(path) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_json(path, data):
    os.makedirs("assets", exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ============================================================
# AGH
# ============================================================


class AghScheduleParser(HTMLParser):
    """Parses the AGH pool page to find the schedule image URL and title.

    Priority order:
      1. <source data-variant="desktop"> srcset  (highest res WebP)
      2. <source data-variant="mobile">  srcset
      3. <source data-variant="tablet">  srcset
      4. <a rel="lightbox"> href         (fallback JPG)
    """

    VARIANT_PRIORITY = {"desktop": 0, "mobile": 1, "tablet": 2}

    def __init__(self):
        super().__init__()
        self._sources = {}  # variant → url
        self.lightbox_url = None
        self.title = None
        self._in_h2 = False
        self._h2_text = ""

    @property
    def image_url(self):
        # Return best available source
        for variant in ("desktop", "mobile", "tablet"):
            if variant in self._sources:
                return self._sources[variant]
        return self.lightbox_url

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        # <source data-variant="desktop" srcset="...webp 1x">
        if tag == "source":
            variant = attrs_dict.get("data-variant", "")
            srcset = attrs_dict.get("srcset", "")
            if (
                variant in self.VARIANT_PRIORITY
                and srcset
                and variant not in self._sources
            ):
                # srcset may be "url 1x" — take just the URL part
                url = srcset.split()[0]
                if url.startswith("/"):
                    url = AGH_BASE_URL + url
                self._sources[variant] = url

        # <a rel="lightbox" href="...jpg"> — fallback
        if tag == "a":
            rel = attrs_dict.get("rel", "")
            href = attrs_dict.get("href", "")
            lightbox_title = attrs_dict.get("data-lightbox-title", "")
            if "lightbox" in rel and href and not self.lightbox_url:
                self.lightbox_url = (
                    AGH_BASE_URL + href if href.startswith("/") else href
                )
                if lightbox_title and not self.title:
                    self.title = lightbox_title

        if tag == "h2":
            self._in_h2 = True
            self._h2_text = ""

    def handle_endtag(self, tag):
        if tag == "h2":
            if self._in_h2 and not self.title:
                text = self._h2_text.strip()
                if "grafik" in text.lower() or "harmonogram" in text.lower():
                    self.title = text
            self._in_h2 = False

    def handle_data(self, data):
        if self._in_h2:
            self._h2_text += data


def fetch_agh_schedule():
    print(f"\n=== AGH ===")
    print(f"Fetching: {AGH_SCHEDULE_URL}")
    try:
        html = fetch_page(AGH_SCHEDULE_URL)
    except Exception as e:
        print(f"ERROR: Could not fetch AGH page: {e}", file=sys.stderr)
        return False

    parser = AghScheduleParser()
    parser.feed(html)

    if not parser.image_url:
        print("ERROR: Could not find schedule image on AGH page", file=sys.stderr)
        return False

    print(f"Found image: {parser.image_url}")
    print(f"Title: {parser.title}")

    existing = load_json(AGH_OUTPUT_META)
    if existing.get("image_url") == parser.image_url and os.path.exists(
        AGH_OUTPUT_IMAGE
    ):
        print("Image URL unchanged, skipping download.")
        existing["fetched_at"] = datetime.now(timezone.utc).isoformat()
        save_json(AGH_OUTPUT_META, existing)
        print("Updated fetched_at.")
        return True

    print(f"Downloading image to {AGH_OUTPUT_IMAGE}...")
    try:
        req = urllib.request.Request(
            parser.image_url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; pool-schedule-fetcher/1.0)",
                "Referer": AGH_SCHEDULE_URL,
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        with open(AGH_OUTPUT_IMAGE, "wb") as f:
            f.write(data)
        print(f"Downloaded {len(data)} bytes")
    except Exception as e:
        print(f"ERROR: Could not download AGH image: {e}", file=sys.stderr)
        return False

    now = datetime.now(timezone.utc).isoformat()
    save_json(
        AGH_OUTPUT_META,
        {
            "title": parser.title or "Grafik pływalni",
            "image_url": parser.image_url,
            "fetched_at": now,
            "updated_at": now,
        },
    )
    print(f"Saved metadata to {AGH_OUTPUT_META}")
    return True


# ============================================================
# Eisenberga
# ============================================================


def parse_eisenberga_schedule_links(html):
    """
    Returns list of dicts with 'title' and absolute 'pdf_url',
    in the order they appear on the page (newest first).
    """
    # Match anchors with Harmonogram in href and in visible title text.
    pattern = re.compile(
        r'<a[^>]+href="([^"]*Harmonogram[^"]*)"[^>]*>\s*(Harmonogram_[^<]+?)\s*</a>',
        re.IGNORECASE,
    )
    results = []
    seen = set()
    for m in pattern.finditer(html):
        href = m.group(1).strip()
        title = m.group(2).strip()
        pdf_url = urljoin(EISENBERGA_HARMONOGRAM_URL, href)

        if pdf_url not in seen:
            seen.add(pdf_url)
            results.append({"title": title, "pdf_url": pdf_url})
    return results


def fetch_eisenberga_schedule():
    print(f"\n=== Eisenberga ===")
    print(f"Fetching: {EISENBERGA_HARMONOGRAM_URL}")
    try:
        html = fetch_page(EISENBERGA_HARMONOGRAM_URL)
    except Exception as e:
        print(f"ERROR: Could not fetch Eisenberga page: {e}", file=sys.stderr)
        return False

    links = parse_eisenberga_schedule_links(html)
    if not links:
        print("ERROR: No harmonogram links found on Eisenberga page", file=sys.stderr)
        return False

    print(f"Found {len(links)} harmonogram link(s): {[l['title'] for l in links]}")

    # Take 2 newest
    top2 = links[:2]
    schedules = []

    for item in top2:
        pdf_url = item["pdf_url"]
        local_path = f"assets/eisenberga-{len(schedules)}.pdf"
        print(f"  Downloading {item['title']} ({pdf_url}) → {local_path}...")
        try:
            req = urllib.request.Request(
                pdf_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; pool-schedule-fetcher/1.0)"
                },
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
            os.makedirs("assets", exist_ok=True)
            with open(local_path, "wb") as f:
                f.write(data)
            print(f"  Downloaded {len(data)} bytes → {local_path}")
        except Exception as e:
            print(f"  ERROR: Could not download PDF: {e}", file=sys.stderr)
            continue

        schedules.append(
            {
                "title": item["title"],
                "pdf_url": pdf_url,  # zewnętrzny URL (backup)
                "local_path": local_path,  # lokalny asset
            }
        )

    if not schedules:
        print("ERROR: Could not download any PDFs", file=sys.stderr)
        return False

    now = datetime.now(timezone.utc).isoformat()
    save_json(
        EISENBERGA_OUTPUT_META,
        {
            "schedules": schedules,
            "fetched_at": now,
        },
    )
    print(f"Saved {len(schedules)} schedule(s) to {EISENBERGA_OUTPUT_META}")
    return True


# ============================================================
# Main
# ============================================================


def main():
    agh_ok = fetch_agh_schedule()
    eis_ok = fetch_eisenberga_schedule()

    print()
    if agh_ok and eis_ok:
        print("All done.")
    else:
        print("Done with errors — check output above.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
