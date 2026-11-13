"""
GHS Bulk Hotel Harvester
Author: Antigravity AI Pair Programmer
Purpose:
- Collects target N hotel URLs from user (one by one or multi-paste)
- Real-time de-duplication check against MySQL database (warns and skips already-listed hotels)
- Once target count is reached, prompts for confirmation [Y/n]
- Deep-scrapes each listing, downloads high-res photos to /uploads/, and creates directory listing in DB
- Resilient: Continues on error, prints live progress, and provides a final executive summary
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

def run_bulk_harvester(target_count: int = None, default_photos: int = 6):
    console.print("\n[bold cyan]══════════════════════════════════════════════════════════════════════[/bold cyan]")
    console.print("  [bold yellow]🏙️  GHS BULK HOTEL HARVESTER & LEAD GENERATOR (DELHI FOCUS)[/bold yellow]")
    console.print("[bold cyan]══════════════════════════════════════════════════════════════════════[/bold cyan]\n")
    console.print("[dim white]Enter your target number of hotels. The bot will prompt for links one by one,[/dim white]")
    console.print("[dim white]auto-check for duplicates against live DB, download all HD photos, and create directory listings.[/dim white]\n")

    # Step 1: Target count
    if not target_count:
        target_count = IntPrompt.ask("[bold green]How many hotel URLs do you want to capture in this batch?[/bold green]", default=10)

    photos_per_hotel = IntPrompt.ask("How many HD photos to download locally per hotel?", default=default_photos)

    # Step 2: Fetch existing DB signatures for instant duplicate detection
    with console.status("[bold cyan]Loading existing hotel database signatures...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()

    console.print(f"[bold green]✓ Ready![/bold green] Database checked ([cyan]{len(existing_signatures)}[/cyan] existing listings tracked).")
    console.print(f"[dim yellow]Tip: You can type 'done' or 'go' at any time to start scraping the URLs collected so far.[/dim yellow]\n")

    collected_urls = []
    seen_in_batch = set()

    # Step 3: Interactive URL Collection
    while len(collected_urls) < target_count:
        curr_idx = len(collected_urls) + 1
        prompt_label = f"[bold green][{curr_idx}/{target_count}][/bold green] Paste Hotel URL"
        raw_input = Prompt.ask(prompt_label).strip()

        if not raw_input:
            continue

        if raw_input.lower() in ["done", "go", "start", "exit"]:
            if collected_urls:
                console.print(f"[yellow]Ending URL collection early. Total collected: {len(collected_urls)}[/yellow]")
                break
            else:
                console.print("[red]No URLs entered yet. Exiting harvester.[/red]")
                return

        # Check for multiple URLs pasted together (space or newline separated)
        candidates = [u.strip() for u in re.split(r'[\r\n\s]+', raw_input) if u.strip().startswith("http")]
        if not candidates:
            console.print("[red]⚠️ Invalid URL format. Must start with http:// or https://[/red]")
            continue

        for cand in candidates:
            if len(collected_urls) >= target_count:
                break

            norm_cand = normalize_ota_url(cand)

            # Check duplicate in current batch
            if norm_cand in seen_in_batch or cand in seen_in_batch:
                console.print(f"[bold yellow]⚠️  [Duplicate in Batch]:[/bold yellow] This link is already added in current queue! Removing link...")
                continue

            # Check duplicate against MySQL database
            if norm_cand in existing_signatures:
                match_info = existing_signatures[norm_cand]
                console.print(
                    f"[bold red]⚠️  [Already Listed Warning]:[/bold red] "
                    f"Hotel is ALREADY in GHS Database! (ID #{match_info['id']} - '[bold cyan]{match_info['name']}[/bold cyan]'). "
                    f"[dim]Removing link to avoid duplicate listing...[/dim]"
                )
                continue

            # Valid unique URL!
            collected_urls.append(cand)
            seen_in_batch.add(norm_cand)
            seen_in_batch.add(cand)
            console.print(f"  [green]✓[/green] [bold white]Accepted[/bold white] ({len(collected_urls)}/{target_count})")

    if not collected_urls:
        console.print("[red]No valid URLs to process.[/red]")
        return

    # Step 4: Show summary & ask for confirmation
    console.print("\n" + "─" * 70)
    summary_table = Table(title=f"📋 Batch Queue Ready: {len(collected_urls)} Unique Hotels to Harvest", border_style="green", show_lines=False)
    summary_table.add_column("#", justify="center", style="bold cyan", width=4)
    summary_table.add_column("Target Hotel Link", style="dim white")

    for i, u in enumerate(collected_urls, start=1):
        summary_table.add_row(str(i), u[:75] + ("..." if len(u) > 75 else ""))

    console.print(summary_table)

    if not Confirm.ask(f"\n[bold green]Ready to start deep-scraping & photo downloads for these {len(collected_urls)} hotels?[/bold green]", default=True):
        console.print("[yellow]Batch cancelled by user.[/yellow]")
        return

    # Step 5: Start Sequential Harvesting
    try:
        from hotel_deep_cloner import clone_hotel, save_to_mysql
    except ImportError:
        from agent.hotel_deep_cloner import clone_hotel, save_to_mysql

    successful = []
    failed = []

    console.print(f"\n[bold cyan]🚀 Starting Batch Harvest of {len(collected_urls)} hotels...[/bold cyan]\n")

    for idx, target_url in enumerate(collected_urls, start=1):
        console.print(f"[bold cyan]─── [{idx}/{len(collected_urls)}] Processing: {target_url[:65]}... ───[/bold cyan]")
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
        time.sleep(1.5)

    # Step 6: Executive Summary
    console.print("\n" + "═" * 70)
    console.print(Panel(
        f"[bold white]Total URLs Queued:[/bold white] {len(collected_urls)}\n"
        f"[bold green]Successfully Cloned & Saved:[/bold green] {len(successful)}\n"
        f"[bold red]Failed / Incomplete:[/bold red] {len(failed)}\n"
        f"[bold white]Total High-Res Photos Saved to Server:[/bold white] {sum(h.get('downloadedPhotosCount', 0) for h in successful)} files\n\n"
        f"[bold cyan]✨ All successful hotels are now LIVE in Directory & visible in Super Admin ControlHub![/bold cyan]",
        title="🎉 Batch Harvesting Finished",
        border_style="green"
    ))

    Prompt.ask("\nPress Enter to return to menu")


if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else None
    run_bulk_harvester(target_count=count)

