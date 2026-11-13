"""
Google Maps Contact Enricher for GetHotelStays Directory Hotels
Extracts Reception Phone Numbers, Official Websites, and Emails from Google Maps
and synchronizes updates to both Localhost and Live Production MySQL databases.
"""

import os
import sys
import re
import time
import urllib.parse
import pymysql
import requests
from bs4 import BeautifulSoup
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm

console = Console()

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
    "connect_timeout": 8
}


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
    """Fetches directory hotels from local MySQL (fallback to live)."""
    conn = None
    for cfg in [LOCAL_DB, LIVE_DB]:
        try:
            conn = pymysql.connect(**cfg)
            break
        except Exception:
            continue

    if not conn:
        console.print("[bold red]❌ Could not connect to either Localhost or Live MySQL database![/bold red]")
        return []

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            sql = "SELECT id, name, city, address, contactPhone, contactEmail, websiteUrl, bookingUrl FROM hotel WHERE listingType = 'directory'"
            if only_missing:
                sql += " AND (contactPhone IS NULL OR contactPhone = '')"
            sql += " ORDER BY id ASC"
            cur.execute(sql)
            return cur.fetchall()
    finally:
        conn.close()


def save_hotel_contact_to_dbs(hotel_id: int, phone: str, email: str, website: str) -> dict:
    """Updates contact details in both Localhost and Live MariaDB."""
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
    params.append(hotel_id)
    query = f"UPDATE hotel SET {', '.join(update_fields)} WHERE id = %s"

    # Local DB
    try:
        l_conn = pymysql.connect(**LOCAL_DB)
        with l_conn.cursor() as cur:
            cur.execute(query, tuple(params))
        l_conn.commit()
        l_conn.close()
        results["local"] = True
    except Exception as e:
        console.print(f"  [dim yellow]Local DB Update Notice: {e}[/dim yellow]")

    # Live DB
    try:
        live_conn = pymysql.connect(**LIVE_DB)
        with live_conn.cursor() as cur:
            cur.execute(query, tuple(params))
        live_conn.commit()
        live_conn.close()
        results["live"] = True
    except Exception as e:
        console.print(f"  [dim yellow]Live DB Update Notice: {e}[/dim yellow]")

    return results


