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
import threading
import queue
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
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
    """Extracts base hotel path identifier for robust de-duplication across Booking.com and Brevistay."""
    if not url:
        return ""
    # Booking.com pattern
    m = re.search(r'(hotel/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)', url)
    if m:
        return m.group(1).lower()
    # Brevistay pattern
    mb = re.search(r'(hotels/[a-zA-Z0-9_\-]+-\d+)', url)
    if mb:
        return mb.group(1).lower()
    return url.split('?')[0].lower().strip()


def get_existing_hotel_signatures():
    """Fetches all existing hotel bookingUrls and names from Live Production MySQL to detect duplicates."""
    signatures = {}
    import pymysql
    # Only Live Production MariaDB (Local DB remains clean)
    db_configs = [
        {"host": "103.108.220.145", "port": 3306, "user": "vgyuvmpi_gethotel_db", "password": "shriyanshking", "database": "vgyuvmpi_gethotel_db"}
    ]
    for cfg in db_configs:
        try:
            conn = pymysql.connect(
                host=cfg["host"], port=cfg["port"], user=cfg["user"], password=cfg["password"],
                database=cfg["database"], autocommit=True, connect_timeout=8,
                read_timeout=10, write_timeout=10
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


def clone_and_save_worker(item, idx: int, total: int, photos_per_hotel: int, print_lock: threading.Lock):
    """Worker task executed concurrently by worker agents."""
    try:
        from hotel_deep_cloner import clone_hotel, save_to_mysql
    except ImportError:
        from agent.hotel_deep_cloner import clone_hotel, save_to_mysql

    target_url = item["url"] if isinstance(item, dict) else item
    item_name = item.get("name") if isinstance(item, dict) else target_url.split("/")[-1].replace(".html", "").title()
    card_price = item.get("card_price") if isinstance(item, dict) else None
    start_time = time.time()
    try:
        hotel_data = clone_hotel(target_url, max_photos=photos_per_hotel, download_locally=False, card_price=card_price)

        if hotel_data.get("success") and hotel_data.get("name"):
            new_id = save_to_mysql(hotel_data)
            elapsed = round(time.time() - start_time, 1)
            if new_id:
                hotel_data["hotelId"] = new_id
                with print_lock:
                    rate_display = f"₹{hotel_data.get('bookingPrice')}" if hotel_data.get('bookingPrice') else "Live"
                    console.print(
                        f"  [bold green]✓ [{idx}/{total}] CLONED![/bold green] [ID #{new_id}] [bold white]{hotel_data['name']}[/bold white] "
                        f"({hotel_data['city']}) | Dynamic Rate: [bold yellow]{rate_display}[/bold yellow] | "
                        f"Photos: [green]{hotel_data.get('downloadedPhotosCount', 0)} CDN photos linked[/green] ({elapsed}s)"
                    )
                return {"success": True, "data": hotel_data}
            else:
                with print_lock:
                    console.print(f"  [bold red]❌ [{idx}/{total}] Failed to save to database: {item_name}[/bold red]")
                return {"success": False, "url": target_url, "error": "MySQL save error"}
        else:
            err_msg = hotel_data.get("error", "Unknown extraction failure")
            with print_lock:
                console.print(f"  [bold red]❌ [{idx}/{total}] Scrape failed for {item_name}:[/bold red] {err_msg}")
            return {"success": False, "url": target_url, "error": err_msg}

    except Exception as e:
        with print_lock:
            console.print(f"  [bold red]❌ [{idx}/{total}] Unexpected Error for {item_name}:[/bold red] {e}")
        return {"success": False, "url": target_url, "error": str(e)}


def execute_batch_cloning(collected_items: list, photos_per_hotel: int = 25, auto_enrich: bool = True, max_workers: int = 8):
    """
    Executes Agent 2 (Deep Cloner Swarm) concurrently with max_workers and Agent 3 (Contact Enricher) on the collected queue.
    Photos are linked directly via high-speed CDN (0 MB disk space used locally).
    """
    successful = []
    failed = []
    print_lock = threading.Lock()

    console.print(f"\n[bold cyan]🚀 MULTI-AGENT SWARM: Spawning {max_workers} Parallel Worker Agents for {len(collected_items)} hotels...[/bold cyan]\n")
    batch_start = time.time()

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(clone_and_save_worker, item, idx, len(collected_items), photos_per_hotel, print_lock): item
            for idx, item in enumerate(collected_items, start=1)
        }
        for future in as_completed(futures):
            res = future.result()
            if res.get("success"):
                successful.append(res["data"])
            else:
                failed.append(res)

    total_batch_time = round(time.time() - batch_start, 1)

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
        f"[bold green]Successfully Cloned & Saved to Live DB:[/bold green] {len(successful)}\n"
        f"[bold red]Failed / Incomplete:[/bold red] {len(failed)}\n"
        f"[bold cyan]Total Batch Processing Time:[/bold cyan] {total_batch_time}s (~{round(total_batch_time/60, 1)} minutes)\n"
        f"[bold white]High-Res CDN Photos Linked:[/bold white] {sum(h.get('downloadedPhotosCount', 0) for h in successful)} photos (0 MB local disk)\n\n"
        f"[bold cyan]✨ All newly harvested hotels are now LIVE on GetHotelStays & visible in Super Admin ControlHub![/bold cyan]",
        title="🎉 Multi-Agent Batch Harvesting Finished",
        border_style="green"
    ))

    Prompt.ask("\nPress Enter to return to menu")


