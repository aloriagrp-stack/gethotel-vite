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
    total_duplicates_skipped = 0

    console.print(f"\n[bold cyan]🕷️  AGENT 1: Crawling Booking.com Search Results...[/bold cyan]")
    console.print(f"[dim white]Target: [green]{target_count}[/green] fresh hotels | Skipping duplicates already in DB ([yellow]{len(existing_signatures)}[/yellow] tracked)[/dim white]\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            locale="en-IN"
        )
        page = context.new_page()

        for page_idx in range(max_pages):
            if len(collected_hotels) >= target_count:
                break

            offset = page_idx * 25
            page_url = set_url_offset(ready_search_url, offset)

            try:
                with console.status(f"[bold cyan]Scanning Page {page_idx + 1} (Offset {offset})... [green]{len(collected_hotels)}/{target_count}[/green] collected[/bold cyan]", spinner="dots"):
                    page.goto(page_url, wait_until="domcontentloaded", timeout=30000)
                    page.wait_for_timeout(2500)

                    # Extract property cards
                    cards = page.query_selector_all('[data-testid="property-card"]')
                    if not cards:
                        # Fallback: check any title-link elements
                        cards = page.query_selector_all('a[data-testid="title-link"], a[href*="/hotel/"]')

                page_new_count = 0
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

                    # Canonicalize URL (e.g. https://www.booking.com/hotel/in/hotel-name.html)
                    m = re.search(r'(https?://[^/]*booking\.com/hotel/[^?#]+\.html)', raw_href)
                    canonical_url = m.group(1) if m else raw_href.split('?')[0]

                    norm_url = normalize_ota_url(canonical_url)
                    norm_name = hotel_name.lower().strip() if hotel_name else ""

                    # Deduplication check against batch
                    if norm_url in seen_in_batch or canonical_url in seen_in_batch:
                        continue

                    # Deduplication check against MySQL Database
                    if norm_url in existing_signatures or (norm_name and norm_name in existing_signatures):
                        total_duplicates_skipped += 1
                        continue

                    # Fresh unique hotel!
                    item = {
                        "name": hotel_name or canonical_url.split("/")[-1].replace(".html", "").replace("-", " ").title(),
                        "url": canonical_url
                    }
                    collected_hotels.append(item)
                    seen_in_batch.add(norm_url)
                    seen_in_batch.add(canonical_url)
                    page_new_count += 1

                console.print(
                    f"  [bold white]Page {page_idx + 1}[/bold white] (offset {offset}): "
                    f"Found [cyan]{len(cards)}[/cyan] cards -> Added [bold green]+{page_new_count}[/bold green] fresh hotels "
                    f"([dim green]{len(collected_hotels)}/{target_count} total[/dim green], [dim yellow]{total_duplicates_skipped} duplicates skipped[/dim yellow])"
                )

                if not cards and page_idx > 0:
                    console.print("[yellow]No more property cards found. Reached end of search results.[/yellow]")
                    break

            except Exception as e:
                console.print(f"[red]Error loading page {page_idx + 1}: {e}[/red]")
                time.sleep(2)
                continue

        browser.close()

    console.print(f"\n[bold green]✓ AGENT 1 FINISHED![/bold green] Gathered [bold cyan]{len(collected_hotels)}[/bold cyan] fresh hotels for this batch (Skipped [yellow]{total_duplicates_skipped}[/yellow] already-listed duplicates).\n")
    return collected_hotels
