import urllib.request, json, ssl, time, sys, os
import pymysql

sys.path.insert(0, os.getcwd())
from agent.google_maps_enricher import LIVE_DB

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

conn = pymysql.connect(**LIVE_DB, cursorclass=pymysql.cursors.DictCursor)
with conn.cursor() as cur:
    cur.execute("SELECT id, name, slug, city, listingType FROM hotel WHERE listingType = 'directory' LIMIT 1")
    dir_hotel = cur.fetchone()
    cur.execute("SELECT id, name, slug, city, listingType FROM hotel WHERE listingType = 'bookable' LIMIT 1")
    book_hotel = cur.fetchone()
conn.close()

print('=== INSPECTING LIVE HOTEL PAGES ===')
for h in [dir_hotel, book_hotel]:
    slug = h['slug'] or h['id']
    url = f"https://gethotelstays.com/hotel/{slug}/"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            code = r.getcode()
            body = r.read().decode('utf-8', errors='ignore')
            title = body.split('<title>')[1].split('</title>')[0] if '<title>' in body else 'None'
            has_schema = 'application/ld+json' in body
            print(f"[{code}] {h['listingType'].upper()}: {h['name']}")
            print(f"  URL: {url}")
            print(f"  HTML Title: {title}")
            print(f"  Static Schema Tag Present: {has_schema}")
    except Exception as e:
        print(f"Error fetching {url}: {e}")

# Check robots.txt content
print('\n=== ROBOTS.TXT AUDIT ===')
try:
    req = urllib.request.Request("https://gethotelstays.com/robots.txt", headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
        robots = r.read().decode('utf-8')
        print(robots.strip())
except Exception as e:
    print("Robots err:", e)
