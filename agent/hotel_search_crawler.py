"""
Agent 1: Booking.com Search Crawler & URL Harvester
Extracts unique hotel URLs across search results pages (e.g. 2,000+ Delhi hotels),
automatically deduplicating against the live database in real-time.
"""

import sys
import os
import re
import time
import urllib.parse
from datetime import datetime, timedelta
from rich.console import Console
from rich.table import Table

console = Console()


def ensure_search_dates(url: str) -> str:
    """Injects check-in/check-out dates if missing so Booking.com renders property cards reliably."""
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    if "checkin" not in qs or "checkout" not in qs:
        t1 = datetime.now() + timedelta(days=7)
        t2 = t1 + timedelta(days=1)
        qs["checkin"] = [t1.strftime("%Y-%m-%d")]
        qs["checkout"] = [t2.strftime("%Y-%m-%d")]
        qs["group_adults"] = ["2"]
        qs["no_rooms"] = ["1"]
        qs["group_children"] = ["0"]
    new_query = urllib.parse.urlencode(qs, doseq=True)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


def set_url_offset(base_url: str, offset: int) -> str:
    """Sets the pagination offset for Booking.com search results."""
    parsed = urllib.parse.urlparse(base_url)
    qs = urllib.parse.parse_qs(parsed.query)
    qs['offset'] = [str(offset)]
    new_query = urllib.parse.urlencode(qs, doseq=True)
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))


def normalize_ota_url(url: str) -> str:
    """Extracts base canonical hotel path identifier for robust de-duplication across Booking.com and Brevistay."""
    if not url:
        return ""
    # Booking.com pattern
    m = re.search(r'(hotel/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)', url)
    if m:
        return m.group(1).lower()
    # Brevistay pattern: e.g. /hotels/hotel-airlift-in-delhi-150
    mb = re.search(r'(hotels/[a-zA-Z0-9_\-]+-\d+)', url)
    if mb:
        return mb.group(1).lower()
    return url.split('?')[0].lower().strip()


# Major Corporate Hotel Chains List (Skip these because corporate chains cannot negotiate local agreements)
CHAIN_PATTERNS = [
    r'\bradisson\b', r'\bhyatt\b', r'\bmarriott\b', r'\bhilton\b',
    r'\bholiday\s*inn\b', r'\bcrowne\s*plaza\b', r'\bnovotel\b', r'\bibis\b',
    r'\bmercure\b', r'\bpullman\b', r'\bsofitel\b', r'\bwyndham\b', r'\bramada\b',
    r'\bbest\s*western\b', r'\btaj\b', r'\bvivanta\b', r'\bginger\b',
    r'\bitc\b', r'\bwelcomhotel\b', r'\bfortune\s*(select|park|inn|resort|hotel)?\b',
    r'\boberoi\b', r'\btrident\b', r'\bleela\b', r'\blemon\s*tree\b', r'\bred\s*fox\b',
    r'\bpride\s*(plaza|hotel|resort|inn)?\b', r'\bbloom\s*(hotel|rooms|boutique)?\b',
    r'\bthe\s*lalit\b', r'\bsarovar\b', r'\bgolden\s*tulip\b',
    r'\broyal\s*orchid\b', r'\bregenta\b', r'\bthe\s*byke\b', r'\blords\s*(hotel|inn|plaza)?\b',
    r'\bspree\b', r'\bamritara\b', r'\bsummit\b', r'\b7\s*apple\b',
    r'\bthe\s*fern\b', r'\bfern\s*hotel\b', r'\bclarks\s*(inn|premier)?\b',
    r'\bcountry\s*inn\b', r'\bzolo\b', r'\bsaltstayz\b',
    r'\bfabhotel[s]?\b', r'\btreebo\b', r'\boyo\b', r'\btownhouse\b',
    r'\bsterling\b', r'\bclub\s*mahindra\b', r'\bqotel\b'
]
_COMPILED_CHAINS = [re.compile(p, re.IGNORECASE) for p in CHAIN_PATTERNS]


def is_big_chain(name: str) -> bool:
    """Detects if a hotel belongs to a corporate national/international chain."""
    if not name:
        return False
    for regex in _COMPILED_CHAINS:
        if regex.search(name):
            return True
    return False


