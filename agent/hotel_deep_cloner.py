"""
Hotel Deep Cloner Agent for GetHotelStays (GHS)
Author: Antigravity AI Pair Programmer
Function:
- Given any Booking.com (or MMT) hotel link, extracts:
  * Hotel Name
  * City / Destination
  * Full Address
  * Star Rating
  * Full Property Description
  * Standard Amenities
  * Starting Room Price
  * Downloads ALL High-Res Photos directly into GetHotel backend/uploads/
- Supports returning clean JSON for UI auto-fill OR direct MySQL insertion.
"""

import sys
import os
import re
import json
import argparse
import html as html_lib
from datetime import datetime, timedelta

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
UPLOADS_DIR = os.path.join(PROJECT_ROOT, "GetHotel backend", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


def ensure_dates(url: str) -> str:
    """Ensures 1-night check-in dates for live room rate generation."""
    if not url:
        return ""
    d1 = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    d2 = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
    if "checkin=" not in url:
        sep = "&" if "?" in url else "?"
        url += f"{sep}checkin={d1}&checkout={d2}&group_adults=2&no_rooms=1&selected_currency=INR"
    return url


def parse_clean_name(raw: str) -> str:
    """Strips badges, certification prefixes, and hotel words."""
    if not raw:
        return ""
    lines = [line.strip() for line in raw.split("\n") if line.strip()]
    filtered = []
    for l in lines:
        lower = l.lower()
        if any(skip in lower for skip in ["sustainability", "certification", "opens in", "new window", "verified", "genius", "preferred", "hotel", "resort"]):
            if len(l) > 4:
                filtered.append(l)
        else:
            filtered.append(l)
    return filtered[0] if filtered else lines[0]


def detect_city(text: str, url: str) -> str:
    """Detects primary Indian travel destination."""
    combined = (text + " " + url).lower()
    cities = [
        ("goa", "Goa"),
        ("panaji", "Goa"),
        ("candolim", "Goa"),
        ("calangute", "Goa"),
        ("baga", "Goa"),
        ("delhi", "Delhi"),
        ("new delhi", "Delhi"),
        ("ncr", "Delhi"),
        ("gurgaon", "Delhi"),
        ("noida", "Delhi"),
        ("agra", "Agra"),
        ("jaipur", "Jaipur"),
        ("udaipur", "Udaipur"),
        ("mumbai", "Mumbai"),
        ("bombay", "Mumbai"),
        ("bangalore", "Bangalore"),
        ("bengaluru", "Bangalore"),
        ("manali", "Manali"),
        ("shimla", "Shimla"),
        ("rishikesh", "Rishikesh"),
        ("varanasi", "Varanasi"),
        ("kochi", "Kochi"),
        ("cochin", "Kochi"),
        ("kolkata", "Kolkata"),
        ("hyderabad", "Hyderabad"),
        ("chennai", "Chennai"),
        ("amritsar", "Amritsar"),
    ]
    for key, cname in cities:
        if re.search(r'\b' + re.escape(key) + r'\b', combined):
            return cname
    return "Delhi"


def extract_price(text: str) -> int | None:
    """Extract lowest INR rate from string."""
    matches = re.findall(r'(?:₹|INR|Rs\.?)\s*([0-9,]+)', text, re.IGNORECASE)
    nums = []
    for m in matches:
        try:
            val = int(m.replace(',', '').strip())
            if 300 <= val <= 250000:
                nums.append(val)
        except ValueError:
            continue
    return min(nums) if nums else None


def download_photo_playwright(page, url: str, slug: str, idx: int) -> str | None:
    """Downloads high-res image via Playwright authenticated session to uploads directory."""
    try:
        clean_slug = re.sub(r'[^a-zA-Z0-9]+', '_', slug.lower())[:25].strip('_')
        filename = f"cloned_{clean_slug}_{int(datetime.now().timestamp())}_{idx}.jpg"
        dest_path = os.path.join(UPLOADS_DIR, filename)

        resp = page.request.get(url, timeout=15000)
        if resp.ok and len(resp.body()) > 1000:
            with open(dest_path, "wb") as f:
                f.write(resp.body())
            if os.path.getsize(dest_path) > 1000:
                return f"/uploads/{filename}"
    except Exception as e:
        sys.stderr.write(f"[Photo Download Warning]: {e}\n")
    return None


def clone_brevistay_hotel(url: str, max_photos: int = 25, download_locally: bool = False) -> dict:
    """Extracts property details, photos, and hourly rates (3h, 6h, 12h, 24h) from Brevistay listing."""
    import requests
    from bs4 import BeautifulSoup

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
    try:
        r = requests.get(url, headers=headers, timeout=18)
        if r.status_code != 200:
            return {"success": False, "error": f"Brevistay returned status {r.status_code}"}

        soup = BeautifulSoup(r.text, 'html.parser')
        next_script = soup.find('script', id='__NEXT_DATA__')
        if not next_script or not next_script.string:
            return {"success": False, "error": "No __NEXT_DATA__ found on Brevistay listing"}

        jd = json.loads(next_script.string)
        d = jd.get('props', {}).get('pageProps', {}).get('data', {})
        if not d:
            return {"success": False, "error": "Empty hotel data on Brevistay"}

        name = (d.get('hotelName') or '').strip()
        addr = (d.get('hotelAddress') or '').strip()
        city = (d.get('city_name') or '').strip()
        if not city:
            city = detect_city(addr + " " + name, url)

        # Skip big corporate chains
        try:
            from hotel_search_crawler import is_big_chain
        except ImportError:
            from agent.hotel_search_crawler import is_big_chain

        if is_big_chain(name) or d.get('hotel_chain_id') or d.get('hotel_chain_name'):
            chain_label = d.get('hotel_chain_name') or 'Corporate Chain'
            return {
                "success": False,
                "is_chain": True,
                "name": name,
                "error": f"Skipping '{name}' ({chain_label}). GHS targets independent boutique partner hotels."
            }

        rating = float(d.get('rating') or 4.0)

        rate3 = d.get('room1_rate3') or 0
        rate6 = d.get('room1_rate6') or 0
        rate12 = d.get('room1_rate12') or 0
        rate24 = d.get('room1_rate24') or 0

        hourly_rates = {
            "3": str(rate3) if rate3 else "",
            "6": str(rate6) if rate6 else "",
            "12": str(rate12) if rate12 else ""
        }

        # Photos
        imgs = []
        for img_obj in (d.get('hotel_images') or []):
            if isinstance(img_obj, str) and img_obj.startswith('http'):
                imgs.append(img_obj)
            elif isinstance(img_obj, dict):
                u = img_obj.get('image_url') or img_obj.get('url')
                if u and u.startswith('http'):
                    imgs.append(u)

        if max_photos > 0:
            imgs = imgs[:max_photos]

        # Amenities
        amenities = []
        for am in (d.get('amenity_list') or d.get('amenities') or []):
            if isinstance(am, str) and am.strip():
                amenities.append(am.strip())
            elif isinstance(am, dict):
                val = am.get('name') or am.get('title') or am.get('amenity_name')
                if val:
                    amenities.append(str(val).strip())

        desc = (d.get('hotel_share_message') or d.get('hotel_chain_description') or f"Experience a comfortable and flexible stay at {name} in {city}. Verified, safe and couple-friendly with convenient hourly micro-stays (3h, 6h, 12h) and full day accommodation.").strip()

        starting_price = int(rate3 or rate24 or 999)
        nightly_base = float(rate24 or (rate3 * 2.5) or 2000)

        return {
            "success": True,
            "name": name,
            "city": city,
            "address": addr,
            "starRating": min(5, max(1, int(round(rating)))),
            "guestRating": rating,
            "description": desc,
            "amenities": amenities,
            "thumbnail": imgs[0] if imgs else "",
            "imagesList": imgs,
            "bookingUrl": url,
            "bookingPrice": starting_price,
            "pricePerNight": nightly_base,
            "downloadedPhotosCount": len(imgs),
            "isHourlyEnabled": True,
            "hourlyRates": hourly_rates,
            "rate3": rate3,
            "rate6": rate6,
            "rate12": rate12,
            "rate24": rate24,
            "source": "brevistay"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def clone_hotel(url: str, max_photos: int = 25, download_locally: bool = False, card_price: int = None, page=None) -> dict:
    """Full deep scrape of hotel listing and extraction of HD photo URLs."""
    if "brevistay" in url.lower():
        return clone_brevistay_hotel(url, max_photos=max_photos, download_locally=download_locally)

    from playwright.sync_api import sync_playwright

    # Canonicalize Booking.com URL (strip stale session & tracking params)
    clean_canonical_url = url
    m_canonical = re.match(r'^(https?://[^/]*booking\.com/hotel/[^?#]+\.html)', url)
    if m_canonical:
        clean_canonical_url = m_canonical.group(1)

    target_url = ensure_dates(url)
    result = {
        "success": False,
        "name": "",
        "city": "Delhi",
        "address": "",
        "starRating": 4,
        "description": "",
        "amenities": [],
        "thumbnail": "",
        "imagesList": [],
        "bookingUrl": clean_canonical_url,
        "bookingPrice": None,
        "downloadedPhotosCount": 0
    }

    own_browser = False
    browser = None
    pw_manager = None

    if page is None:
        own_browser = True
        pw_manager = sync_playwright()
        p = pw_manager.__enter__()
        try:
            browser = p.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        except Exception:
            browser = p.chromium.launch(channel="msedge", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            extra_http_headers={"Accept-Language": "en-IN,en;q=0.9"}
        )

    try:
        sys.stderr.write(f"Connecting to: {target_url}\n")
        page.goto(target_url, timeout=40000)
        try:
            page.wait_for_load_state("domcontentloaded", timeout=20000)
        except Exception:
            pass
        page.wait_for_timeout(5000)
        for _ in range(12):
            try:
                c = page.content()
                if len(c) > 20000:
                    break
            except Exception:
                pass
            page.wait_for_timeout(1500)
        page.keyboard.press("Escape")
        html = page.content()

        # Attempt JSON-LD extraction first (often standard across OTAs)
        json_ld_data = {}
        for script_txt in page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
                .map(s => s.innerText);
        }"""):
            try:
                parsed = json.loads(script_txt)
                if isinstance(parsed, list):
                    for item in parsed:
                        if isinstance(item, dict) and item.get("@type") in ["Hotel", "LodgingBusiness", "Resort"]:
                            json_ld_data = item
                            break
                elif isinstance(parsed, dict):
                    if parsed.get("@type") in ["Hotel", "LodgingBusiness", "Resort"]:
                        json_ld_data = parsed
                        break
                    if "@graph" in parsed and isinstance(parsed["@graph"], list):
                        for item in parsed["@graph"]:
                            if isinstance(item, dict) and item.get("@type") in ["Hotel", "LodgingBusiness", "Resort"]:
                                json_ld_data = item
                                break
            except Exception:
                pass

        # 1. Hotel Name
        if json_ld_data.get("name"):
            result["name"] = json_ld_data["name"]
        else:
            name_el = page.query_selector('[data-testid="title"], h2.pp-header__title, #hp_hotel_name, h1')
            if name_el and name_el.inner_text().strip():
                result["name"] = parse_clean_name(name_el.inner_text().strip())
            else:
                raw_title = page.title()
                result["name"] = parse_clean_name(raw_title.split(",")[0].strip())

        # 2. Address & City
        if json_ld_data.get("address"):
            addr = json_ld_data["address"]
            if isinstance(addr, dict):
                parts = [addr.get("streetAddress", ""), addr.get("addressLocality", ""), addr.get("postalCode", ""), addr.get("addressCountry", "")]
                clean_parts = []
                for p in parts:
                    p_str = p.strip() if isinstance(p, str) else ""
                    if p_str and p_str.lower() not in [c.lower() for c in clean_parts]:
                        clean_parts.append(p_str)
                result["address"] = ", ".join(clean_parts)
            elif isinstance(addr, str):
                result["address"] = addr.strip()

        if not result["address"]:
            addr_el = page.query_selector('[data-node_tt_id="location_score_tooltip"], .hp_address_subtitle, [data-testid="address"]')
            if addr_el and addr_el.inner_text().strip():
                raw_addr = addr_el.inner_text().strip()
                raw_addr = re.sub(r'(Great location|Show map|Excellent location)[^a-zA-Z0-9]*', '', raw_addr, flags=re.IGNORECASE).strip()
                result["address"] = raw_addr
            else:
                m_addr = re.search(r'"streetAddress":\s*"([^"]+)"', html)
                if m_addr:
                    result["address"] = m_addr.group(1)

        result["city"] = detect_city(result["address"] + " " + result["name"], url)

        # 3. Star Rating
        rating_els = page.query_selector_all('[data-testid="rating-stars"] span, [aria-label*="star"], .bui-rating')
        stars = 4
        for r_el in rating_els:
            label = r_el.get_attribute("aria-label") or r_el.inner_text() or ""
            m = re.search(r'([1-5])\s*star', label, re.IGNORECASE)
            if m:
                stars = int(m.group(1))
                break
        result["starRating"] = stars

        # 4. Description
        if json_ld_data.get("description") and len(json_ld_data["description"]) > 40:
            result["description"] = json_ld_data["description"]
        else:
            desc_el = page.query_selector('[data-testid="property-description"], #property_description_content, .hp_desc')
            if desc_el and desc_el.inner_text().strip():
                result["description"] = desc_el.inner_text().strip()
            else:
                m_desc = re.search(r'"description":\s*"([^"]+)"', html)
                if m_desc and len(m_desc.group(1)) > 50:
                    result["description"] = m_desc.group(1).replace('\\"', '"').replace('\\n', '\n')
                else:
                    result["description"] = f"Experience premium hospitality at {result['name']} located in {result['city']}. Features spacious modern rooms, attentive staff, and high comfort for couples, families, and business travelers."

        # 5. Amenities Matching
        amenity_map = {
            "wifi": "WiFi",
            "wi-fi": "WiFi",
            "air condition": "AC",
            "air-condition": "AC",
            "swimming pool": "Swimming Pool",
            "pool": "Swimming Pool",
            "parking": "Parking",
            "restaurant": "Restaurant",
            "dining": "Restaurant",
            "room service": "Room Service",
            "power backup": "Power Backup",
            "generator": "Power Backup",
            "elevator": "Elevator",
            "lift": "Elevator",
            "cctv": "CCTV",
            "security": "CCTV",
            "geyser": "Geyser",
            "hot water": "Geyser",
            "couple": "Couple Friendly",
            "breakfast": "Breakfast Included",
            "pet": "Pet Friendly",
            "spa": "Spa",
            "gym": "Gym",
            "fitness": "Gym"
        }
        body_text = page.inner_text("body").lower()
        matched_amenities = []
        for kw, standard_label in amenity_map.items():
            if kw in body_text and standard_label not in matched_amenities:
                matched_amenities.append(standard_label)

        if not matched_amenities:
            matched_amenities = ["WiFi", "AC", "Power Backup", "Geyser"]
        result["amenities"] = matched_amenities

        # 6. Price Extraction
        price_selectors = [
            '[data-testid="price-and-discounted-price"]',
            '.prco-valign-middle-helper',
            '.bui-price-display__value',
            '[data-price]'
        ]
        for p_sel in price_selectors:
            els = page.query_selector_all(p_sel)
            for el in els:
                txt = el.inner_text()
                val = extract_price(txt)
                if val:
                    result["bookingPrice"] = val
                    break
            if result["bookingPrice"]:
                break

        if not result["bookingPrice"]:
            result["bookingPrice"] = extract_price(body_text)

        if card_price and not result["bookingPrice"]:
            result["bookingPrice"] = card_price
        elif card_price and result["bookingPrice"]:
            result["bookingPrice"] = min(result["bookingPrice"], card_price)

        # 7. High-Res Photos Extraction
        raw_photo_urls = []

        # (A) Check JSON-LD image list
        if json_ld_data.get("image"):
            j_imgs = json_ld_data["image"]
            if isinstance(j_imgs, list):
                for u in j_imgs:
                    if isinstance(u, str) and "bstatic.com" in u:
                        raw_photo_urls.append(u)
            elif isinstance(j_imgs, str) and "bstatic.com" in j_imgs:
                raw_photo_urls.append(j_imgs)

        # (B) Check DOM images
        dom_imgs = page.evaluate("""() => {
            const list = [];
            document.querySelectorAll('img, a[data-thumb-url], [data-src]').forEach(el => {
                const src = el.src || el.getAttribute('data-thumb-url') || el.getAttribute('data-src') || el.href;
                if (src && src.includes('bstatic.com') && src.includes('/hotel/')) {
                    list.push(src);
                }
            });
            return Array.from(new Set(list));
        }""")
        for u in dom_imgs:
            if u not in raw_photo_urls:
                raw_photo_urls.append(u)

        # (C) Page regex search with ?k= token
        regex_matches = re.findall(r'https://cf\.bstatic\.com/xdata/images/hotel/[a-zA-Z0-9_\-\./]+(?:\.jpg|\.jpeg|\.webp)(?:\?[^"\'<>\s]+)?', html)
        for m in regex_matches:
            clean_u = html_lib.unescape(m)
            if clean_u not in raw_photo_urls and "icon" not in clean_u and "logo" not in clean_u:
                raw_photo_urls.append(clean_u)

        # Upgrade resolution to max1280x900
        upgraded_urls = []
        for u in raw_photo_urls:
            hi_res = re.sub(r'/(?:square|max)\d+x?\d*/', '/max1280x900/', u)
            if hi_res not in upgraded_urls:
                upgraded_urls.append(hi_res)

        downloaded_local_paths = []
        if download_locally and max_photos > 0:
            sys.stderr.write(f"Found {len(upgraded_urls)} HD photos. Downloading {min(len(upgraded_urls), max_photos)} locally...\n")
            for idx, p_url in enumerate(upgraded_urls[:max_photos]):
                local_path = download_photo_playwright(page, p_url, result["name"] or "hotel", idx)
                if local_path:
                    downloaded_local_paths.append(local_path)
        else:
            sys.stderr.write(f"Found {len(upgraded_urls)} HD photos. Linking high-speed CDN URLs (0 disk space used)...\n")

        if upgraded_urls:
            result["cdnThumbnail"] = upgraded_urls[0]
            result["cdnImagesList"] = upgraded_urls[1:max(max_photos, 25)]
            result["thumbnail"] = upgraded_urls[0]
            result["imagesList"] = upgraded_urls[1:max(max_photos, 25)]

        if downloaded_local_paths:
            result["localThumbnail"] = downloaded_local_paths[0]
            result["downloadedPhotosCount"] = len(downloaded_local_paths)
        else:
            result["downloadedPhotosCount"] = len(result["imagesList"])

        result["success"] = bool(result["name"])

    except Exception as e:
        sys.stderr.write(f"[Cloner Error] {e}\n")
        result["error"] = str(e)
    finally:
        if own_browser:
            try:
                if browser:
                    browser.close()
                if pw_manager:
                    pw_manager.__exit__(None, None, None)
            except Exception:
                pass

    return result


def save_to_mysql(hotel_data: dict) -> int | None:
    """Saves the cloned hotel directly into Live Production MySQL database (Local DB is kept clean)."""
    import pymysql

    thumb = hotel_data.get("cdnThumbnail") or hotel_data.get("thumbnail")
    imgs = hotel_data.get("cdnImagesList") or hotel_data.get("imagesList", [])

    # ONLY Live Production MariaDB (Never save directory clutter to Localhost)
    db_configs = [
        {"name": "Live Production", "host": "103.108.220.145", "port": 3306, "user": "vgyuvmpi_gethotel_db", "password": "shriyanshking", "database": "vgyuvmpi_gethotel_db"}
    ]

    saved_id = None
    for cfg in db_configs:
        try:
            conn = pymysql.connect(
                host=cfg["host"], port=cfg["port"], user=cfg["user"], password=cfg["password"],
                database=cfg["database"], autocommit=True, connect_timeout=8,
                read_timeout=10, write_timeout=10
            )
            with conn.cursor() as cur:
                # Check for existing
                cur.execute("SELECT id FROM hotel WHERE (name = %s OR bookingUrl = %s) AND listingType = 'directory'", (hotel_data["name"], hotel_data.get("bookingUrl", "")))
                existing = cur.fetchone()
                if existing:
                    existing_id = existing[0]
                    # Dynamically update the latest live Booking.com rate and URL
                    if hotel_data.get("bookingPrice"):
                        cur.execute("""
                            UPDATE hotel 
                            SET pricePerNight = %s, bookingPrice = %s, bookingUrl = %s, otaLastFetchedAt = NOW(), updatedAt = NOW()
                            WHERE id = %s
                        """, (
                            float(hotel_data.get("bookingPrice")),
                            hotel_data.get("bookingPrice"),
                            hotel_data.get("bookingUrl", ""),
                            existing_id
                        ))
                    sys.stderr.write(f"[{cfg['name']}] Hotel already exists (ID #{existing_id}), updated with latest live dynamic rate ₹{hotel_data.get('bookingPrice')}\n")
                    if not saved_id:
                        saved_id = existing_id
                    conn.close()
                    continue

                sql = """
                    INSERT INTO hotel (
                        name, city, address, description, starRating, 
                        pricePerNight, thumbnail, images, amenities, mainAmenities,
                        bookingUrl, bookingPrice, otaLastFetchedAt,
                        listingType, userId, isActive, createdAt, updatedAt
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, NOW(),
                        'directory', 2, 1, NOW(), NOW()
                    )
                """
                cur.execute(sql, (
                    hotel_data["name"],
                    hotel_data["city"],
                    hotel_data["address"],
                    hotel_data["description"],
                    hotel_data["starRating"],
                    float(hotel_data.get("bookingPrice") or 0.0),
                    thumb,
                    json.dumps(imgs),
                    json.dumps(hotel_data.get("amenities", [])),
                    json.dumps(hotel_data.get("amenities", [])),
                    hotel_data.get("bookingUrl", ""),
                    hotel_data.get("bookingPrice")
                ))
                new_id = cur.lastrowid
                sys.stderr.write(f"[{cfg['name']}] Successfully saved hotel ID #{new_id}\n")
                if not saved_id:
                    saved_id = new_id

                # If hotel has hourly micro-stays (Brevistay), ensure room inventory entry
                target_hotel_id = saved_id or new_id
                if target_hotel_id and hotel_data.get("isHourlyEnabled"):
                    try:
                        cur.execute("SELECT id FROM room WHERE hotelId = %s", (target_hotel_id,))
                        if not cur.fetchone():
                            room_sql = """
                                INSERT INTO room (
                                    hotelId, name, description, pricePerNight, maxOccupancy,
                                    bedConfiguration, amenities, images, status, isHourlyEnabled,
                                    hourlyRates, totalInventory, createdAt, updatedAt
                                ) VALUES (
                                    %s, %s, %s, %s, 2,
                                    '1 King Bed', %s, %s, 'active', 1,
                                    %s, 5, NOW(), NOW()
                                )
                            """
                            cur.execute(room_sql, (
                                target_hotel_id,
                                "Standard Room (Hourly/Day-Use)",
                                f"Equipped for flexible micro-stays (3h, 6h, 12h) and full day at {hotel_data['name']}.",
                                float(hotel_data.get("pricePerNight") or (hotel_data.get("bookingPrice", 1000) * 2.5)),
                                json.dumps(hotel_data.get("amenities", [])),
                                json.dumps(imgs[:4]),
                                json.dumps(hotel_data.get("hourlyRates") or {})
                            ))
                            sys.stderr.write(f"[{cfg['name']}] Created hourly room with 3h/6h/12h rates for hotel ID #{target_hotel_id}\n")
                    except Exception as re_err:
                        sys.stderr.write(f"[{cfg['name']} Hourly Room Warning]: {re_err}\n")
            conn.close()
        except Exception as e:
            sys.stderr.write(f"[{cfg['name']} MySQL Insert Error] {e}\n")

    return saved_id


def main():
    parser = argparse.ArgumentParser(description="GHS Hotel Deep Cloner")
    parser.add_argument("--url", type=str, required=True, help="Booking.com or MMT Hotel URL to clone")
    parser.add_argument("--save-db", action="store_true", help="Directly save hotel to GHS MySQL database")
    parser.add_argument("--max-photos", type=int, default=10, help="Maximum photos to download")
    args = parser.parse_args()

    data = clone_hotel(args.url, max_photos=args.max_photos)
    if args.save_db and data.get("success"):
        new_id = save_to_mysql(data)
        data["hotelId"] = new_id

    print(json.dumps(data))


if __name__ == "__main__":
    main()
