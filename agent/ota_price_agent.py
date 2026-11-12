"""
OTA Live Price Agent for GetHotelStays
Extracts the lowest starting room price from Booking.com and MakeMyTrip listings.
Can be run on-demand or as a periodic background daemon/cron.
"""

import sys
import os
import re
import json
import argparse
from datetime import datetime, timedelta

# Ensure python path can load local modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def ensure_dates_in_url(url: str, platform: str = "booking") -> str:
    """Ensure standard 1-night check-in/out dates are attached to URL for live pricing."""
    if not url:
        return ""
    
    d1 = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    d2 = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")

    if platform == "booking":
        if "checkin=" not in url:
            sep = "&" if "?" in url else "?"
            url += f"{sep}checkin={d1}&checkout={d2}&group_adults=2&no_rooms=1&selected_currency=INR"
    elif platform == "mmt":
        if "checkin=" not in url and "checkin_date=" not in url:
            # MMT format
            d1_mmt = (datetime.now() + timedelta(days=7)).strftime("%m%d%Y")
            d2_mmt = (datetime.now() + timedelta(days=8)).strftime("%m%d%Y")
            sep = "&" if "?" in url else "?"
            url += f"{sep}checkin={d1_mmt}&checkout={d2_mmt}"
    return url


def parse_price_from_text(text: str) -> list[int]:
    """Extract all rupee/INR numbers from given string."""
    if not text:
        return []
    # Clean non-breaking spaces
    text = text.replace('\xa0', ' ')
    matches = re.findall(r'(?:₹|INR|Rs\.?)\s*([0-9,]+)', text, re.IGNORECASE)
    nums = []
    for m in matches:
        try:
            val = int(m.replace(',', '').strip())
            if 300 <= val <= 250000:
                nums.append(val)
        except ValueError:
            continue
    return nums


def scrape_booking_price(url: str, page) -> int | None:
    """Scrapes the lowest starting room rate from a Booking.com URL."""
    target_url = ensure_dates_in_url(url, "booking")
    try:
        # Navigate to Booking.com with domestic Indian headers
        page.goto(target_url, wait_until="domcontentloaded", timeout=20000)
        page.wait_for_timeout(3500)

        # 1. Try finding modern Booking.com price testids
        prices = []
        selectors = [
            '[data-testid="price-and-discounted-price"]',
            '[data-testid="property-card"] [data-testid="price-and-discounted-price"]',
            '.prco-valign-middle-helper',
            '.bui-price-display__value',
            '[data-price]',
            '.c-price-display__value'
        ]
        for sel in selectors:
            try:
                elements = page.query_selector_all(sel)
                for el in elements:
                    txt = el.inner_text().strip()
                    extracted = parse_price_from_text(txt)
                    prices.extend(extracted)
            except Exception:
                pass

        # 2. Fallback: Parse whole room table or body if selectors empty
        if not prices:
            try:
                table_text = page.inner_text('#hprt-table')
                prices.extend(parse_price_from_text(table_text))
            except Exception:
                pass

        if not prices:
            try:
                body_text = page.inner_text('body')
                prices.extend(parse_price_from_text(body_text))
            except Exception:
                pass

        if prices:
            return min(prices)
    except Exception as e:
        sys.stderr.write(f"[Booking Scraper Error] {e}\n")
    return None


def scrape_mmt_price(url: str, page) -> int | None:
    """Scrapes the lowest starting room rate from a MakeMyTrip URL."""
    target_url = ensure_dates_in_url(url, "mmt")
    try:
        page.goto(target_url, wait_until="domcontentloaded", timeout=20000)
        page.wait_for_timeout(3500)

        prices = []
        selectors = [
            '#hlistpg_hotel_shown_price',
            '.actualPrice',
            '.priceText',
            '[id*="price"]',
            '[class*="priceText"]',
            '[class*="price"]'
        ]
        for sel in selectors:
            try:
                elements = page.query_selector_all(sel)
                for el in elements:
                    txt = el.inner_text().strip()
                    prices.extend(parse_price_from_text(txt))
            except Exception:
                pass

        if not prices:
            try:
                body_text = page.inner_text('body')
                prices.extend(parse_price_from_text(body_text))
            except Exception:
                pass

        if prices:
            return min(prices)
    except Exception as e:
        sys.stderr.write(f"[MMT Scraper Error] {e}\n")
    return None