def crawl_brevistay_search(
    search_url_or_city: str,
    target_count: int = 50,
    existing_signatures: dict = None,
    skip_chains: bool = True
) -> list:
    """
    Crawls Brevistay hourly hotels by city or direct search URL.
    Extracts individual hotel URLs, starting hourly rates, and deduplicates in real-time.
    Automatically filters out big corporate hotel chains (Radisson, Pride, Bloom, Hyatt, etc.)
    so GHS focuses strictly on independent partner properties.
    """
    import json
    import requests
    from bs4 import BeautifulSoup

    if existing_signatures is None:
        existing_signatures = {}

    target = (search_url_or_city or "delhi").strip()
    if not target.startswith("http"):
        clean_city = re.sub(r'[^a-zA-Z0-9\-]+', '-', target.lower()).strip('-')
        url = f"https://www.brevistay.com/hotels-in-{clean_city}"
    else:
        url = target

    console.print(f"\n[bold cyan]🕷️  AGENT 1: Crawling Brevistay Hourly Hotel Search Results...[/bold cyan]")
    console.print(f"[dim white]Source URL: [green]{url}[/green] | Target: [green]{target_count}[/green] fresh independent hourly hotels[/dim white]")
    console.print(f"[dim white]Filter active: [bold red]Skipping corporate chains (Radisson, Pride, Bloom, Hyatt, OYO, etc.)[/bold red][/dim white]")
    console.print(f"[dim white]Skipping duplicates already in DB ([yellow]{len(existing_signatures)}[/yellow] tracked)[/dim white]\n")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
    }

    collected_hotels = []
    seen_in_batch = set()
    unique_db_duplicates = set()
    skipped_chains = set()

    try:
        resp = requests.get(url, headers=headers, timeout=20)
        if resp.status_code != 200:
            console.print(f"[bold red]Brevistay request returned status {resp.status_code} for {url}[/bold red]")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        # 1. Extract from Next.js __NEXT_DATA__ state if available (Instant structured data)
        next_data_el = soup.find("script", id="__NEXT_DATA__")
        if next_data_el and next_data_el.string:
            try:
                jd = json.loads(next_data_el.string)
                d = jd.get("props", {}).get("pageProps", {}).get("data", {})
                hotels_list = d.get("hotels", [])
                for h in hotels_list:
                    if len(collected_hotels) >= target_count:
                        break
                    hid = h.get("hotelId")
                    hname = (h.get("hotelName") or "").strip()
                    if not hid or not hname:
                        continue

                    # Filter out big corporate chains
                    if skip_chains:
                        if is_big_chain(hname) or h.get("hotel_chain_id") or h.get("hotel_chain_name"):
                            skipped_chains.add(hname)
                            continue

                    # Construct canonical link: /hotels/<slug>-in-<city>-<id>
                    slug_name = re.sub(r'[^a-zA-Z0-9\-]+', '-', hname.lower()).strip('-')
                    city_slug = re.sub(r'[^a-zA-Z0-9\-]+', '-', (h.get("city_name") or "delhi").lower()).strip('-')
                    canonical_url = f"https://www.brevistay.com/hotels/{slug_name}-in-{city_slug}-{hid}"

                    norm_url = normalize_ota_url(canonical_url)
                    norm_name = hname.lower().strip()

                    if norm_url in seen_in_batch or norm_name in seen_in_batch:
                        continue
                    seen_in_batch.add(norm_url)
                    seen_in_batch.add(norm_name)

                    if norm_url in existing_signatures or norm_name in existing_signatures:
                        unique_db_duplicates.add(norm_url or norm_name)
                        continue

                    rate3 = h.get("room1_rate3") or h.get("rate3")
                    collected_hotels.append({
                        "name": hname,
                        "url": canonical_url,
                        "card_price": int(rate3) if rate3 else None,
                        "source": "brevistay",
                        "is_hourly": True
                    })
            except Exception as je:
                sys.stderr.write(f"[Brevistay NextData Parse Warning]: {je}\n")

        # 2. Extract all canonical hotel links directly from HTML anchor tags
        for a in soup.find_all("a", href=True):
            if len(collected_hotels) >= target_count:
                break
            href = a["href"].strip()
            # Match pattern: /hotels/<slug>-<id>
            m_hotel = re.search(r'(/hotels/[a-zA-Z0-9\-]+-\d+)$', href)
            if not m_hotel:
                continue

            rel_path = m_hotel.group(1)
            full_url = f"https://www.brevistay.com{rel_path}" if rel_path.startswith("/") else rel_path
            norm_url = normalize_ota_url(full_url)

            # Clean name from link text or slug
            link_text = a.get_text(strip=True)
            if link_text and len(link_text) > 3 and not any(skip in link_text.lower() for skip in ["view", "book", "hotel", "detail", "more"]):
                clean_name = link_text
            else:
                raw_slug = rel_path.split("/")[-1]
                slug_without_id = re.sub(r'-\d+$', '', raw_slug)
                slug_without_city = re.sub(r'-in-[a-zA-Z0-9\-]+$', '', slug_without_id)
                clean_name = slug_without_city.replace("-", " ").title()

            # Filter out big corporate chains
            if skip_chains and is_big_chain(clean_name):
                skipped_chains.add(clean_name)
                continue

            norm_name = clean_name.lower().strip()

            if norm_url in seen_in_batch or norm_name in seen_in_batch:
                continue
            seen_in_batch.add(norm_url)
            seen_in_batch.add(norm_name)

            if norm_url in existing_signatures or norm_name in existing_signatures:
                unique_db_duplicates.add(norm_url or norm_name)
                continue

            collected_hotels.append({
                "name": clean_name,
                "url": full_url,
                "card_price": None,
                "source": "brevistay",
                "is_hourly": True
            })

    except Exception as e:
        console.print(f"[bold red]Brevistay Crawl Error:[/bold red] {e}")

    chain_msg = f" (Skipped [dim red]{len(skipped_chains)}[/dim red] corporate chains)" if skipped_chains else ""
    console.print(
        f"\n[bold green]✓ AGENT 1 (BREVISTAY) FINISHED![/bold green] Gathered [bold cyan]{len(collected_hotels)}[/bold cyan] fresh independent hourly hotels "
        f"{chain_msg} (Skipped [yellow]{len(unique_db_duplicates)}[/yellow] unique DB duplicates).\n"
    )
    return collected_hotels


