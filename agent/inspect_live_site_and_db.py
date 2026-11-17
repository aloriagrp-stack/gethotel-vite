import pymysql
import json
import urllib.request
import re

print("=" * 65)
print("🔍 LIVE GETHOTELSTAYS.COM AUDIT")
print("=" * 65)

# 1. Connect to Live MariaDB
conn = pymysql.connect(
    host="103.108.220.145",
    port=3306,
    user="vgyuvmpi_gethotel_db",
    password="shriyanshking",
    database="vgyuvmpi_gethotel_db",
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    # All hotels vs directory hotels
    cur.execute("SELECT COUNT(*) as total_all FROM hotel")
    total_all = cur.fetchone()['total_all']

    cur.execute("SELECT COUNT(*) as total_dir FROM hotel WHERE listingType = 'directory'")
    total_dir = cur.fetchone()['total_dir']

    cur.execute("SELECT COUNT(*) as active_dir FROM hotel WHERE listingType = 'directory' AND isActive = 1")
    active_dir = cur.fetchone()['active_dir']

    # Phone numbers breakdown
    cur.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN contactPhone IS NOT NULL AND contactPhone != '' THEN 1 ELSE 0 END) as with_phone,
            SUM(CASE WHEN contactPhone IS NULL OR contactPhone = '' THEN 1 ELSE 0 END) as without_phone
        FROM hotel 
        WHERE listingType = 'directory'
    """)
    phone_stats = cur.fetchone()

    # Image check in DB
    cur.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN thumbnail IS NOT NULL AND thumbnail != '' THEN 1 ELSE 0 END) as with_thumb,
            SUM(CASE WHEN thumbnail LIKE 'https://cf.bstatic.com%' THEN 1 ELSE 0 END) as bstatic_thumb,
            SUM(CASE WHEN thumbnail LIKE '/uploads/%' THEN 1 ELSE 0 END) as local_thumb,
            SUM(CASE WHEN images IS NOT NULL AND images != '' AND images != '[]' THEN 1 ELSE 0 END) as with_images
        FROM hotel 
        WHERE listingType = 'directory'
    """)
    img_stats = cur.fetchone()

    print(f"Total Hotels in DB         : {total_all}")
    print(f"Total Directory Hotels     : {total_dir} (Active: {active_dir})")
    print(f"Hotels WITH Phone Number   : {phone_stats['with_phone']} ({round(phone_stats['with_phone']/total_dir*100, 1)}%)")
    print(f"Hotels WITHOUT Phone Number: {phone_stats['without_phone']} ({round(phone_stats['without_phone']/total_dir*100, 1)}%)")
    print(f"Hotels WITH Thumbnail      : {img_stats['with_thumb']} / {total_dir}")
    print(f"  • CDN (bstatic) thumbs   : {img_stats['bstatic_thumb']}")
    print(f"  • Local (/uploads/)      : {img_stats['local_thumb']}")
    print(f"Hotels WITH Gallery Images : {img_stats['with_images']} / {total_dir}")

    # Check recent 5 hotels added today
    cur.execute("""
        SELECT id, name, city, thumbnail, contactPhone, listingType, isActive, createdAt 
        FROM hotel 
        ORDER BY id DESC 
        LIMIT 5
    """)
    print("\nLatest 5 Hotels in DB:")
    for h in cur.fetchall():
        thumb_snippet = (h['thumbnail'][:45] + '...') if h['thumbnail'] else 'None'
        print(f"  • ID #{h['id']} | {h['name'][:25]} | Phone: {h['contactPhone']} | Thumb: {thumb_snippet}")

print("\n" + "=" * 65)
print("🌐 CHECKING LIVE WEBSITE API: https://gethotelstays.com")
print("=" * 65)

# 2. Check live API / website
try:
    api_url = "https://gethotelstays.com/api/hotels?city=Delhi"
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        if isinstance(data, dict):
            hotel_list = data.get('hotels') or data.get('data') or []
            print(f"API returned {len(hotel_list)} hotels for Delhi")
            if hotel_list:
                sample = hotel_list[0]
                print(f"Sample API Hotel: {sample.get('name')} | Thumbnail: {sample.get('thumbnail')}")
        elif isinstance(data, list):
            print(f"API returned {len(data)} hotels directly")
except Exception as e:
    print(f"Could not fetch /api/hotels: {e}")

try:
    web_url = "https://gethotelstays.com"
    req = urllib.request.Request(web_url, headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Homepage HTML length: {len(html)} bytes (Status: {resp.status})")
except Exception as e:
    print(f"Could not load homepage: {e}")
