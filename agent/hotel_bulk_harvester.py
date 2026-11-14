"""
GHS Multi-Agent Bulk Hotel Harvester & City Directory Suite
Author: Antigravity AI Pair Programmer
Architecture:
- Agent 1 (Search Crawler): Crawls city search results (2,000+ hotels), extracts canonical URLs, skips DB duplicates.
- Agent 2 (Asset Cloner): Deep-scrapes property profile, amenities, pricing, downloads N HD photos, and saves to Local & Live MySQL.
- Agent 3 (Contact Enricher): Finds official front desk phone numbers, emails & websites via Google Maps & Search.
- Agent 4 (Empty Box Sentinel): Logs unresolved hotels into empty_box registry for quality control.
"""

import sys
import os
import re
import json
import time
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, IntPrompt, Confirm

console = Console()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
for p in [CURRENT_DIR, PROJECT_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)


def normalize_ota_url(url: str) -> str:
    """Extracts base hotel path identifier for robust de-duplication."""
    if not url:
        return ""
    m = re.search(r'(hotel/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)', url)
    if m:
        return m.group(1).lower()
    return url.split('?')[0].lower().strip()


def get_existing_hotel_signatures():
    """Fetches all existing hotel bookingUrls and names from both Local and Live MySQL to detect duplicates."""
    signatures = {}
    import pymysql
    db_configs = [
        {"host": "127.0.0.1", "port": 3306, "user": "root", "password": "", "database": "vgyuvmpi_gethotel_db"},
        {"host": "103.108.220.145", "port": 3306, "user": "vgyuvmpi_gethotel_db", "password": "shriyanshking", "database": "vgyuvmpi_gethotel_db"}
    ]
    for cfg in db_configs:
        try:
            conn = pymysql.connect(
                host=cfg["host"], port=cfg["port"], user=cfg["user"], password=cfg["password"],
                database=cfg["database"], autocommit=True, connect_timeout=5
            )
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, bookingUrl FROM hotel")
                for row in cur.fetchall():
                    hid, name, b_url = row[0], row[1], row[2]
                    if b_url:
                        norm = normalize_ota_url(b_url)
                        if norm:
                            signatures[norm] = {"id": hid, "name": name, "reason": "Booking URL match"}
                    if name:
                        clean_n = name.lower().strip()
                        signatures[clean_n] = {"id": hid, "name": name, "reason": "Hotel Name match"}
            conn.close()
        except Exception:
            pass
    return signatures


def execute_batch_cloning(collected_items: list, photos_per_hotel: int = 6, auto_enrich: bool = True):
    """
    Executes Agent 2 (Deep Cloner) and Agent 3 (Contact Enricher) on the collected queue.
    """
    try:
        from hotel_deep_cloner import clone_hotel, save_to_mysql
    except ImportError:
        from agent.hotel_deep_cloner import clone_hotel, save_to_mysql

    successful = []
    failed = []

    console.print(f"\n[bold cyan]🚀 AGENT 2: Starting Deep Scrape & HD Photo Downloads for {len(collected_items)} hotels...[/bold cyan]\n")

    for idx, item in enumerate(collected_items, start=1):
        target_url = item["url"] if isinstance(item, dict) else item
        item_name = item.get("name") if isinstance(item, dict) else target_url.split("/")[-1].replace(".html", "").title()

        console.print(f"[bold cyan]─── [{idx}/{len(collected_items)}] Processing: [bold white]{item_name[:50]}[/bold white] ───[/bold cyan]")
        start_time = time.time()
        try:
            with console.status(f"[bold cyan]Scraping details & downloading {photos_per_hotel} HD photos...[/bold cyan]", spinner="dots"):
                hotel_data = clone_hotel(target_url, max_photos=photos_per_hotel)

            if hotel_data.get("success") and hotel_data.get("name"):
                new_id = save_to_mysql(hotel_data)
                elapsed = round(time.time() - start_time, 1)
                if new_id:
                    hotel_data["hotelId"] = new_id
                    successful.append(hotel_data)
                    console.print(
                        f"  [bold green]✓ SUCCESS![/bold green] [ID #{new_id}] [bold white]{hotel_data['name']}[/bold white] "
                        f"({hotel_data['city']}) | Rate: ₹{hotel_data.get('bookingPrice') or 'N/A'} | "
                        f"Photos: [green]{hotel_data.get('downloadedPhotosCount', 0)} downloaded[/green] ({elapsed}s)"
                    )
                else:
                    failed.append({"url": target_url, "error": "MySQL save error"})
                    console.print(f"  [bold red]❌ Failed to save to database.[/bold red]")
            else:
                err_msg = hotel_data.get("error", "Unknown extraction failure")
                failed.append({"url": target_url, "error": err_msg})
                console.print(f"  [bold red]❌ Scrape failed:[/bold red] {err_msg}")

        except Exception as e:
            failed.append({"url": target_url, "error": str(e)})
            console.print(f"  [bold red]❌ Unexpected Error:[/bold red] {e}")

        # Small cooldown between requests
        time.sleep(1.2)

    # Agent 3: Auto-Enrich Contacts via Google Maps
    if auto_enrich and successful:
        console.print("\n" + "═" * 70)
        console.print(f"[bold cyan]📞 AGENT 3: Auto-Enriching {len(successful)} New Hotel(s) with Google Maps Contacts...[/bold cyan]")
        try:
            try:
                from google_maps_enricher import run_enricher
            except ImportError:
                from agent.google_maps_enricher import run_enricher
            run_enricher(limit=len(successful))
        except Exception as e:
            console.print(f"[bold yellow]⚠️ Enricher error: {e}[/bold yellow]")

    # Executive Summary
    console.print("\n" + "═" * 70)
    console.print(Panel(
        f"[bold white]Total Hotels in Batch:[/bold white] {len(collected_items)}\n"
        f"[bold green]Successfully Cloned & Saved to Both DBs:[/bold green] {len(successful)}\n"
        f"[bold red]Failed / Incomplete:[/bold red] {len(failed)}\n"
        f"[bold white]Total High-Res Photos Saved to Server:[/bold white] {sum(h.get('downloadedPhotosCount', 0) for h in successful)} files\n\n"
        f"[bold cyan]✨ All newly harvested hotels are now LIVE on GetHotelStays & visible in Super Admin ControlHub![/bold cyan]",
        title="🎉 Batch Harvesting Finished",
        border_style="green"
    ))

    Prompt.ask("\nPress Enter to return to menu")


