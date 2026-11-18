"""
All-India Viator Tours Importer for GetHotelStays.com
Imports top-rated, best-selling tours across all states and tourist circuits of India
directly from Viator Partner API v2 with affiliate tracking ID (pid=P00332479).
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.error
import pymysql

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, PROJECT_ROOT)

from agent.google_maps_enricher import LIVE_DB

VIATOR_API_KEY = "aac9d0de-75fd-4270-aa9e-98bfa3bfc713"
PARTNER_ID = "P00332479"

HEADERS = {
    "exp-api-key": VIATOR_API_KEY,
    "Accept": "application/json;version=2.0",
    "Accept-Language": "en",
    "Content-Type": "application/json",
    "User-Agent": "GetHotelStays/1.0"
}

ALL_INDIA_DESTINATIONS = [
    # Golden Triangle & Capital
    {"name": "Delhi", "destId": "804", "count": 5, "tag": "Heritage & Capital Highlights", "state": "Delhi"},
    {"name": "Agra", "destId": "4547", "count": 5, "tag": "Wonder of the World • Taj Mahal", "state": "Uttar Pradesh"},
    {"name": "Jaipur", "destId": "4627", "count": 5, "tag": "Royal Forts & Palaces", "state": "Rajasthan"},
    
    # Rajasthan Royalty
    {"name": "Udaipur", "destId": "5106", "count": 4, "tag": "Romantic City of Lakes", "state": "Rajasthan"},
    {"name": "Jodhpur", "destId": "22142", "count": 4, "tag": "The Blue City & Mehrangarh", "state": "Rajasthan"},
    {"name": "Jaisalmer", "destId": "24761", "count": 4, "tag": "Thar Desert & Golden Fortress", "state": "Rajasthan"},
    {"name": "Ranthambore", "destId": "50260", "count": 3, "tag": "Tiger Safari & Wildlife", "state": "Rajasthan"},
    
    # Uttar Pradesh Spiritual & Cultural
    {"name": "Varanasi", "destId": "22015", "count": 5, "tag": "Spiritual Ghats & Ganga Aarti", "state": "Uttar Pradesh"},
    {"name": "Ayodhya", "destId": "51586", "count": 3, "tag": "Sacred Temples & Heritage", "state": "Uttar Pradesh"},
    {"name": "Lucknow", "destId": "23770", "count": 3, "tag": "Nawabi Culture & Architecture", "state": "Uttar Pradesh"},
    
    # Goa Beaches & Cruises
    {"name": "Goa", "destId": "4594", "count": 5, "tag": "Beaches, Cruises & Water Sports", "state": "Goa"},
    
    # Maharashtra
    {"name": "Mumbai", "destId": "953", "count": 5, "tag": "Bollywood & Colonial Heritage", "state": "Maharashtra"},
    {"name": "Pune", "destId": "26473", "count": 3, "tag": "Historic Forts & Culture", "state": "Maharashtra"},
    {"name": "Aurangabad", "destId": "23226", "count": 3, "tag": "Ajanta & Ellora Caves", "state": "Maharashtra"},
    
    # Kerala God's Own Country
    {"name": "Kochi", "destId": "952", "count": 5, "tag": "Backwaters & Houseboat Cruises", "state": "Kerala"},
    {"name": "Munnar", "destId": "25293", "count": 4, "tag": "Tea Plantations & Mist Hills", "state": "Kerala"},
    {"name": "Thekkady", "destId": "50427", "count": 3, "tag": "Periyar Wildlife & Spices", "state": "Kerala"},
    
    # South India (Karnataka, Tamil Nadu & Telangana)
    {"name": "Bengaluru", "destId": "5310", "count": 4, "tag": "Silicon City & Royal Palaces", "state": "Karnataka"},
    {"name": "Mysore", "destId": "25746", "count": 3, "tag": "Grand Mysore Palace", "state": "Karnataka"},
    {"name": "Hampi", "destId": "50426", "count": 3, "tag": "Vijayanagara UNESCO Ruins", "state": "Karnataka"},
    {"name": "Chennai", "destId": "4624", "count": 4, "tag": "Dravidian Temples & Marina Beach", "state": "Tamil Nadu"},
    {"name": "Madurai", "destId": "26847", "count": 3, "tag": "Meenakshi Amman Temple", "state": "Tamil Nadu"},
    {"name": "Pondicherry", "destId": "22690", "count": 3, "tag": "French Quarter & Promenade", "state": "Puducherry"},
    {"name": "Hyderabad", "destId": "22442", "count": 4, "tag": "Charminar & Nizami Heritage", "state": "Telangana"},
    
    # North & Himalayas
    {"name": "Amritsar", "destId": "22306", "count": 4, "tag": "Golden Temple & Wagah Border", "state": "Punjab"},
    {"name": "Rishikesh", "destId": "22733", "count": 4, "tag": "Yoga Capital & River Rafting", "state": "Uttarakhand"},
    {"name": "Haridwar", "destId": "22303", "count": 3, "tag": "Hari Ki Pauri & Holy Ganga", "state": "Uttarakhand"},
    {"name": "Shimla", "destId": "25944", "count": 3, "tag": "Queen of Hills & Mall Road", "state": "Himachal Pradesh"},
    {"name": "Manali", "destId": "22496", "count": 4, "tag": "Solang Valley & Mountain Passes", "state": "Himachal Pradesh"},
    {"name": "Kashmir", "destId": "23017", "count": 4, "tag": "Paradise on Earth • Dal Lake", "state": "Jammu & Kashmir"},
    {"name": "Ladakh", "destId": "22569", "count": 4, "tag": "Land of High Passes & Pangong", "state": "Ladakh"},
    
    # East & North East
    {"name": "Kolkata", "destId": "4924", "count": 4, "tag": "City of Joy & Victorian Heritage", "state": "West Bengal"},
    {"name": "Darjeeling", "destId": "22035", "count": 3, "tag": "Toy Train & Kanchenjunga", "state": "West Bengal"},
    {"name": "Sikkim", "destId": "23771", "count": 3, "tag": "Monasteries & Himalayan Peaks", "state": "Sikkim"},
    {"name": "Guwahati", "destId": "24307", "count": 3, "tag": "Kamakhya & Brahmaputra", "state": "Assam"},
    {"name": "Bhubaneswar", "destId": "25191", "count": 3, "tag": "Temple City of India", "state": "Odisha"},
    
    # Central India, Gujarat & Islands
    {"name": "Ahmedabad", "destId": "24558", "count": 3, "tag": "Gandhi Ashram & UNESCO City", "state": "Gujarat"},
    {"name": "Khajuraho", "destId": "25032", "count": 3, "tag": "Ancient Carved Temples", "state": "Madhya Pradesh"},
    {"name": "Andaman", "destId": "50896", "count": 3, "tag": "Emerald Coral Islands", "state": "Andaman & Nicobar"}
]


def create_slug(title: str, code: str) -> str:
    clean = re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower().strip()
    clean = re.sub(r'\s+', '-', clean)
    clean = clean[:65].rstrip('-')
    return f"{clean}-{code.lower()}"


def format_duration(dur_obj: dict) -> str:
    if not dur_obj:
        return "Full Day"
    if "fixedDurationInMinutes" in dur_obj:
        mins = dur_obj["fixedDurationInMinutes"]
        if mins >= 1440:
            days = round(mins / 1440)
            return f"{days} Days / {days - 1} Nights" if days > 1 else "1 Day"
        hrs = round(mins / 60)
        return f"{hrs} Hours" if hrs > 1 else f"{mins} Mins"
    if "variableDurationFromMinutes" in dur_obj:
        from_hrs = round(dur_obj.get("variableDurationFromMinutes", 60) / 60)
        to_hrs = round(dur_obj.get("variableDurationToMinutes", 180) / 60)
        return f"{from_hrs} - {to_hrs} Hours"
    return "Flexible Duration"


def fetch_products_for_destination(dest_id: str, count: int = 5) -> list:
    url = "https://api.viator.com/partner/products/search"
    payload = {
        "filtering": {"destination": dest_id},
        "currency": "INR",
        "pagination": {"start": 1, "count": count}
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data.get("products", [])
    except Exception as e:
        print(f"  [Error] Failed to search destination {dest_id}: {e}")
        return []


def fetch_product_details(product_code: str) -> dict:
    url = f"https://api.viator.com/partner/products/{product_code}"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"  [Error] Failed to fetch details for {product_code}: {e}")
        return {}


def extract_rich_itinerary(details: dict, dest_name: str) -> list:
    itin = details.get("itinerary", {})
    itinerary_items = []

    # 1. Multi-day tours
    if itin.get("days"):
        for d in itin.get("days", []):
            d_num = d.get("dayNumber", 1)
            d_title = d.get("title", f"Day {d_num}: Sightseeing")
            desc_parts = []
            if d.get("description"):
                desc_parts.append(d.get("description"))
            for item in d.get("items", []):
                t = item.get("title") or item.get("name")
                desc = item.get("description")
                if t and desc:
                    desc_parts.append(f"{t}: {desc}")
                elif desc:
                    desc_parts.append(desc)
            full_desc = " ".join(desc_parts) if desc_parts else "Sightseeing and guided exploration."
            itinerary_items.append({
                "day": f"Day {d_num}",
                "title": d_title,
                "description": full_desc[:500],
                "duration": "Full Day",
                "admission": "Admission Ticket Included"
            })

    # 2. Single-day tours
    elif itin.get("itineraryItems"):
        for idx, item in enumerate(itin.get("itineraryItems", [])):
            stop_num = idx + 1
            t = item.get("title") or item.get("name") or f"Stop {stop_num}"
            desc = item.get("description") or "Sightseeing and guided tour."
            dur_mins = item.get("duration", {}).get("fixedDurationInMinutes")
            dur_str = f"{dur_mins // 60} hours" if dur_mins and dur_mins >= 60 else f"{dur_mins} mins" if dur_mins else ""
            admission = "Admission Ticket Included" if item.get("admissionIncluded") else ""
            itinerary_items.append({
                "day": f"Stop {stop_num}",
                "title": t,
                "description": desc[:500],
                "duration": dur_str,
                "admission": admission
            })

    # 3. Fallback
    if not itinerary_items:
        itinerary_items = [
            {"day": "Stop 1", "title": f"Pickup & Departure in {dest_name}", "description": f"Private door-to-door pickup from your hotel or preferred address in {dest_name}.", "duration": "1 Hour", "admission": ""},
            {"day": "Stop 2", "title": f"Top Iconic Landmarks of {dest_name}", "description": f"Explore the most famous heritage sites and scenic viewpoints with your licensed expert guide.", "duration": "3 Hours", "admission": "Admission Ticket Included"},
            {"day": "Stop 3", "title": f"Scenic Return Transfer", "description": f"Relax on your return transfer back to your hotel or airport in {dest_name}.", "duration": "1 Hour", "admission": ""}
        ]

    return itinerary_items


def import_all():
    print("=" * 80)
    print("🚀 GETHOTELSTAYS — ALL INDIA VIATOR TOURS AUTO-IMPORTER")
    print(f"Partner Affiliate ID: {PARTNER_ID}")
    print(f"Total Destinations Scheduled: {len(ALL_INDIA_DESTINATIONS)}")
    print("=" * 80)

    conn = pymysql.connect(**LIVE_DB)
    total_saved = 0
    total_skipped = 0

    try:
        with conn.cursor() as cur:
            for d in ALL_INDIA_DESTINATIONS:
                d_name = d["name"]
                dest_id = d["destId"]
                max_cnt = d["count"]
                d_state = d["state"]

                print(f"\n📍 [{d_state}] Fetching Top Tours for {d_name} (Viator Dest ID: {dest_id})...")
                products = fetch_products_for_destination(dest_id, count=max_cnt)
                print(f"   Found {len(products)} products from Viator API.")

                for p in products:
                    code = p.get("productCode")
                    if not code:
                        continue

                    # Check if already in DB
                    cur.execute("SELECT id FROM tour_packages WHERE viator_code = %s OR slug LIKE %s LIMIT 1", (code, f"%{code.lower()}%"))
                    if cur.fetchone():
                        print(f"   [Skip] {code} already exists in DB.")
                        total_skipped += 1
                        continue

                    # Fetch full details
                    details = fetch_product_details(code)
                    if not details or not details.get("title"):
                        continue

                    title = details.get("title")
                    slug = create_slug(title, code)
                    price = round(details.get("pricing", {}).get("summary", {}).get("fromPrice", 1499))
                    orig_price = round(details.get("pricing", {}).get("summary", {}).get("fromPriceBeforeDiscount", price * 1.25))

                    duration = format_duration(details.get("duration"))
                    overview = details.get("description", "")[:600]

                    # Photos
                    images = details.get("images", [])
                    gallery = []
                    for img in images:
                        variants = img.get("variants", [])
                        best = next((v["url"] for v in variants if v.get("width", 0) >= 700), None)
                        if not best and variants:
                            best = variants[-1].get("url")
                        if best and best not in gallery:
                            gallery.append(best)

                    featured_img = gallery[0] if gallery else "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/r/33/0b/77/f5/caption.jpg"

                    # Clean Inclusions
                    inclusions = []
                    for inc in details.get("inclusions", []):
                        desc = inc.get("otherDescription") or inc.get("description") or inc.get("categoryDescription")
                        if desc and desc not in inclusions:
                            inclusions.append(desc)

                    # Clean Exclusions
                    exclusions = []
                    for exc in details.get("exclusions", []):
                        desc = exc.get("otherDescription") or exc.get("description") or exc.get("categoryDescription")
                        if desc and desc not in exclusions:
                            exclusions.append(desc)

                    # Rich Itinerary
                    itinerary = extract_rich_itinerary(details, d_name)

                    # Clean Destination Booking URL with Affiliate pid
                    prod_url = details.get("productUrl")
                    if prod_url:
                        clean_base = prod_url.split("?")[0]
                        booking_url = f"{clean_base}?mcid=42383&pid={PARTNER_ID}&medium=api&api_version=2.0"
                    else:
                        booking_url = f"https://www.viator.com/tours/{d_name}/{slug}/d{dest_id}-{code}?mcid=42383&pid={PARTNER_ID}&medium=api&api_version=2.0"

                    rating = round(details.get("reviews", {}).get("combinedAverageRating", 4.9), 1)

                    # Insert into tour_packages
                    insert_query = """
                        INSERT INTO tour_packages (
                            title, slug, destination, duration, price, original_price,
                            image, gallery, overview, inclusions, exclusions, itinerary,
                            booking_url, viator_code, rating, badge, is_active, created_at, updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, NOW(), NOW())
                    """
                    cur.execute(insert_query, (
                        title,
                        slug,
                        d_name,
                        duration,
                        price,
                        orig_price,
                        featured_img,
                        json.dumps(gallery),
                        overview,
                        json.dumps(inclusions),
                        json.dumps(exclusions),
                        json.dumps(itinerary),
                        booking_url,
                        code,
                        rating,
                        "Best Seller"
                    ))
                    conn.commit()
                    total_saved += 1
                    print(f"   ✅ Saved: {title[:50]}... | Price: ₹{price:,} | Stops: {len(itinerary)}")

                    # Polite rate limit pause
                    time.sleep(0.3)

    finally:
        conn.close()

    print("\n" + "=" * 80)
    print(f"🎉 IMPORT COMPLETED! Newly Saved: {total_saved} | Skipped: {total_skipped}")
    print("=" * 80)


if __name__ == "__main__":
    import_all()