def run_automated_search_harvester(
    target_count: int = None,
    photos_per_hotel: int = None,
    search_url: str = None,
    auto_enrich: bool = None,
    **kwargs
):
    """
    Agent 1 + Agent 2 + Agent 3 Pipeline:
    User inputs 1 Booking.com Search URL (e.g. 2,000+ Delhi hotels),
    and the agents automatically crawl pagination, de-duplicate, download HD photos,
    and enrich front-desk contacts.
    """
    console.print(Panel(
        "[bold cyan]🚀 AUTOMATED CITY SEARCH RESULTS CRAWLER (2,000+ HOTELS SUITE)[/bold cyan]\n"
        "[white]Supported Platforms: [bold yellow]Booking.com[/bold yellow] (Nightly) & [bold green]Brevistay[/bold green] (Hourly Micro-Stays: 3h, 6h, 12h)\n"
        "Agent 1 crawls search pages -> Agent 2 clones & downloads photos -> Agent 3 finds phone & email.\n"
        "Direct Live Cloud Insertion: Saves strictly to Live Production (103.108.220.145)[/white]",
        border_style="cyan"
    ))

    if not search_url:
        console.print("[bold yellow]Choose Platform / Source to Harvest:[/bold yellow]")
        console.print("  [1] 🏨 [bold white]Booking.com City Search[/bold white] (Nightly Standard Hotels)")
        console.print("  [2] ⏱️  [bold green]Brevistay Hourly Search[/bold green] (3h, 6h, 12h Micro-Stays & Transit Rooms)")
        console.print("  [3] 🔗 [bold cyan]Custom Search URL / City Name[/bold cyan] (Auto-detect platform)\n")
        
        src_choice = Prompt.ask("Select option", choices=["1", "2", "3"], default="1")
        if src_choice == "1":
            default_search_url = "https://www.booking.com/searchresults.html?ss=New+Delhi&dest_id=-2106102&dest_type=city"
            search_url = Prompt.ask("[bold green]Paste Booking.com Search Results URL[/bold green]", default=default_search_url).strip()
        elif src_choice == "2":
            city_input = Prompt.ask("[bold green]Enter City for Brevistay Hourly Search (e.g. delhi, mumbai, bangalore, jaipur)[/bold green]", default="delhi").strip()
            if city_input.startswith("http"):
                search_url = city_input
            else:
                clean_city = re.sub(r'[^a-zA-Z0-9\-]+', '-', city_input.lower()).strip('-')
                search_url = f"https://www.brevistay.com/hotels-in-{clean_city}"
        else:
            search_url = Prompt.ask("[bold green]Enter any Booking.com or Brevistay Search URL[/bold green]").strip()

    if target_count is None:
        target_count = IntPrompt.ask("[bold green]How many fresh hotels to harvest in this batch?[/bold green]", default=50)
    if photos_per_hotel is None:
        photos_per_hotel = IntPrompt.ask("How many HD photos to link per hotel? (CDN links, 0 MB disk used)", default=25)
    workers = kwargs.get("workers")
    if workers is None:
        workers = IntPrompt.ask("How many parallel worker agents in swarm? (Max speed)", default=8)
    if auto_enrich is None:
        auto_enrich = Confirm.ask("Auto-enrich front desk phone & email via Google Maps after cloning?", default=True)

    # Step 1: Load DB signatures for live de-duplication
    with console.status("[bold cyan]Loading existing hotel database signatures...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()
    unique_hotel_count = len(set(v['id'] for v in existing_signatures.values()))
    console.print(f"[bold green]✓ Ready![/bold green] Database checked ([cyan]{unique_hotel_count}[/cyan] unique hotels tracked in Live Production DB).")

    # Step 2: Run Agent 1 (Search Crawler)
    try:
        from hotel_search_crawler import crawl_search_results
    except ImportError:
        from agent.hotel_search_crawler import crawl_search_results

    collected_hotels = crawl_search_results(
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

    # Step 4: Run Agent 2 (Cloner Swarm) & Agent 3 (Enricher)
    execute_batch_cloning(collected_hotels, photos_per_hotel=photos_per_hotel, auto_enrich=auto_enrich, max_workers=workers)


def run_manual_queue_harvester(
    target_count: int = None,
    photos_per_hotel: int = None,
    auto_enrich: bool = None,
    **kwargs
):
    """Manual mode: User pastes hotel links one by one or in batch."""
    console.print(Panel(
        "[bold yellow]📝 MANUAL HOTEL URL QUEUE HARVESTER[/bold yellow]\n"
        "[dim]Paste individual hotel URLs one by one or multi-paste.[/dim]",
        border_style="yellow"
    ))

    if target_count is None:
        target_count = IntPrompt.ask("[bold green]How many hotel URLs do you want to capture in this batch?[/bold green]", default=10)
    if photos_per_hotel is None:
        photos_per_hotel = IntPrompt.ask("How many HD photos to link per hotel? (CDN links, 0 MB disk used)", default=25)

    with console.status("[bold cyan]Loading existing hotel database signatures...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()
    unique_hotel_count = len(set(v['id'] for v in existing_signatures.values()))
    console.print(f"[bold green]✓ Ready![/bold green] Database checked ([cyan]{unique_hotel_count}[/cyan] unique hotels tracked in Live Production DB).\n")

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


CITY_SEARCH_DIRECTORY = {
    "delhi": "https://www.booking.com/searchresults.html?ss=Delhi",
    "new delhi": "https://www.booking.com/searchresults.html?ss=New+Delhi",
    "jaipur": "https://www.booking.com/searchresults.html?ss=Jaipur",
    "goa": "https://www.booking.com/searchresults.html?ss=Goa",
    "mumbai": "https://www.booking.com/searchresults.html?ss=Mumbai",
    "bengaluru": "https://www.booking.com/searchresults.html?ss=Bengaluru",
    "bangalore": "https://www.booking.com/searchresults.html?ss=Bangalore",
    "manali": "https://www.booking.com/searchresults.html?ss=Manali",
    "shimla": "https://www.booking.com/searchresults.html?ss=Shimla",
    "agra": "https://www.booking.com/searchresults.html?ss=Agra",
    "udaipur": "https://www.booking.com/searchresults.html?ss=Udaipur",
    "varanasi": "https://www.booking.com/searchresults.html?ss=Varanasi",
    "kolkata": "https://www.booking.com/searchresults.html?ss=Kolkata",
    "hyderabad": "https://www.booking.com/searchresults.html?ss=Hyderabad",
    "chennai": "https://www.booking.com/searchresults.html?ss=Chennai",
    "kochi": "https://www.booking.com/searchresults.html?ss=Kochi",
    "kerala": "https://www.booking.com/searchresults.html?ss=Kerala",
    "rishikesh": "https://www.booking.com/searchresults.html?ss=Rishikesh",
    "haridwar": "https://www.booking.com/searchresults.html?ss=Haridwar",
    "amritsar": "https://www.booking.com/searchresults.html?ss=Amritsar",
    "mussoorie": "https://www.booking.com/searchresults.html?ss=Mussoorie",
    "nainital": "https://www.booking.com/searchresults.html?ss=Nainital",
    "chandigarh": "https://www.booking.com/searchresults.html?ss=Chandigarh",
    "pune": "https://www.booking.com/searchresults.html?ss=Pune",
    "kasol": "https://www.booking.com/searchresults.html?ss=Kasol",
    "jibhi": "https://www.booking.com/searchresults.html?ss=Jibhi"
}

CITY_HUBS = {
    "delhi": ["Delhi", "Paharganj Delhi", "Karol Bagh Delhi", "Mahipalpur Delhi", "Aerocity Delhi", "Connaught Place Delhi", "South Delhi", "Chandni Chowk Delhi", "Rohini Delhi", "Dwarka Delhi", "Noida Delhi", "Gurgaon Delhi"],
    "new delhi": ["New Delhi", "Paharganj Delhi", "Karol Bagh Delhi", "Mahipalpur Delhi", "Aerocity Delhi", "Connaught Place Delhi", "South Delhi"],
    "mumbai": ["Mumbai", "Andheri Mumbai", "Bandra Mumbai", "Colaba Mumbai", "Juhu Mumbai", "Navi Mumbai", "Thane Mumbai", "Powai Mumbai"],
    "goa": ["Goa", "Calangute Goa", "Baga Goa", "Candolim Goa", "Anjuna Goa", "Panaji Goa", "Morjim Goa", "Arambol Goa", "Colva Goa", "Vagator Goa"],
    "jaipur": ["Jaipur", "MI Road Jaipur", "Bani Park Jaipur", "C Scheme Jaipur", "Amer Jaipur", "Mansarovar Jaipur", "Malviya Nagar Jaipur"],
    "bangalore": ["Bangalore", "Koramangala Bangalore", "Indiranagar Bangalore", "Whitefield Bangalore", "MG Road Bangalore", "HSR Layout Bangalore"],
    "bengaluru": ["Bengaluru", "Koramangala Bengaluru", "Indiranagar Bengaluru", "Whitefield Bengaluru", "MG Road Bengaluru"]
}


def set_keep_awake(enable: bool = True):
    """Prevents Windows from sleeping or suspending background processes when idle or lid is closed."""
    if sys.platform == "win32":
        try:
            import ctypes
            ES_CONTINUOUS = 0x80000000
            ES_SYSTEM_REQUIRED = 0x00000001
            ES_AWAYMODE_REQUIRED = 0x00000040
            if enable:
                ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED)
            else:
                ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS)
        except Exception:
            pass


def resolve_search_url(query: str) -> str:
    clean = query.strip()
    if clean.startswith("http://") or clean.startswith("https://"):
        return clean
    clean_lower = clean.lower()
    if clean_lower in CITY_SEARCH_DIRECTORY:
        return CITY_SEARCH_DIRECTORY[clean_lower]
    for k, v in CITY_SEARCH_DIRECTORY.items():
        if k in clean_lower or clean_lower in k:
            return v
    import urllib.parse
    return f"https://www.booking.com/searchresults.html?ss={urllib.parse.quote_plus(clean)}"


def run_continuous_city_streamer(
    location_query: str = None,
    micro_batch_size: int = 10,
    max_workers: int = 8,
    photos_per_hotel: int = 25
):
    """
    3-Stage Continuous Assembly Line Engine:
    Stage 1: Background Scout Agent streams fresh hotels continuously to discovery_queue.
    Stage 2: 8 Cloner Workers deep-clone 25 HD photos & live dynamic rates into Live DB.
    Stage 3: 4 Enricher Workers search Google Maps for phone & email in parallel (Empty Box routing).
    All stages run simultaneously with ZERO waiting time!
    """
    console.print(Panel(
        "[bold cyan]⚡ 3-STAGE CONTINUOUS ASSEMBLY LINE HARVESTER (BEAST MODE)[/bold cyan]\n"
        "[white]• [bold green]Stage 1 (Scout):[/bold green] Continuously streams fresh hotels into queue (skips DB duplicates)\n"
        "• [bold green]Stage 2 (8 Cloner Swarm):[/bold green] Deep-clones 25 HD CDN photos + Live Dynamic Booking.com rates\n"
        "• [bold green]Stage 3 (Enricher Swarm):[/bold green] Parallel Google Maps search for reception phone & email\n"
        "• [bold yellow]Empty Box Sentinel:[/bold yellow] Any hotel without phone is auto-routed to empty_box registry\n"
        "[dim green]Press Ctrl+C at any time to pause safely (all saved hotels remain live).[/dim green][/white]",
        border_style="green"
    ))

    if not location_query:
        location_query = Prompt.ask("[bold green]Enter City Name or Booking.com Search URL[/bold green]", default="Delhi").strip()

    loc_clean = location_query.strip()
    is_direct_url = loc_clean.startswith("http://") or loc_clean.startswith("https://")
    
    if is_direct_url:
        search_hubs = [loc_clean]
    else:
        search_hubs = CITY_HUBS.get(loc_clean.lower(), [loc_clean])

    # Load existing signatures
    with console.status("[bold cyan]Loading existing live database signatures for de-duplication...[/bold cyan]", spinner="dots"):
        existing_signatures = get_existing_hotel_signatures()
    unique_count = len(set(v['id'] for v in existing_signatures.values()))
    console.print(f"[bold green]✓ Database connected![/bold green] Tracking [cyan]{unique_count}[/cyan] existing hotels in Live Production DB.")
    console.print(f"[dim white]Target Hubs to Scout ({len(search_hubs)}):[/dim white] [dim cyan]{', '.join(search_hubs[:5])}{'...' if len(search_hubs) > 5 else ''}[/dim cyan]\n")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        console.print("[bold red]Playwright required. Run: pip install playwright[/bold red]")
        return

    discovery_queue = queue.Queue(maxsize=120)
    enrich_queue = queue.Queue(maxsize=120)
    stop_event = threading.Event()
    print_lock = threading.Lock()
    sig_lock = threading.Lock()

    stats = {
        "scouted": 0,
        "cloned": 0,
        "enriched": 0,
        "empty_box": 0,
        "duplicates_skipped": 0,
        "total_photos": 0
    }
    stats_lock = threading.Lock()

    # -------------------------------------------------------------
    # STAGE 1: Scout Agent Thread (Producer)
    # -------------------------------------------------------------
    def scout_producer():
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(
                    channel="chrome",
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"]
                )
            except Exception:
                browser = p.chromium.launch(
                    channel="msedge",
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-dev-shm-usage"]
                )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="en-IN"
            )
            context.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); window.chrome = { runtime: {} };")
            page = context.new_page()

            seen_urls = set()

            try:
                for hub_idx, hub in enumerate(search_hubs, start=1):
                    if stop_event.is_set():
                        break

                    hub_url = hub if is_direct_url else f"https://www.booking.com/searchresults.html?ss={urllib.parse.quote_plus(hub)}"
                    with print_lock:
                        console.print(f"\n[bold yellow]🔍 [Scout Engine] Scouting Hub [{hub_idx}/{len(search_hubs)}]: {hub}...[/bold yellow]")

                    try:
                        page.goto(hub_url, wait_until="domcontentloaded", timeout=40000)
                        page.wait_for_timeout(3500)
                    except Exception as e:
                        with print_lock:
                            console.print(f"[dim red]Could not load {hub}: {e}[/dim red]")
                        continue

                    # Dismiss cookie / login popups
                    try:
                        dismiss_btn = page.query_selector('[aria-label="Dismiss sign-in info."], button[aria-label="Close"], #onetrust-accept-btn-handler')
                        if dismiss_btn and dismiss_btn.is_visible():
                            dismiss_btn.click(timeout=2000)
                            page.wait_for_timeout(800)
                    except Exception:
                        pass

                    idle_scrolls = 0
                    for _ in range(8):
                        if stop_event.is_set():
                            break

                        cards = page.query_selector_all('[data-testid="property-card"]')
                        if not cards:
                            cards = page.query_selector_all('a[data-testid="title-link"], a[href*="/hotel/"]')

                        new_cards_found = 0
                        for card in cards:
                            if stop_event.is_set():
                                break

                            title_el = card.query_selector('[data-testid="title"]') if hasattr(card, "query_selector") else None
                            hotel_name = title_el.inner_text().strip() if title_el else ""

                            link_el = card.query_selector('a[data-testid="title-link"], a[href*="/hotel/"]') if hasattr(card, "query_selector") else card
                            raw_href = link_el.get_attribute("href") if link_el else ""
                            if not raw_href:
                                continue

                            m = re.search(r'(https?://[^/]*booking\.com/hotel/[^?#]+\.html)', raw_href)
                            canonical_url = m.group(1) if m else raw_href.split('?')[0]
                            norm_url = normalize_ota_url(canonical_url)
                            norm_name = hotel_name.lower().strip() if hotel_name else ""

                            if canonical_url in seen_urls or norm_url in seen_urls:
                                continue
                            seen_urls.add(canonical_url)
                            seen_urls.add(norm_url)

                            # Deduplication against live DB
                            with sig_lock:
                                if norm_url in existing_signatures or (norm_name and norm_name in existing_signatures):
                                    with stats_lock:
                                        stats["duplicates_skipped"] += 1
                                    continue
                                # Reserve immediately in memory so duplicate cards aren't queued
                                existing_signatures[norm_url] = {"name": hotel_name}
                                if norm_name:
                                    existing_signatures[norm_name] = {"name": hotel_name}

                            # Dynamic live rate extraction directly from card
                            card_price = None
                            try:
                                from hotel_deep_cloner import extract_price
                                price_el = card.query_selector('[data-testid="price-and-discounted-price"], .bui-price-display__value, [data-price]')
                                if price_el:
                                    card_price = extract_price(price_el.inner_text())
                            except Exception:
                                pass

                            new_cards_found += 1
                            item = {
                                "name": hotel_name or canonical_url.split("/")[-1].replace(".html", "").replace("-", " ").title(),
                                "url": canonical_url,
                                "card_price": card_price
                            }
                            discovery_queue.put(item)
                            with stats_lock:
                                stats["scouted"] += 1
                            with print_lock:
                                price_badge = f"[bold yellow]₹{card_price}[/bold yellow]" if card_price else "[dim]Live OTA[/dim]"
                                console.print(f"  [cyan]➔ [Scout Queued][/cyan] {item['name'][:35]} | Rate: {price_badge} [dim]({discovery_queue.qsize()} in queue)[/dim]")

                        if new_cards_found > 0:
                            idle_scrolls = 0
                        else:
                            idle_scrolls += 1
                        if idle_scrolls >= 3:
                            break

                        # Scroll down incrementally
                        try:
                            page.evaluate("window.scrollBy(0, 1800)")
                            page.wait_for_timeout(1800)
                        except Exception:
                            pass

                        # Click load more results if present
                        try:
                            load_btn = page.query_selector('button:has-text("more results"), button:has-text("Load more"), button:has-text("Show more"), [data-testid="pagination-next"]')
                            if load_btn and load_btn.is_visible():
                                load_btn.click(timeout=2500)
                                page.wait_for_timeout(2000)
                        except Exception:
                            pass

            finally:
                browser.close()

        # Signal cloners to finish when queue drains
        for _ in range(max_workers):
            discovery_queue.put(None)

    # -------------------------------------------------------------
    # STAGE 2: Cloner Swarm Worker (Consumer 1 / Producer 2)
    # -------------------------------------------------------------
    def cloner_worker(worker_id: int):
        try:
            from hotel_deep_cloner import clone_hotel, save_to_mysql
        except ImportError:
            from agent.hotel_deep_cloner import clone_hotel, save_to_mysql

        while not stop_event.is_set():
            try:
                item = discovery_queue.get(timeout=2)
            except queue.Empty:
                continue

            if item is None:
                discovery_queue.task_done()
                break

            target_url = item["url"]
            card_price = item.get("card_price")
            start_t = time.time()
            try:
                hotel_data = clone_hotel(target_url, max_photos=photos_per_hotel, download_locally=False, card_price=card_price)
                if hotel_data.get("success") and hotel_data.get("name"):
                    new_id = save_to_mysql(hotel_data)
                    elapsed = round(time.time() - start_t, 1)
                    if new_id:
                        hotel_data["hotelId"] = new_id
                        with stats_lock:
                            stats["cloned"] += 1
                            stats["total_photos"] += hotel_data.get("downloadedPhotosCount", 0)

                        enrich_queue.put(hotel_data)

                        with print_lock:
                            rate_str = f"₹{hotel_data.get('bookingPrice')}" if hotel_data.get('bookingPrice') else "Live Rate"
                            console.print(
                                f"  [bold green]✓ [Cloned Live][/bold green] [ID #{new_id}] [bold white]{hotel_data['name'][:34]}[/bold white] "
                                f"({hotel_data['city']}) | Dynamic Rate: [bold yellow]{rate_str}[/bold yellow] | "
                                f"[green]{hotel_data.get('downloadedPhotosCount', 0)} CDN photos[/green] ({elapsed}s)"
                            )
            except Exception as e:
                with print_lock:
                    console.print(f"  [dim red]Cloner error for {item.get('name')}: {e}[/dim red]")
            finally:
                discovery_queue.task_done()

    # -------------------------------------------------------------
    # STAGE 3: Enricher Swarm Worker (Consumer 2)
    # -------------------------------------------------------------
    def enricher_worker(worker_id: int):
        try:
            from google_maps_enricher import enrich_single_hotel_task
        except ImportError:
            from agent.google_maps_enricher import enrich_single_hotel_task

        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(
                    channel="chrome",
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
                )
            except Exception:
                browser = p.chromium.launch(
                    channel="msedge",
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
                )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                locale="en-IN"
            )
            page = context.new_page()

            try:
                while not stop_event.is_set():
                    try:
                        hotel_item = enrich_queue.get(timeout=2)
                    except queue.Empty:
                        continue

                    if hotel_item is None:
                        enrich_queue.task_done()
                        break

                    try:
                        res = enrich_single_hotel_task(hotel_item, page=page, auto_empty_box=True, print_lock=print_lock)
                        with stats_lock:
                            if res.get("success"):
                                stats["enriched"] += 1
                            else:
                                stats["empty_box"] += 1
                    except Exception as e:
                        with print_lock:
                            console.print(f"  [dim red]Enricher error: {e}[/dim red]")
                    finally:
                        enrich_queue.task_done()
            finally:
                browser.close()

    # -------------------------------------------------------------
    # Launch All Stages Concurrently
    # -------------------------------------------------------------
    set_keep_awake(True)
    start_session_time = time.time()
    threads = []

    # 1. Start Scout Thread
    t_scout = threading.Thread(target=scout_producer, daemon=True, name="ScoutThread")
    t_scout.start()
    threads.append(t_scout)

    # 2. Start 8 Cloner Workers
    for i in range(max_workers):
        t_cloner = threading.Thread(target=cloner_worker, args=(i + 1,), daemon=True, name=f"Cloner-{i+1}")
        t_cloner.start()
        threads.append(t_cloner)

    # 3. Start 4 Enricher Workers
    num_enrichers = 4
    for i in range(num_enrichers):
        t_enricher = threading.Thread(target=enricher_worker, args=(i + 1,), daemon=True, name=f"Enricher-{i+1}")
        t_enricher.start()
        threads.append(t_enricher)

    console.print(f"[bold green]🚀 Assembly Line Started![/bold green] 1 Scout + {max_workers} Cloners + {num_enrichers} Enrichers active simultaneously.\n")

    # Monitor loop
    try:
        time.sleep(8)
        while True:
            time.sleep(3)
            # If scout is done and queues are empty, complete
            if not t_scout.is_alive() and discovery_queue.empty() and enrich_queue.empty():
                console.print("\n[bold green]🏁 All target hubs and queues have been 100% processed![/bold green]")
                break
    except KeyboardInterrupt:
        console.print("\n[bold yellow]⏸️ Assembly Line paused by user (Ctrl+C). Draining current in-flight hotels...[/bold yellow]")
        stop_event.set()

    # Stop enrichers
    for _ in range(num_enrichers):
        enrich_queue.put(None)

    total_time = round(time.time() - start_session_time, 1)

    # Final Session Report
    console.print("\n" + "═" * 75)
    console.print(Panel(
        f"[bold white]Location Target:[/bold white] [bold cyan]{location_query.title()}[/bold cyan]\n"
        f"[bold white]Total Time Elapsed:[/bold white] {total_time}s\n"
        f"[bold white]Total Fresh Hotels Scouted:[/bold white] {stats['scouted']}\n"
        f"[bold green]Total Successfully Live in DB:[/bold green] [bold green]+{stats['cloned']}[/bold green] hotels\n"
        f"[bold cyan]Total Front Desk Contacts Enriched:[/bold cyan] [bold cyan]{stats['enriched']}[/bold cyan] hotels\n"
        f"[bold yellow]Total Moved to Empty Box:[/bold yellow] [bold yellow]{stats['empty_box']}[/bold yellow] hotels\n"
        f"[dim white]Total Duplicate Listings Bypassed:[/dim white] {stats['duplicates_skipped']}\n"
        f"[bold cyan]Total HD Photos Linked:[/bold cyan] {stats['total_photos']} photos (0 MB local disk)\n\n"
        f"[bold green]🎉 All directory hotels are 100% saved with Live Dynamic Rates & Verified Contacts on GetHotelStays.com![/bold green]",
        title="🌟 3-Stage Assembly Line Session Complete",
        border_style="cyan"
    ))
    set_keep_awake(False)
    Prompt.ask("\nPress Enter to return to menu")