def run_automated_search_harvester():
    """
    Agent 1 + Agent 2 + Agent 3 Pipeline:
    User inputs 1 Booking.com Search URL (e.g. 2,000+ Delhi hotels),
    and the agents automatically crawl pagination, de-duplicate, download HD photos,
    and enrich front-desk contacts.
    """
    console.print(Panel(
        "[bold cyan]🚀 AUTOMATED CITY SEARCH RESULTS CRAWLER (2,000+ HOTELS SUITE)[/bold cyan]\n"
        "[white]Provide ONE Booking.com City Search Results URL.\n"
        "Agent 1 crawls pages -> Agent 2 clones & downloads photos -> Agent 3 finds phone & email.\n"
        "Synchronizes with Localhost (127.0.0.1) & Live Production (103.108.220.145)[/white]",
        border_style="cyan"
    ))

    default_search_url = "https://www.booking.com/searchresults.html?ss=New+Delhi&dest_id=-2106102&dest_type=city"
    console.print(f"[dim]Default Delhi URL: {default_search_url}[/dim]\n")

    search_url = Prompt.ask("[bold green]Paste Booking.com Search Results URL[/bold green]", default=default_search_url).strip()
    target_count = IntPrompt.ask("[bold green]How many fresh hotels to harvest in this batch?[/bold green]", default=50)
    photos_per_hotel = IntPrompt.ask("How many HD photos to download locally per hotel?", default=6)
    auto_enrich = Confirm.ask("Auto-enrich front desk phone & email via Google Maps after cloning?", default=True)

    # Step 1: Load DB signatures for live de-duplication
    with console.status("[bold cyan]Loading existing hotel database signatures...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()
    console.print(f"[bold green]✓ Ready![/bold green] Database checked ([cyan]{len(existing_signatures)}[/cyan] existing listings tracked).")

    # Step 2: Run Agent 1 (Search Crawler)
    try:
        from hotel_search_crawler import crawl_booking_search
    except ImportError:
        from agent.hotel_search_crawler import crawl_booking_search

    collected_hotels = crawl_booking_search(
        search_url=search_url,
        target_count=target_count,
        existing_signatures=existing_signatures
    )

    if not collected_hotels:
        console.print("[bold yellow]⚠️ No new non-duplicate hotels found in this search.[/bold yellow]")
        Prompt.ask("\nPress Enter to return to menu")
        return

    # Step 3: Show queue preview
    summary_table = Table(title=f"📋 Batch Queue Ready: {len(collected_hotels)} Fresh Hotels to Harvest", border_style="green", show_lines=False)
    summary_table.add_column("#", justify="center", style="bold cyan", width=4)
    summary_table.add_column("Hotel Name", style="bold white", width=36)
    summary_table.add_column("Canonical Link", style="dim cyan")

    for i, h in enumerate(collected_hotels[:20], start=1):
        summary_table.add_row(str(i), h["name"][:35], h["url"][:60])
    if len(collected_hotels) > 20:
        summary_table.add_row("...", f"...and {len(collected_hotels) - 20} more fresh hotels", "...")

    console.print(summary_table)

    if not Confirm.ask(f"\n[bold green]Ready to start deep-cloning & photo downloads for these {len(collected_hotels)} hotels?[/bold green]", default=True):
        console.print("[yellow]Batch cancelled by user.[/yellow]")
        Prompt.ask("\nPress Enter to return to menu")
        return

    # Step 4: Run Agent 2 (Cloner) & Agent 3 (Enricher)
    execute_batch_cloning(collected_hotels, photos_per_hotel=photos_per_hotel, auto_enrich=auto_enrich)


def run_manual_queue_harvester():
    """Manual mode: User pastes hotel links one by one or in batch."""
    console.print(Panel(
        "[bold yellow]📝 MANUAL HOTEL URL QUEUE HARVESTER[/bold yellow]\n"
        "[dim]Paste individual hotel URLs one by one or multi-paste.[/dim]",
        border_style="yellow"
    ))

    target_count = IntPrompt.ask("[bold green]How many hotel URLs do you want to capture in this batch?[/bold green]", default=10)
    photos_per_hotel = IntPrompt.ask("How many HD photos to download locally per hotel?", default=6)

    with console.status("[bold cyan]Loading existing hotel database signatures...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()
    console.print(f"[bold green]✓ Ready![/bold green] Database checked ([cyan]{len(existing_signatures)}[/cyan] existing listings tracked).\n")

    collected_urls = []
    seen_in_batch = set()

    while len(collected_urls) < target_count:
        curr_idx = len(collected_urls) + 1
        prompt_label = f"[bold green][{curr_idx}/{target_count}][/bold green] Paste Hotel URL"
        raw_input = Prompt.ask(prompt_label).strip()

        if not raw_input:
            continue
        if raw_input.lower() in ["done", "go", "start", "exit"]:
            if collected_urls:
                break
            else:
                return

        candidates = [u.strip() for u in re.split(r'[\r\n\s]+', raw_input) if u.strip().startswith("http")]
        if not candidates:
            console.print("[red]⚠️ Invalid URL format. Must start with http:// or https://[/red]")
            continue

        for cand in candidates:
            if len(collected_urls) >= target_count:
                break
            norm_cand = normalize_ota_url(cand)
            if norm_cand in seen_in_batch:
                continue
            if norm_cand in existing_signatures:
                console.print(f"[bold red]⚠️ Already Listed:[/bold red] {existing_signatures[norm_cand]['name']}")
                continue

            collected_urls.append(cand)
            seen_in_batch.add(norm_cand)
            console.print(f"  [green]✓[/green] [bold white]Accepted[/bold white] ({len(collected_urls)}/{target_count})")

    if not collected_urls:
        return

    auto_enrich = Confirm.ask("Auto-enrich front desk phone & email via Google Maps after cloning?", default=True)
    execute_batch_cloning(collected_urls, photos_per_hotel=photos_per_hotel, auto_enrich=auto_enrich)


def run_bulk_harvester():
    """Main menu for Bulk Hotel Harvester Suite."""
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        console.print(Panel(
            "[bold cyan]🏙️  GHS BULK HOTEL HARVESTER & LEAD GENERATOR[/bold cyan]\n"
            "[white]Autonomous multi-agent suite to harvest hundreds of directory hotels.\n"
            "Downloads photos, extracts amenities, auto-enriches contact numbers & saves to DB.[/white]",
            border_style="cyan"
        ))

        console.print("  [bold cyan][1][/bold cyan] 🚀 [bold green]Auto-Harvest from Booking.com Search URL[/bold green] (Paste 1 City Search URL with 2,000+ Hotels)")
        console.print("  [bold cyan][2][/bold cyan] 📝 [bold white]Manual Hotel URL Queue[/bold white] (Paste links one by one or in batch)")
        console.print("  [bold red][0][/bold red] 🔙 Back to Previous Menu\n")

        choice = Prompt.ask("Choose an option", choices=["1", "2", "0"], default="1")

        if choice == "1":
            run_automated_search_harvester()
        elif choice == "2":
            run_manual_queue_harvester()
        elif choice == "0":
            break


if __name__ == "__main__":
    run_bulk_harvester()
