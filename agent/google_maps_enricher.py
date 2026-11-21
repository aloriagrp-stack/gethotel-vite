"""
Google Maps Contact Enricher for GetHotelStays Directory Hotels
Extracts Reception Phone Numbers, Official Websites, and Emails from Google Maps
and synchronizes updates to both Localhost and Live Production MySQL databases.
"""

import os
import sys
import re
import time
import json
import urllib.parse
from datetime import datetime
import pymysql
import requests
from bs4 import BeautifulSoup
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm

console = Console()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
EMPTY_BOX_DIR = os.path.join(PROJECT_ROOT, "empty_box")
import threading
EMPTY_BOX_LOCK = threading.Lock()

# Database Configs
LOCAL_DB = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "vgyuvmpi_gethotel_db",
    "port": 3306,
    "charset": "utf8mb4",
    "connect_timeout": 5
}

LIVE_DB = {
    "host": "103.108.220.145",
    "user": "vgyuvmpi_gethotel_db",
    "password": "shriyanshking",
    "database": "vgyuvmpi_gethotel_db",
    "port": 3306,
    "charset": "utf8mb4",
    "connect_timeout": 8,
    "read_timeout": 10,
    "write_timeout": 10
}


def disable_quickedit():
    """Prevents Windows Console from freezing when user clicks inside terminal."""
    if sys.platform == "win32":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            hStdin = kernel32.GetStdHandle(-10)
            mode = ctypes.c_ulong()
            kernel32.GetConsoleMode(hStdin, ctypes.byref(mode))
            mode.value &= ~0x0040
            mode.value |= 0x0080
            kernel32.SetConsoleMode(hStdin, mode)
        except Exception:
            pass


def clean_phone_number(raw_phone: str) -> str:
    """Format phone numbers cleanly into Indian standard format."""
    if not raw_phone:
        return ""
    # Remove non-digits except +
    cleaned = re.sub(r'[^\d+]', '', raw_phone.strip())
    # 098... -> +91 98...
    if cleaned.startswith("0") and len(cleaned) == 11 and cleaned[1] in "6789":
        return f"+91 {cleaned[1:6]} {cleaned[6:]}"
    if cleaned.startswith("+91") and len(cleaned) == 13:
        return f"+91 {cleaned[3:8]} {cleaned[8:]}"
    if len(cleaned) == 10 and cleaned[0] in "6789":
        return f"+91 {cleaned[:5]} {cleaned[5:]}"
    if cleaned.startswith("011") and len(cleaned) >= 10:
        return f"011-{cleaned[3:]}"
    return raw_phone.strip()


def extract_email_from_website(website_url: str) -> str:
    """Visits website homepage and contact page to locate official email."""
    if not website_url or not website_url.startswith("http"):
        return ""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        res = requests.get(website_url, headers=headers, timeout=6)
        if res.status_code != 200:
            return ""
        
        soup = BeautifulSoup(res.text, "html.parser")
        # Check mailto: links first
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.startswith("mailto:"):
                clean = href.replace("mailto:", "").split("?")[0].strip()
                if "@" in clean and not any(x in clean.lower() for x in ["example", "domain", "wix"]):
                    return clean
        
        # Fallback to regex in page text
        emails = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', res.text)
        for e in emails:
            e_lower = e.lower()
            if not any(x in e_lower for x in [".png", ".jpg", ".webp", "sentry", "example", "wix", "cloudflare", "bootstrap"]):
                return e
    except Exception:
        pass
    return ""


