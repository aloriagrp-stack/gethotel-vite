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
    """Extracts base canonical hotel path identifier for robust de-duplication."""
    if not url:
        return ""
    m = re.search(r'(hotel/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)', url)
    if m:
        return m.group(1).lower()
    return url.split('?')[0].lower().strip()


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