def crawl_search_results(
    search_url: str,
    target_count: int = 50,
    existing_signatures: dict = None,
    **kwargs
) -> list:
    """
    Unified multi-platform crawler for Booking.com (Nightly) and Brevistay (Hourly Micro-Stays).
    Auto-detects the platform based on URL or explicitly passed source.
    """
    url_lower = (search_url or "").lower()
    source = kwargs.get("source", "").lower()
    if "brevistay" in url_lower or source == "brevistay":
        return crawl_brevistay_search(search_url, target_count=target_count, existing_signatures=existing_signatures)
    else:
        return crawl_booking_search(search_url, target_count=target_count, existing_signatures=existing_signatures, **kwargs)


def crawl_booking_search(
    search_url: str,
    target_count: int = 50,
    existing_signatures: dict = None,
    max_pages: int = 40
) -> list:
    """
    Crawls Booking.com search results page-by-page until target_count unique,
    non-duplicate hotels are queued.
    """
    from playwright.sync_api import sync_playwright

    if existing_signatures is None:
        existing_signatures = {}

    ready_search_url = ensure_search_dates(search_url)
    collected_hotels = []
    seen_in_batch = set()
    unique_db_duplicates = set()
    consecutive_zero_pages = 0

    console.print(f"\n[bold cyan]🕷️  AGENT 1: Crawling Booking.com Search Results...[/bold cyan]")
    console.print(f"[dim white]Target: [green]{target_count}[/green] fresh hotels | Skipping duplicates already in DB ([yellow]{len(existing_signatures)}[/yellow] tracked)[/dim white]\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
            ]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="en-IN"
        )
        # Mask automation signals so Booking.com serves dynamic pagination
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            window.chrome = { runtime: {} };
        """)
        page = context.new_page()

        console.print(f"[bold cyan]Connecting to search results...[/bold cyan]")
        try:
            page.goto(ready_search_url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)
        except Exception as e:
            console.print(f"[bold red]Failed to load search URL: {e}[/bold red]")
            browser.close()
            return []

        # Dismiss any initial modal / cookie banner if present
        try:
            dismiss_btn = page.query_selector('[aria-label="Dismiss sign-in info."], button[aria-label="Close"], #onetrust-accept-btn-handler')
            if dismiss_btn and dismiss_btn.is_visible():
                dismiss_btn.click()
                page.wait_for_timeout(1000)
        except Exception:
            pass

        consecutive_idle_cycles = 0
        cycle = 0
        seen_all_on_page = set()

        while len(collected_hotels) < target_count and cycle < 150:
            cycle += 1
            fresh_added = 0
            dom_new_cards = 0

            # 1. Harvest all property cards currently in DOM
            cards = page.query_selector_all('[data-testid="property-card"]')
            if not cards:
                cards = page.query_selector_all('a[data-testid="title-link"], a[href*="/hotel/"]')

            for card in cards:
                if len(collected_hotels) >= target_count:
                    break

                # Get name
                title_el = card.query_selector('[data-testid="title"]') if hasattr(card, "query_selector") else None
                hotel_name = title_el.inner_text().strip() if title_el else ""

                # Get link
                link_el = card.query_selector('a[data-testid="title-link"], a[href*="/hotel/"]') if hasattr(card, "query_selector") else card
                raw_href = link_el.get_attribute("href") if link_el else ""
                if not raw_href:
                    continue

                # Canonicalize URL
                m = re.search(r'(https?://[^/]*booking\.com/hotel/[^?#]+\.html)', raw_href)
                canonical_url = m.group(1) if m else raw_href.split('?')[0]

                norm_url = normalize_ota_url(canonical_url)
                norm_name = hotel_name.lower().strip() if hotel_name else ""

                # If this card was already processed in an earlier cycle of this page, skip it
                if canonical_url in seen_all_on_page or norm_url in seen_all_on_page or (norm_name and norm_name in seen_all_on_page):
                    continue

                seen_all_on_page.add(canonical_url)
                seen_all_on_page.add(norm_url)
                if norm_name:
                    seen_all_on_page.add(norm_name)
                dom_new_cards += 1

                # Deduplication check against Live Database
                if norm_url in existing_signatures or (norm_name and norm_name in existing_signatures):
                    unique_db_duplicates.add(norm_url or norm_name)
                    continue

                # Fresh unique hotel!
                item = {
                    "name": hotel_name or canonical_url.split("/")[-1].replace(".html", "").replace("-", " ").title(),
                    "url": canonical_url
                }
                collected_hotels.append(item)
                fresh_added += 1

            if dom_new_cards > 0:
                consecutive_idle_cycles = 0
                if fresh_added > 0:
                    console.print(
                        f"  [bold green]+{fresh_added} fresh hotels[/bold green] harvested "
                        f"([dim green]{len(collected_hotels)}/{target_count} target queued[/dim green], [dim yellow]{len(unique_db_duplicates)} DB duplicates skipped[/dim yellow])"
                    )
            else:
                consecutive_idle_cycles += 1

            if len(collected_hotels) >= target_count:
                break

            if consecutive_idle_cycles >= 8:
                console.print(f"\n[bold yellow]⚠️ Reached end of available results ({consecutive_idle_cycles} scroll cycles without new cards).[/bold yellow]")
                break

            # 2. Scroll down to trigger lazy loading
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(2200)

            # 3. Check for 'Load more results' button or pagination
            try:
                load_btn = page.query_selector('button:has-text("more results"), button:has-text("Load more"), button:has-text("Show more"), [data-testid="pagination-next"], button[aria-label="Next page"]')
                if load_btn and load_btn.is_visible():
                    load_btn.click()
                    page.wait_for_timeout(2500)
            except Exception:
                pass

        browser.close()

    console.print(f"\n[bold green]✓ AGENT 1 FINISHED![/bold green] Gathered [bold cyan]{len(collected_hotels)}[/bold cyan] fresh hotels for this batch (Skipped [yellow]{len(unique_db_duplicates)}[/yellow] unique DB duplicates).\n")
    return collected_hotels