def get_db_hotels(only_missing=True):
    """Fetches directory hotels directly from Live Production MariaDB with retry."""
    conn = None
    for attempt in range(1, 4):
        try:
            conn = pymysql.connect(**LIVE_DB)
            break
        except Exception as e:
            if attempt == 3:
                console.print(f"[bold red]❌ Could not connect to Live MySQL database: {e}[/bold red]")
                return []
            time.sleep(1)

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            sql = "SELECT id, name, city, address, contactPhone, contactEmail, websiteUrl, bookingUrl, bookingPrice, pricePerNight, thumbnail, description, amenities, listingType FROM hotel WHERE listingType = 'directory'"
            if only_missing:
                sql += " AND (contactPhone IS NULL OR contactPhone = '')"
            sql += " ORDER BY id ASC"
            cur.execute(sql)
            return cur.fetchall()
    except Exception as e:
        console.print(f"[bold red]❌ Query error: {e}[/bold red]")
        return []
    finally:
        if conn:
            conn.close()


_SHARED_DB_CONN = None

def get_shared_db_conn():
    global _SHARED_DB_CONN
    if _SHARED_DB_CONN is not None:
        try:
            _SHARED_DB_CONN.ping(reconnect=True)
            return _SHARED_DB_CONN
        except Exception:
            try:
                _SHARED_DB_CONN.close()
            except Exception:
                pass
            _SHARED_DB_CONN = None

    try:
        _SHARED_DB_CONN = pymysql.connect(**LIVE_DB)
        return _SHARED_DB_CONN
    except Exception:
        return None


def save_hotel_contact_to_dbs(hotel_id: int, hotel_name: str, city: str, phone: str, email: str, website: str) -> dict:
    """Updates contact details strictly in Live Production MariaDB using persistent fast socket."""
    results = {"local": False, "live": False}
    update_fields = []
    params = []
    if phone:
        update_fields.append("contactPhone = %s")
        params.append(phone)
    if email:
        update_fields.append("contactEmail = %s")
        params.append(email)
    if website:
        update_fields.append("websiteUrl = %s")
        params.append(website)

    if not update_fields:
        return results

    update_fields.append("updatedAt = NOW()")

    # Update Live DB strictly using persistent connection
    for attempt in range(1, 4):
        try:
            db_conn = get_shared_db_conn()
            if not db_conn:
                time.sleep(1)
                continue
            live_params = list(params) + [hotel_name, city, hotel_id]
            live_query = f"UPDATE hotel SET {', '.join(update_fields)} WHERE (name = %s AND city = %s) OR id = %s"
            with db_conn.cursor() as cur:
                cur.execute(live_query, tuple(live_params))
            db_conn.commit()
            results["live"] = True
            break
        except Exception as e:
            if attempt == 3:
                console.print(f"  [dim yellow]Live DB Notice: {e}[/dim yellow]")
            time.sleep(1)

    return results


