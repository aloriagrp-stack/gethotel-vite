import json
import pymysql
import re
import os

json_file = r"C:\Users\DELL\Downloads\booking_delhi_hotels_890_2026-11-16T18-39-40.json"
if not os.path.exists(json_file):
    print("JSON file not found at:", json_file)
    exit(1)

with open(json_file, "r", encoding="utf-8") as f:
    harvested = json.load(f)

print(f"Total Hotels in Harvested JSON: {len(harvested)}")

# Connect to Live MariaDB
conn = pymysql.connect(
    host="103.108.220.145",
    port=3306,
    user="vgyuvmpi_gethotel_db",
    password="shriyanshking",
    database="vgyuvmpi_gethotel_db",
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    # Get total directory count
    cur.execute("SELECT COUNT(*) as total FROM hotel WHERE listingType = 'directory'")
    total_db = cur.fetchone()['total']

    # Fetch all directory hotel URLs and names
    cur.execute("SELECT id, name, bookingUrl, contactPhone, bookingPrice, createdAt, updatedAt FROM hotel WHERE listingType = 'directory'")
    db_hotels = cur.fetchall()

    def norm_url(u):
        if not u: return ""
        m = re.search(r'(hotel/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+\.html)', u)
        if m: return m.group(1).lower()
        return u.split('?')[0].lower().strip()

    db_urls = set()
    db_names = set()
    for h in db_hotels:
        if h.get('bookingUrl'):
            db_urls.add(norm_url(h['bookingUrl']))
        if h.get('name'):
            db_names.add(h['name'].lower().strip())

    done_list = []
    remaining_list = []

    for item in harvested:
        u = norm_url(item.get('url', ''))
        n = item.get('name', '').lower().strip()

        matched = False
        if u and u in db_urls:
            matched = True
        elif n and n in db_names:
            matched = True
        else:
            # Substring matching for URLs
            for db_u in db_urls:
                if len(u) > 15 and (u in db_u or db_u in u):
                    matched = True
                    break

        if matched:
            done_list.append(item)
        else:
            remaining_list.append(item)

    # Check additions in the last 1 hour
    cur.execute("""
        SELECT COUNT(*) as added_recently, MIN(createdAt) as earliest, MAX(createdAt) as latest 
        FROM hotel 
        WHERE listingType = 'directory' AND createdAt >= NOW() - INTERVAL 1 HOUR
    """)
    recent = cur.fetchone()

    # Check hotels added after midnight (00:00:00 on 17 Nov)
    cur.execute("""
        SELECT COUNT(*) as added_after_midnight, MIN(createdAt) as earliest, MAX(createdAt) as latest 
        FROM hotel 
        WHERE listingType = 'directory' AND createdAt >= '2026-11-17 00:00:00'
    """)
    midnight_batch = cur.fetchone()

    print("\n" + "=" * 60)
    print("📊 890 JSON BATCH PROGRESS REPORT")
    print("=" * 60)
    print(f"Total Hotels in JSON File       : {len(harvested)}")
    print(f"✅ Hotels Done & Live in DB      : {len(done_list)} ({round(len(done_list)/len(harvested)*100, 1)}%)")
    print(f"⏳ Hotels Still Remaining        : {len(remaining_list)}")
    print(f"🏨 Total Directory Hotels in DB : {total_db}")
    print(f"🕒 Added After Midnight (17 Nov) : {midnight_batch['added_after_midnight']} hotels (Latest: {midnight_batch['latest']})")
    print(f"⚡ Added In Last 1 Hour         : {recent['added_recently']} hotels")
    print("=" * 60)

    # Show sample remaining
    if remaining_list:
        print("\nNext 3 Remaining in Queue to be processed:")
        for r in remaining_list[:3]:
            print(f"  • {r.get('name')} | Rate: ₹{r.get('card_price')} | {r.get('url')}")
