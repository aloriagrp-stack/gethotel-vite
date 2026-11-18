"""
Sync real INR prices for all imported Viator tours in MariaDB
"""
import os
import sys
import json
import urllib.request
import pymysql
import time

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, PROJECT_ROOT)

from agent.import_all_india_tours import ALL_INDIA_DESTINATIONS, HEADERS
from agent.google_maps_enricher import LIVE_DB

def sync_prices():
    conn = pymysql.connect(**LIVE_DB)
    updated = 0
    try:
        with conn.cursor() as cur:
            for d in ALL_INDIA_DESTINATIONS:
                dest_id = d["destId"]
                url = "https://api.viator.com/partner/products/search"
                payload = {
                    "filtering": {"destination": dest_id},
                    "currency": "INR",
                    "pagination": {"start": 1, "count": 20}
                }
                try:
                    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=HEADERS)
                    with urllib.request.urlopen(req, timeout=12) as res:
                        data = json.loads(res.read().decode("utf-8"))
                        products = data.get("products", [])
                        for p in products:
                            code = p.get("productCode")
                            from_price = p.get("pricing", {}).get("summary", {}).get("fromPrice")
                            if code and from_price:
                                price_val = round(from_price)
                                before_val = p.get("pricing", {}).get("summary", {}).get("fromPriceBeforeDiscount")
                                orig_price = round(before_val) if before_val else round(price_val * 1.25)
                                cur.execute("""
                                    UPDATE tour_packages 
                                    SET price = %s, original_price = %s 
                                    WHERE viator_code = %s
                                """, (price_val, orig_price, code))
                                if cur.rowcount > 0:
                                    updated += cur.rowcount
                                    print(f"  [Price Updated] {code} -> ₹{price_val:,} (was ₹{orig_price:,})")
                        conn.commit()
                except Exception as e:
                    print(f"  [Error] {d['name']}: {e}")
                time.sleep(0.2)
    finally:
        conn.close()
    print(f"\n🎉 Total Tours Price Synced: {updated}")

if __name__ == "__main__":
    sync_prices()
