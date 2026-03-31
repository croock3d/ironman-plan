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
from datetime import datetime, timezone
from html.parser import HTMLParser


# ---- AGH ----
AGH_BASE_URL = "https://basen.agh.edu.pl"
AGH_SCHEDULE_URL = f"{AGH_BASE_URL}/plywalnia/rezerwacje"
AGH_OUTPUT_IMAGE = "assets/agh-schedule.jpg"
AGH_OUTPUT_META = "assets/agh-schedule-meta.json"

# ---- Eisenberga ----
EISENBERGA_BASE_URL = "https://www.przystannaeisenberga.pl"
EISENBERGA_HARMONOGRAM_URL = f"{EISENBERGA_BASE_URL}/harmonogram/"
EISENBERGA_PDF_BASE = f"{EISENBERGA_BASE_URL}/wp-content/uploads/2025/05"
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
    """Parses the AGH pool page to find the schedule image URL and title."""

    def __init__(self):
        super().__init__()
        self.image_url = None
        self.title = None
        self._in_h2 = False
        self._h2_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "a":
            rel = attrs_dict.get("rel", "")
            href = attrs_dict.get("href", "")
            lightbox_title = attrs_dict.get("data-lightbox-title", "")
            if "lightbox" in rel and href and not self.image_url:
                self.image_url = AGH_BASE_URL + href
                if lightbox_title:
                    self.title = lightbox_title

        if tag == "img" and not self.image_url:
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            title = attrs_dict.get("title", "")
            label = alt or title
            if label and ("grafik" in label.lower() or "harmonogram" in label.lower()):
                self.image_url = AGH_BASE_URL + src
                if not self.title:
                    self.title = label

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
    Returns list of dicts with 'title' and 'name' (filename without .pdf),
    in the order they appear on the page (newest first).
    """
    # Match anchor text like "Harmonogram_30.03.-05.04." or "Harmonogram_23.03.-29.03"
    pattern = re.compile(
        r'<a[^>]+href="[^"]*Harmonogram[^"]*"[^>]*>\s*(Harmonogram_[^<]+?)\s*</a>',
        re.IGNORECASE,
    )
    results = []
    seen = set()
    for m in pattern.finditer(html):
        title = m.group(1).strip()
        # Normalize: ensure trailing dot if missing (e.g. "29.03" → "29.03.")
        # Keep as-is for filename matching
        name = title.rstrip(".")  # strip trailing dot for filename
        if name not in seen:
            seen.add(name)
            results.append({"title": title, "name": name})
    return results


def resolve_pdf_url(name):
    """
    Given a harmonogram name like 'Harmonogram_30.03.-05.04',
    tries to find the PDF URL by checking known upload paths.
    Returns URL string or None.
    """
    # Try with and without trailing dot in filename
    candidates = [
        f"{EISENBERGA_PDF_BASE}/{name}.pdf",
        f"{EISENBERGA_PDF_BASE}/{name}..pdf",  # double dot edge case
    ]
    # Also try with trailing dot stripped already in name
    # and try adding it back
    if not name.endswith("."):
        candidates.insert(1, f"{EISENBERGA_PDF_BASE}/{name}..pdf")

    for url in candidates:
        status = head_url(url)
        if status == 200:
            return url
    return None


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
        pdf_url = resolve_pdf_url(item["name"])
        if pdf_url:
            print(f"  OK: {item['title']} → {pdf_url}")
            schedules.append(
                {
                    "title": item["title"],
                    "pdf_url": pdf_url,
                }
            )
        else:
            print(f"  WARN: PDF not found for {item['title']}", file=sys.stderr)

    if not schedules:
        print("ERROR: Could not resolve any PDF URLs", file=sys.stderr)
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
