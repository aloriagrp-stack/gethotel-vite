import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pymysql
from agent.google_maps_enricher import LIVE_DB

conn = pymysql.connect(**LIVE_DB)
with conn.cursor() as cur:
    cur.execute("""
        SELECT id, name, contactPhone, websiteUrl, updatedAt 
        FROM hotel 
        WHERE listingType = 'directory' AND contactPhone IS NOT NULL 
        ORDER BY updatedAt DESC 
        LIMIT 8
    """)
    print("--- MOST RECENTLY ENRICHED HOTELS ---")
    for r in cur.fetchall():
        web = f" | Web: {r[3][:30]}" if r[3] else ""
        print(f"#{r[0]} {r[1][:38]:<40} ➔ 📞 {r[2]}{web} | Saved at: {r[4]}")
conn.close()