def move_to_empty_box(unfound_hotels: list):
    """Saves full profile details of hotels whose contact numbers could not be found to the empty_box folder."""
    if not unfound_hotels:
        return

    with EMPTY_BOX_LOCK:
        os.makedirs(EMPTY_BOX_DIR, exist_ok=True)
        json_path = os.path.join(EMPTY_BOX_DIR, "empty_box_registry.json")
        report_path = os.path.join(EMPTY_BOX_DIR, "unfound_hotels_report.md")

        # Load existing registry if any to merge without duplicates
        existing_registry = {}
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            k = str(item.get("id")) if item.get("id") else item.get("name")
                            existing_registry[k] = item
            except Exception:
                pass

        # Merge newly unfound hotels
        for h in unfound_hotels:
            hotel_entry = {
                "id": h.get("id"),
                "name": h.get("name"),
                "city": h.get("city"),
                "address": h.get("address") or "N/A",
                "bookingUrl": h.get("bookingUrl") or "",
                "bookingPrice": h.get("bookingPrice") or h.get("pricePerNight"),
                "pricePerNight": h.get("pricePerNight"),
                "thumbnail": h.get("thumbnail") or "",
                "description": h.get("description") or "",
                "amenities": h.get("amenities") or "[]",
                "listingType": h.get("listingType", "directory"),
                "status": "UNRESOLVED_CONTACT",
                "reason": "Reception contact phone could not be extracted from Google Maps or Web search",
                "addedToEmptyBoxAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            k = str(h.get("id")) if h.get("id") else h.get("name")
            existing_registry[k] = hotel_entry

        # Save JSON registry
        registry_list = list(existing_registry.values())
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(registry_list, f, indent=2, ensure_ascii=False)

        # Save Markdown Report with clickable links
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# 📦 Empty Box — Unresolved Directory Hotels\n\n")
            f.write(f"Total Unresolved Properties: **{len(registry_list)}**  \n")
            f.write(f"Last Updated: **{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}**\n\n")
            f.write("| ID | Hotel Name | City | Starting Price | Booking.com URL |\n")
            f.write("| :--- | :--- | :--- | :--- | :--- |\n")
            for item in registry_list:
                b_link = f"[Open Listing ↗]({item['bookingUrl']})" if item.get('bookingUrl') else "N/A"
                price_str = f"₹{item.get('bookingPrice')}" if item.get('bookingPrice') else "N/A"
                f.write(f"| #{item.get('id')} | **{item.get('name')}** | {item.get('city')} | {price_str} | {b_link} |\n")

            f.write("\n---\n\n## 📋 Detailed Property Profiles & Manual Follow-Up\n\n")
            for item in registry_list:
                f.write(f"### #{item.get('id')} — {item.get('name')}\n")
                f.write(f"- **City:** {item.get('city')}\n")
                f.write(f"- **Full Address:** {item.get('address') or 'N/A'}\n")
                f.write(f"- **Booking.com Link:** {item.get('bookingUrl') or 'N/A'}\n")
                f.write(f"- **Starting Room Rate:** ₹{item.get('bookingPrice') or 'N/A'} /night\n")
                if item.get('thumbnail'):
                    f.write(f"- **Cover Photo:** {item.get('thumbnail')}\n")
                if item.get('description'):
                    f.write(f"- **Description:** {item.get('description')[:250]}...\n")
                f.write(f"- **Logged In Empty Box At:** {item.get('addedToEmptyBoxAt')}\n\n")

    console.print(Panel(
        f"[bold green]📦 SUCCESS: {len(unfound_hotels)} hotel(s) moved to the Empty Box![/bold green]\n"
        f"[white]Full profiles, booking links, and address details saved to:[/white]\n"
        f"  📁 [bold cyan]empty_box/empty_box_registry.json[/bold cyan]\n"
        f"  📁 [bold cyan]empty_box/unfound_hotels_report.md[/bold cyan]",
        border_style="green"
    ))


def clear_terminal():
    """Completely wipes Windows conhost / CMD buffer cleanly."""
    os.system('cls' if os.name == 'nt' else 'clear')


def clean_hotel_search_query(name: str, addr: str = "", city: str = "Delhi") -> str:
    """Strips OTA booking keywords, promos, award fluff and extracts clean hotel name + locality."""
    # Convert standalone ' I ' used as delimiter into dash
    clean_name = re.sub(r'\s+[I|]\s+', ' - ', name)

    # 1. Cut off marketing taglines after delimiters
    core = re.split(r'[-–—:|\(]', clean_name)[0].strip()
    words = core.split()
    clean_words = []
    for w in words:
        if w.lower() in ['award', 'winning', 'complimentary', 'traveller', "traveller's", 'traveler', 'traveler\'s']:
            break
        clean_words.append(w)
    core = " ".join(clean_words[:6])

    # Strip remaining junk promo words
    remove_words = [
        'with free airport transport', 'free airport transport', 'free airport shuttle', 'free shuttle',
        'a luxury hotel', 'luxury hotel', 'near new delhi railway station and city center',
        'near new delhi railway station', 'near connaught place', 'in city centre at new delhi',
        'in city centre', 'near igi delhi airport', 'near delhi igi airport', 'near igi airport',
        'delhi airport', 'terminel-3 hotel near d', 'terminal-3 igi airport', 'terminel-3', 'terminal 3',
        'with luxury restaurant', 'luxury sky deck & terrace', 'near rajori metro', 'free cancellation',
        'by rcg hotels', 'by jmd group', 'by m s hospitality'
    ]
    for w in remove_words:
        core = re.sub(re.escape(w), ' ', core, flags=re.IGNORECASE)
    core = re.sub(r'[^a-zA-Z0-9\s]', ' ', core)
    core = " ".join(core.split())

    # Locality priority list (longer first)
    loc_list = [
        "Greater Noida", "Connaught Place", "Karol Bagh", "Vasant Kunj", "South Delhi",
        "Aerocity", "Mahipalpur", "Paharganj", "Rohini", "Dwarka", "Noida", "Gurugram",
        "Gurgaon", "Panipat", "Faridabad", "Ghaziabad"
    ]
    locality = ""
    combined_str = (name + " " + addr).lower()
    for loc in loc_list:
        if loc.lower() in combined_str:
            locality = loc
            break

    parts = [core]
    if locality and locality.lower() not in core.lower():
        parts.append(locality)
    if city and city.lower() not in core.lower() and city.lower() not in locality.lower():
        parts.append(city)

    return " ".join(parts).strip()


def run_enricher(limit: int = None, hotel_id_filter: int = None, hotel_id_list: list = None, auto_empty_box: bool = False, clear_screen_on_start: bool = True):
    """Main enrichment workflow using Playwright with stealth Chrome."""
    if clear_screen_on_start:
        clear_terminal()
    console.print(Panel(
        "[bold cyan]GOOGLE MAPS & SEARCH DIRECTORY HOTEL CONTACT ENRICHER[/bold cyan]\n"
        "[dim]Auto-scrapes verified reception phone numbers, emails & official websites\n"
        "Synchronizes directly with Localhost (127.0.0.1) & Live Production (103.108.220.145)[/dim]",
        border_style="cyan"
    ))

    if hotel_id_list:
        all_hotels = get_db_hotels(only_missing=False)
        id_set = set(hotel_id_list)
        hotels = [h for h in all_hotels if h["id"] in id_set]
    elif hotel_id_filter:
        all_hotels = get_db_hotels(only_missing=False)
        hotels = [h for h in all_hotels if h["id"] == hotel_id_filter]
    else:
        hotels = get_db_hotels(only_missing=True)

    if not hotels:
        console.print("[bold green]✓ All directory hotels already have front desk contact numbers assigned![/bold green]")
        return

    if limit and limit > 0:
        hotels = hotels[:limit]

    console.print(f"[bold yellow]Found {len(hotels)} directory hotel(s) to check.[/bold yellow]\n")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        console.print("[bold red]❌ Playwright not found. Run: pip install playwright[/bold red]")
        return

    enriched_count = 0
    unfound_hotels = []

    common_args = [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-dev-shm-usage",
        "--js-flags=--max-old-space-size=128"
    ]
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                channel="chrome",
                headless=True,
                args=common_args
            )
        except Exception:
            try:
                browser = p.chromium.launch(
                    channel="msedge",
                    headless=True,
                    args=common_args
                )
            except Exception as e:
                console.print(f"[bold red]❌ Could not launch system Chrome or Edge: {e}[/bold red]")
                return

        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-IN"
        )
        page = None

        for idx, hotel in enumerate(hotels, 1):
            disable_quickedit()
            h_id = hotel["id"]
            h_name = hotel["name"]
            h_city = hotel.get("city") or "Delhi"
            h_addr = hotel.get("address") or ""

            search_kw = clean_hotel_search_query(h_name, h_addr, h_city)
            short_name = (h_name[:38] + '..') if len(h_name) > 40 else h_name
            console.print(f"[{idx}/{len(hotels)}] [bold white]#{h_id:<3d} {short_name:<40}[/bold white] ➔", end=" ")

            phone = ""
            website = ""
            email = ""

            # Recycle Chrome tab every 5 hotels to completely purge Google Maps memory leaks
            if page is None or page.is_closed() or (idx % 5 == 1):
                try:
                    if page and not page.is_closed():
                        page.close()
                except Exception:
                    pass
                try:
                    page = context.new_page()
                except Exception:
                    time.sleep(1)
                    page = context.new_page()

            # ----------------------------------------------------
            # TIER 1: Google Maps Place Search (Primary & Direct)
            # ----------------------------------------------------
            try:
                maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote(search_kw)}"
                page.goto(maps_url, wait_until="domcontentloaded", timeout=9000)
                page.wait_for_timeout(2500)

                first_card = page.query_selector('div.Nv2PK, [role="article"], a.hfpxzc')
                if first_card:
                    try:
                        first_card.click(timeout=2000)
                        page.wait_for_timeout(2000)
                    except Exception:
                        pass

                # Extract Phone directly from Google Maps Place button
                phone_btn = page.query_selector('[data-item-id*="phone:tel:"], button[aria-label*="Phone:"], button[data-tooltip*="phone"]')
                if phone_btn:
                    lbl = phone_btn.get_attribute("aria-label") or ""
                    m_p = re.search(r'Phone:\s*([0-9\+\s\-]+)', lbl)
                    if m_p:
                        phone = clean_phone_number(m_p.group(1))
                    else:
                        txt = phone_btn.inner_text().strip()
                        if txt:
                            phone = clean_phone_number(txt)

                if not phone:
                    content = page.content()
                    phones_tel = re.findall(r'phone:tel:([0-9\+\s\-]+)', content)
                    aria_phones = re.findall(r'Phone:\s*([0-9\+\s\-]+)', content)
                    m_candidates = phones_tel + aria_phones
                    if m_candidates:
                        phone = clean_phone_number(m_candidates[0])

                # Extract Website directly from Google Maps Place
                if not website:
                    web_btn = page.query_selector('[data-item-id="authority"], a[aria-label*="Website:"], a[data-tooltip*="website"]')
                    if web_btn and web_btn.get_attribute("href"):
                        raw_w = web_btn.get_attribute("href")
                        if "/url?q=" in raw_w:
                            raw_w = raw_w.split("/url?q=")[1].split("&")[0]
                        raw_w = urllib.parse.unquote(raw_w)
                        if not any(x in raw_w.lower() for x in ["booking.com", "makemytrip", "agoda", "tripadvisor", "google.com"]):
                            website = raw_w.split("?")[0]
            except Exception:
                try:
                    if page and not page.is_closed():
                        page.close()
                except Exception:
                    pass
                page = None

            # Fast website fallback only if phone missing and website exists
            if not phone and website:
                try:
                    w_res = requests.get(website, headers={"User-Agent": "Mozilla/5.0"}, timeout=(2.0, 3.0))
                    if w_res.status_code == 200:
                        w_soup = BeautifulSoup(w_res.text, "html.parser")
                        tel_a = w_soup.find("a", href=re.compile(r'^tel:'))
                        if tel_a and tel_a.get("href"):
                            phone = clean_phone_number(tel_a["href"].replace("tel:", "").strip())
                except Exception:
                    pass

            if phone:
                res = save_hotel_contact_to_dbs(h_id, h_name, h_city, phone, email, website)
                enriched_count += 1
                live_badge = "[green]✓ Live DB[/green]" if res.get("live") else "[yellow]Local only[/yellow]"
                console.print(f"[bold green]FOUND![/bold green] 📞 {phone} {f'🌐 {website}' if website else ''} {f'✉️ {email}' if email else ''} ({live_badge})")
            else:
                unfound_hotels.append(hotel)
                console.print("[dim text-slate-400]No phone listed on Web/Maps.[/dim text-slate-400]")

            time.sleep(0.5)

        browser.close()

    console.print(f"\n[bold green]🎉 Finished! Enriched {enriched_count} hotel(s) with front desk contacts![/bold green]")
    if unfound_hotels:
        console.print(f"[bold yellow]⚠️ Could not automatically find contacts for {len(unfound_hotels)} hotel(s).[/bold yellow]\n")
        if auto_empty_box or Confirm.ask(f"[bold cyan]Would you like to move these {len(unfound_hotels)} unfound hotel(s) to the Empty Box?[/bold cyan]", default=True):
            move_to_empty_box(unfound_hotels)