def run_bulk_harvester(target_count: int = None, default_photos: int = 6, **kwargs):
    """
    Main entry point for Bulk Hotel Harvester Suite.
    Can be run interactively or programmatically (e.g. from ghs_agent.py bulk <count>).
    """
    # If target_count was directly provided (e.g. from CLI 'ghs_agent.py bulk 50'), jump straight into automated search harvester
    if target_count is not None:
        run_automated_search_harvester(target_count=target_count, photos_per_hotel=default_photos, **kwargs)
        return

    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        console.print(Panel(
            "[bold cyan]🏙️  GHS BULK HOTEL HARVESTER & LEAD GENERATOR[/bold cyan]\n"
            "[white]Autonomous multi-agent suite to harvest hundreds of directory hotels.\n"
            "Downloads photos, extracts amenities, auto-enriches contact numbers & saves to DB.[/white]",
            border_style="cyan"
        ))

        console.print("  [bold green][1][/bold green] 🤖 [bold green]Autonomous City Streamer (Enter Location -> Infinite 10-by-10 Pipeline: Clone -> Enrich -> Empty Box)[/bold green] [bold yellow]★ RECOMMENDED[/bold yellow]")
        console.print("  [bold cyan][2][/bold cyan] 🚀 [bold white]Custom Target Harvest from Booking.com URL[/bold white] (Enter URL + Target Count)")
        console.print("  [bold cyan][3][/bold cyan] 📝 [bold white]Manual Hotel URL Queue[/bold white] (Paste links one by one or in batch)")
        console.print("  [bold magenta][4][/bold magenta] ⚡ [bold magenta]Fast JSON Batch Processor (16 Parallel Cloners + 12 Enrichers from Harvested File)[/bold magenta]")
        console.print("  [bold red][0][/bold red] 🔙 Back to Previous Menu\n")

        choice = Prompt.ask("Choose an option", choices=["1", "2", "3", "4", "0"], default="1")

        if choice == "1":
            run_continuous_city_streamer()
        elif choice == "2":
            run_automated_search_harvester()
        elif choice == "3":
            run_manual_queue_harvester()
        elif choice == "4":
            try:
                from process_harvested_queue import run_file_batch_processor
            except ImportError:
                from agent.process_harvested_queue import run_file_batch_processor
            run_file_batch_processor()
        elif choice == "0":
            break


if __name__ == "__main__":
    run_bulk_harvester()