def run_enricher(limit: int = None, hotel_id_filter: int = None):
    """Main enrichment workflow using Playwright with stealth Chrome."""
    console.print(Panel(
        "[bold cyan]GOOGLE MAPS DIRECTORY HOTEL CONTACT ENRICHER[/bold cyan]\n"
        "[dim]Auto-scrapes official reception phone numbers & website links from Google Maps\n"
        "Synchronizes directly with Localhost (127.0.0.1) & Live Production (103.108.220.145)[/dim]",
        border_style="cyan"
    ))

    hotels = get_db_hotels(only_missing=(hotel_id_filter is None))
    if hotel_id_filter:
        hotels = [h for h in hotels if h["id"] == hotel_id_filter]

    if not hotels:
        console.print("[bold green]✓ All directory hotels already have front desk contact numbers assigned![/bold green]")
        return

    if limit and limit > 0:
        hotels = hotels[:limit]

    console.print(f"[bold yellow]Found {len(hotels)} directory hotel(s) to check on Google Maps.[/bold yellow]\n")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        console.print("[bold red]❌ Playwright not found. Run: pip install playwright[/bold red]")
        return

    enriched_count = 0

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                channel="chrome",
                headless=True,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
            )
        except Exception:
            try:
                browser = p.chromium.launch(
                    channel="msedge",
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
                )
            except Exception as e:
                console.print(f"[bold red]❌ Could not launch system Chrome or Edge: {e}[/bold red]")
                return

        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-IN"
        )
        page = context.new_page()

        for idx, hotel in enumerate(hotels, 1):
            h_id = hotel["id"]
            h_name = hotel["name"]
            h_city = hotel.get("city") or "Delhi"
            h_addr = hotel.get("address") or ""

            # Extract key locality if present (e.g. Paharganj, Karol Bagh, Aerocity)
            locality = ""
            for loc in ["Paharganj", "Karol Bagh", "Mahipalpur", "Aerocity", "Rohini", "Dwarka", "Connaught Place"]:
                if loc.lower() in (h_name + " " + h_addr).lower():
                    locality = loc
                    break

            clean_name = re.sub(r'\(.*?\)', '', h_name)
            clean_name = re.sub(r'(?:near|by\s+[a-z\s]+|terminal\s*\d+).*$', '', clean_name, flags=re.IGNORECASE).strip(' -')
            query = f"{clean_name} {locality} {h_city}".strip()
            maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}"

            console.print(f"[{idx}/{len(hotels)}] [bold white]ID {h_id}: {h_name}[/bold white]...", end=" ")

            phone = ""
            website = ""
            email = ""

            try:
                page.goto(maps_url, wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(3000)

                # If Google Maps returned a list instead of single place card, click the first place
                try:
                    place_links = page.locator('a[href*="/maps/place/"]')
                    if place_links.count() > 0:
                        place_links.first.click(timeout=3000)
                        page.wait_for_timeout(2500)
                except Exception:
                    pass

                content = page.content()

                # 1. Extract phone:tel links or aria labels
                phones_tel = re.findall(r'phone:tel:([0-9\+\s\-]+)', content)
                aria_phones = re.findall(r'Phone:\s*([0-9\+\s\-]+)', content)
                candidate_phones = phones_tel + aria_phones

                if not candidate_phones:
                    # Fallback text regex
                    body_txt = page.inner_text('body')
                    candidate_phones = re.findall(r'(?:(?:\+91[\s\-]?)?[6-9][0-9]{9}|(?:011|022)[\s\-]?[0-9]{7,8})', body_txt)

                if candidate_phones:
                    phone = clean_phone_number(candidate_phones[0])

                # 2. Extract official website from authority link
                web_matches = re.findall(r'data-item-id="authority"[^>]*href="([^"]+)"', content)
                if web_matches:
                    raw_web = web_matches[0]
                    if "/url?q=" in raw_web:
                        raw_web = raw_web.split("/url?q=")[1].split("&")[0]
                    raw_web = urllib.parse.unquote(raw_web)
                    if not any(x in raw_web.lower() for x in ["booking.com", "makemytrip", "agoda", "tripadvisor"]):
                        website = raw_web.split("?")[0]

                # 3. If website found, extract email
                if website:
                    email = extract_email_from_website(website)

            except Exception as nav_err:
                console.print(f"[dim red](Lookup error: {nav_err})[/dim red]")
                continue

            if phone:
                res = save_hotel_contact_to_dbs(h_id, phone, email, website)
                enriched_count += 1
                live_badge = "[green]✓ Live DB[/green]" if res.get("live") else "[yellow]Local only[/yellow]"
                console.print(f"[bold green]FOUND![/bold green] 📞 {phone} {f'🌐 {website}' if website else ''} {f'✉️ {email}' if email else ''} ({live_badge})")
            else:
                console.print("[dim text-slate-400]No phone listed on Maps.[/dim text-slate-400]")

            time.sleep(0.8)

        browser.close()

    console.print(f"\n[bold green]🎉 Finished! Enriched {enriched_count} hotel(s) with front desk contacts![/bold green]\n")


def menu():
    """Interactive command-line menu."""
    while True:
        console.clear()
        console.print(Panel(
            "[bold cyan]📞 GOOGLE MAPS HOTEL CONTACT ENRICHER[/bold cyan]\n"
            "[white]Finds official front desk phone numbers, emails & websites from Google Maps\n"
            "Saves directly to both Localhost and Live cPanel MariaDB.[/white]",
            border_style="cyan"
        ))

        console.print("  [bold cyan][1][/bold cyan] ⚡ Enrich First 10 Missing Hotels (Quick Test)")
        console.print("  [bold cyan][2][/bold cyan] 🚀 Enrich ALL Missing Directory Hotels (Batch Auto-Pilot)")
        console.print("  [bold cyan][3][/bold cyan] 🎯 Enrich Specific Hotel by ID")
        console.print("  [bold red][0][/bold red] 🔙 Back to Previous Menu\n")

        choice = Prompt.ask("Choose an option", choices=["1", "2", "3", "0"], default="1")

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
        elif choice == "0":
            break


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        run_enricher(limit=int(sys.argv[1]))
    else:
        menu()
