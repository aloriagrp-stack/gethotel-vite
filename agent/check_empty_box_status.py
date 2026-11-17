import pymysql
import json
import os

# 1. Check Live Database
conn = pymysql.connect(
    host='103.108.220.145', port=3306, user='vgyuvmpi_gethotel_db', password='shriyanshking',
    database='vgyuvmpi_gethotel_db', cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cur:
    cur.execute("SELECT COUNT(*) as total_directory FROM hotel WHERE listingType = 'directory'")
    total_dir = cur.fetchone()['total_directory']

    cur.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN contactPhone IS NOT NULL AND contactPhone != '' THEN 1 ELSE 0 END) as with_phone,
            SUM(CASE WHEN contactPhone IS NULL OR contactPhone = '' THEN 1 ELSE 0 END) as without_phone,
            SUM(CASE WHEN contactEmail IS NOT NULL AND contactEmail != '' THEN 1 ELSE 0 END) as with_email,
            SUM(CASE WHEN websiteUrl IS NOT NULL AND websiteUrl != '' THEN 1 ELSE 0 END) as with_website
        FROM hotel 
        WHERE listingType = 'directory'
    """)
    stats = cur.fetchone()

# 2. Check Empty Box Registry Files
eb_paths = [
    r'd:\shriyansh stock\travell app project\agent\empty_box\empty_box_registry.json',
    r'd:\shriyansh stock\travell app project\empty_box\empty_box_registry.json'
]
eb_data = []
found_path = None
for p in eb_paths:
    if os.path.exists(p):
        try:
            with open(p, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if len(data) > len(eb_data):
                    eb_data = data
                    found_path = p
        except Exception:
            pass

print('=' * 60)
print('📊 LIVE GHS DIRECTORY & EMPTY BOX STATUS REPORT')
print('=' * 60)
print(f'Total Directory Hotels in Live DB : {total_dir}')
print(f'Verified Phone Attached           : {stats["with_phone"]} ({round(stats["with_phone"]/total_dir*100, 1)}%)')
print(f'Official Email Attached           : {stats["with_email"]} ({round(stats["with_email"]/total_dir*100, 1)}%)')
print(f'Official Website Attached         : {stats["with_website"]} ({round(stats["with_website"]/total_dir*100, 1)}%)')
print(f'Hotels in Empty Box (Unresolved)  : {len(eb_data)} hotels')
if found_path:
    print(f'Empty Box File Location           : {found_path}')
print('=' * 60)
if eb_data:
    print('\nSample Hotels currently in Empty Box Registry:')
    for item in eb_data[-5:]:
        print(f"  • {item.get('name', 'Hotel')} ({item.get('city', 'Delhi')}) | Reason: {item.get('reason', 'Phone not found')}")