def enrich_single_hotel_task(hotel: dict, page, auto_empty_box: bool = True, print_lock=None) -> dict:
    """Enriches a single hotel dictionary using an existing Playwright page in a worker thread."""
    h_id = hotel.get("id") or hotel.get("hotelId")
    h_name = hotel.get("name") or ""
    h_city = hotel.get("city") or "Delhi"
    h_addr = hotel.get("address") or ""

    search_kw = clean_hotel_search_query(h_name, h_addr, h_city)
    phone = ""
    website = hotel.get("websiteUrl") or ""
    email = hotel.get("contactEmail") or ""

    # Tier 1: Google Web Search
    try:
        g_url = f"https://www.google.com/search?q={urllib.parse.quote(search_kw + ' contact number')}"
        try:
            page.goto(g_url, timeout=10000)
        except Exception:
            pass
        page.wait_for_timeout(1800)
        g_body = page.inner_text('body')

        g_phones = re.findall(r'(?:Phone Number:\s*|Call\s+)?((?:\+91[\-\s]?)?[6-9]\d{4}[\s\-]?\d{5}|(?:\+91[\-\s]?)?011[\s\-]?[0-9]{8}|[6-9]\d{9})', g_body)
        for ph in g_phones:
            clean_p = clean_phone_number(ph)
            raw_digits = re.sub(r'\D', '', clean_p)
            if len(raw_digits) in [10, 11, 12]:
                phone = clean_p
                break

        if not website:
            for a in page.query_selector_all('a[href^="http"]'):
                href = a.get_attribute('href')
                if href and not any(x in href.lower() for x in ['google', 'booking.com', 'makemytrip', 'agoda', 'tripadvisor', 'goibibo', 'justdial', 'youtube', 'facebook', 'instagram']):
                    website = href.split('?')[0]
                    break

        if not email:
            g_emails = [e for e in re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', g_body) if not any(x in e for x in ['google', 'sentry', 'example', 'wix'])]
            if g_emails:
                email = g_emails[0]
    except Exception:
        pass

    # Tier 2: Google Maps Places Search
    if not phone:
        try:
            maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote(search_kw)}"
            page.goto(maps_url, wait_until="domcontentloaded", timeout=12000)
            page.wait_for_timeout(2000)

            try:
                place_links = page.locator('a[href*="/maps/place/"]')
                if place_links.count() > 0:
                    place_links.first.click(timeout=2000)
                    page.wait_for_timeout(1500)
            except Exception:
                pass

            content = page.content()
            phones_tel = re.findall(r'phone:tel:([0-9\+\s\-]+)', content)
            aria_phones = re.findall(r'Phone:\s*([0-9\+\s\-]+)', content)
            m_candidates = phones_tel + aria_phones
            if m_candidates:
                phone = clean_phone_number(m_candidates[0])

            if not website:
                web_matches = re.findall(r'data-item-id="authority"[^>]*href="([^"]+)"', content)
                if web_matches:
                    raw_web = web_matches[0]
                    if "/url?q=" in raw_web:
                        raw_web = raw_web.split("/url?q=")[1].split("&")[0]
                    raw_web = urllib.parse.unquote(raw_web)
                    if not any(x in raw_web.lower() for x in ["booking.com", "makemytrip", "agoda", "tripadvisor"]):
                        website = raw_web.split("?")[0]
        except Exception:
            pass

    # Tier 3: Website Scrape
    if website:
        if not email:
            email = extract_email_from_website(website)
        if not phone:
            try:
                w_res = requests.get(website, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                if w_res.status_code == 200:
                    w_soup = BeautifulSoup(w_res.text, "html.parser")
                    tel_a = w_soup.find("a", href=re.compile(r'^tel:'))
                    if tel_a and tel_a.get("href"):
                        phone = clean_phone_number(tel_a["href"].replace("tel:", "").strip())
            except Exception:
                pass

    if phone:
        save_hotel_contact_to_dbs(h_id, h_name, h_city, phone, email, website)
        if print_lock:
            with print_lock:
                console.print(f"  [bold green]📞 ENRICHED:[/bold green] #{h_id} {h_name[:32]} ➔ [bold white]{phone}[/bold white] {f'✉️ {email}' if email else ''}")
        return {"success": True, "id": h_id, "phone": phone, "email": email, "website": website}
    else:
        if auto_empty_box:
            move_to_empty_box([hotel])
        if print_lock:
            with print_lock:
                console.print(f"  [dim yellow]📦 EMPTY BOX:[/dim yellow] #{h_id} {h_name[:32]} (No phone listed on Web/Maps)")
        return {"success": False, "id": h_id, "reason": "No phone"}


def menu():
    """Interactive command-line menu."""
    while True:
        clear_terminal()
        console.print(Panel(
            "[bold cyan]📞 GOOGLE MAPS HOTEL CONTACT ENRICHER[/bold cyan]\n"
            "[white]Finds official front desk phone numbers, emails & websites from Google Maps\n"
            "Saves directly to both Localhost and Live cPanel MariaDB.[/white]",
            border_style="cyan"
        ))

        console.print("  [bold cyan][1][/bold cyan] ⚡ Enrich First 10 Missing Hotels (Quick Test)")
        console.print("  [bold cyan][2][/bold cyan] 🚀 Enrich ALL Missing Directory Hotels (Batch Auto-Pilot)")
        console.print("  [bold cyan][3][/bold cyan] 🎯 Enrich Specific Hotel by ID")
        console.print("  [bold yellow][4][/bold yellow] 📦 View / Open Empty Box (Unresolved Hotels)")
        console.print("  [bold red][0][/bold red] 🔙 Back to Previous Menu\n")

        choice = Prompt.ask("Choose an option", choices=["1", "2", "3", "4", "0"], default="1")

        if choice == "1":
            run_enricher(limit=10)
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "2":
            run_enricher()
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "3":
            hid = Prompt.ask("Enter Hotel ID")
            if hid.isdigit():
                run_enricher(hotel_id_filter=int(hid))
            else:
                console.print("[red]Invalid ID[/red]")
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "4":
            json_path = os.path.join(EMPTY_BOX_DIR, "empty_box_registry.json")
            if os.path.exists(json_path):
                try:
                    with open(json_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    console.print(Panel(
                        f"[bold yellow]📦 EMPTY BOX CONTAINS {len(data)} UNRESOLVED HOTEL(S)[/bold yellow]\n\n" +
                        "\n".join([f"• [bold white]#{item.get('id')}[/bold white] {item.get('name')} ({item.get('city')})" for item in data[:15]]) +
                        (f"\n...and {len(data) - 15} more" if len(data) > 15 else "") +
                        f"\n\n[dim cyan]Full details & markdown report: {EMPTY_BOX_DIR}[/dim cyan]",
                        title="Empty Box Contents",
                        border_style="yellow"
                    ))
                except Exception as e:
                    console.print(f"[red]Could not read Empty Box: {e}[/red]")
            else:
                console.print("[green]✓ Empty Box is currently empty! All hotels have contacts.[/green]")
            Prompt.ask("\nPress Enter to return to menu")
        elif choice == "0":
            break


if __name__ == "__main__":
    disable_quickedit()
    if "--all" in sys.argv:
        run_enricher(auto_empty_box=True, clear_screen_on_start=False)
    elif len(sys.argv) > 1 and sys.argv[1].isdigit():
        run_enricher(limit=int(sys.argv[1]), auto_empty_box=True, clear_screen_on_start=False)
    elif "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        lim = int(sys.argv[idx + 1]) if idx + 1 < len(sys.argv) else 10
        run_enricher(limit=lim, auto_empty_box=True, clear_screen_on_start=False)
    else:
        menu()
