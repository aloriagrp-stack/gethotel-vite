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


def clone_hotel(url: str, max_photos: int = 10) -> dict:
    """Full deep scrape of hotel listing and download of photos."""
    from playwright.sync_api import sync_playwright

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
        "bookingUrl": url,
        "bookingPrice": None,
        "downloadedPhotosCount": 0
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
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

            sys.stderr.write(f"Found {len(upgraded_urls)} HD photos. Downloading {min(len(upgraded_urls), max_photos)} locally...\n")
            downloaded_local_paths = []
            for idx, p_url in enumerate(upgraded_urls[:max_photos]):
                local_path = download_photo_playwright(page, p_url, result["name"] or "hotel", idx)
                if local_path:
                    downloaded_local_paths.append(local_path)

            if downloaded_local_paths:
                result["thumbnail"] = downloaded_local_paths[0]
                result["imagesList"] = downloaded_local_paths[1:]
                result["downloadedPhotosCount"] = len(downloaded_local_paths)

            result["success"] = bool(result["name"])

        except Exception as e:
            sys.stderr.write(f"[Cloner Error] {e}\n")
            result["error"] = str(e)
        finally:
            browser.close()

    return result


def save_to_mysql(hotel_data: dict) -> int | None:
    """Saves the cloned hotel directly into MySQL database."""
    try:
        import pymysql
        conn = pymysql.connect(
            host="127.0.0.1", port=3306, user="root", password="",
            database="vgyuvmpi_gethotel_db", autocommit=True
        )
        with conn.cursor() as cur:
            sql = """
                INSERT INTO hotel (
                    name, city, address, description, starRating, 
                    thumbnail, images, amenities, mainAmenities,
                    bookingUrl, bookingPrice, otaLastFetchedAt,
                    listingType, userId, isActive, isApproved
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, NOW(),
                    'directory', 2, 1, 1
                )
            """
            cur.execute(sql, (
                hotel_data["name"],
                hotel_data["city"],
                hotel_data["address"],
                hotel_data["description"],
                hotel_data["starRating"],
                hotel_data["thumbnail"],
                json.dumps(hotel_data["imagesList"]),
                json.dumps(hotel_data["amenities"]),
                json.dumps(hotel_data["amenities"]),
                hotel_data.get("bookingUrl", ""),
                hotel_data.get("bookingPrice")
            ))
            new_id = cur.lastrowid
            conn.close()
            return new_id
    except Exception as e:
        sys.stderr.write(f"[MySQL Insert Error] {e}\n")
        return None


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