def run_price_sync(hotel_id: int | None = None, booking_url: str | None = None, mmt_url: str | None = None):
    """Executes the price extraction agent using Playwright Chrome."""
    from playwright.sync_api import sync_playwright

    result = {
        "success": False,
        "bookingPrice": None,
        "mmtPrice": None,
        "hotelId": hotel_id
    }

    with sync_playwright() as p:
        browser = None
        try:
            # Launch local installed Google Chrome
            browser = p.chromium.launch(channel="chrome", headless=True)
            context = browser.new_context(
                locale="en-IN",
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                extra_http_headers={"Accept-Language": "en-IN,en;q=0.9"}
            )
            page = context.new_page()

            # 1. Fetch Booking.com price
            if booking_url:
                sys.stderr.write(f"Fetching Booking.com: {booking_url}\n")
                b_price = scrape_booking_price(booking_url, page)
                if b_price:
                    result["bookingPrice"] = b_price
                    sys.stderr.write(f"-> Booking.com Lowest Price: ₹{b_price}\n")

            # 2. Fetch MakeMyTrip price
            if mmt_url:
                sys.stderr.write(f"Fetching MakeMyTrip: {mmt_url}\n")
                m_price = scrape_mmt_price(mmt_url, page)
                if m_price:
                    result["mmtPrice"] = m_price
                    sys.stderr.write(f"-> MMT Lowest Price: ₹{m_price}\n")

            result["success"] = bool(result["bookingPrice"] or result["mmtPrice"])
        except Exception as e:
            result["error"] = str(e)
            sys.stderr.write(f"[Agent Execution Error] {e}\n")
        finally:
            if browser:
                browser.close()

    return result


def sync_db_hotel(hotel_id: int, b_price: int | None, m_price: int | None):
    """Directly updates the hotel record in MySQL database if prices found."""
    try:
        import pymysql
        conn = pymysql.connect(
            host="127.0.0.1",
            port=3306,
            user="root",
            password="",
            database="vgyuvmpi_gethotel_db",
            autocommit=True
        )
        with conn.cursor() as cursor:
            updates = []
            params = []
            if b_price:
                updates.append("bookingPrice = %s")
                params.append(b_price)
            if m_price:
                updates.append("mmtPrice = %s")
                params.append(m_price)
            if updates:
                updates.append("otaLastFetchedAt = NOW()")
                params.append(hotel_id)
                sql = f"UPDATE hotel SET {', '.join(updates)} WHERE id = %s"
                cursor.execute(sql, tuple(params))
        conn.close()
    except Exception as e:
        sys.stderr.write(f"[DB Sync Error] {e}\n")


def main():
    parser = argparse.ArgumentParser(description="OTA Price Extractor Agent")
    parser.add_argument("--hotel-id", type=int, help="Hotel ID to sync")
    parser.add_argument("--booking-url", type=str, help="Booking.com URL to scrape directly")
    parser.add_argument("--mmt-url", type=str, help="MakeMyTrip URL to scrape directly")
    parser.add_argument("--all", action="store_true", help="Sync all directory hotels in DB")
    args = parser.parse_args()

    # Mode 1: Direct URLs passed via CLI
    if args.booking_url or args.mmt_url:
        res = run_price_sync(args.hotel_id, args.booking_url, args.mmt_url)
        if args.hotel_id and res["success"]:
            sync_db_hotel(args.hotel_id, res["bookingPrice"], res["mmtPrice"])
        print(json.dumps(res))
        return

    # Mode 2: By Hotel ID from DB
    if args.hotel_id:
        try:
            import pymysql
            conn = pymysql.connect(
                host="127.0.0.1", port=3306, user="root", password="",
                database="vgyuvmpi_gethotel_db"
            )
            with conn.cursor() as cursor:
                cursor.execute("SELECT bookingUrl, mmtUrl FROM hotel WHERE id = %s", (args.hotel_id,))
                row = cursor.fetchone()
                if row:
                    b_url, m_url = row[0], row[1]
                    res = run_price_sync(args.hotel_id, b_url, m_url)
                    if res["success"]:
                        sync_db_hotel(args.hotel_id, res["bookingPrice"], res["mmtPrice"])
                    print(json.dumps(res))
                else:
                    print(json.dumps({"success": False, "error": f"Hotel ID {args.hotel_id} not found"}))
            conn.close()
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
        return

    # Mode 3: Sync all directory hotels
    if args.all:
        try:
            import pymysql
            conn = pymysql.connect(
                host="127.0.0.1", port=3306, user="root", password="",
                database="vgyuvmpi_gethotel_db"
            )
            hotels = []
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, name, bookingUrl, mmtUrl FROM hotel WHERE listingType = 'directory'")
                hotels = cursor.fetchall()
            conn.close()

            results = []
            for h_id, h_name, b_url, m_url in hotels:
                if not b_url and not m_url:
                    continue
                sys.stderr.write(f"\n[Syncing {h_name} (ID: {h_id})]...\n")
                res = run_price_sync(h_id, b_url, m_url)
                if res["success"]:
                    sync_db_hotel(h_id, res["bookingPrice"], res["mmtPrice"])
                results.append(res)

            print(json.dumps({"success": True, "synced": len(results), "data": results}))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
        return

    print(json.dumps({"error": "Provide --hotel-id, --booking-url, or --all"}))


if __name__ == "__main__":
    main()

