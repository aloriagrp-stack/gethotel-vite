import sys
import os
import json
import urllib.request
import time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import pymysql
from agent.google_maps_enricher import LIVE_DB

API_KEY = "aac9d0de-75fd-4270-aa9e-98bfa3bfc713"
HEADERS = {
    "exp-api-key": API_KEY,
    "Accept": "application/json;version=2.0",
    "Accept-Language": "en-US",
    "Content-Type": "application/json"
}


def parse_itinerary(details):
    itin = details.get("itinerary") or {}
    items = []

    # 1. Multi-day tour check
    if "days" in itin and itin["days"]:
        for d in itin["days"]:
            day_num = d.get("dayNumber", 1)
            title = d.get("title") or f"Day {day_num}"
            desc = ""
            if d.get("items"):
                desc = d["items"][0].get("description") or ""
            items.append({
                "day": f"Day {day_num}",
                "title": title,
                "description": desc or title,
                "duration": "Full Day",
                "admission": ""
            })
        if items:
            return items

    # 2. Single-day tour check (itineraryItems)
    if "itineraryItems" in itin and itin["itineraryItems"]:
        for idx, it in enumerate(itin["itineraryItems"]):
            desc = it.get("description") or ""
            
            # Determine title from content
            d_lower = desc.lower()
            if "taj mahal" in d_lower and "baby" not in d_lower and "fort" not in d_lower:
                title = "Taj Mahal"
            elif "agra fort" in d_lower and "following" not in d_lower:
                title = "Agra Fort"
            elif "baby taj" in d_lower or "itmad" in d_lower or "itimad" in d_lower:
                title = "Tomb of Itimad-ud-Daulah (Baby Taj)"
            elif "lunch" in d_lower or "buffet" in d_lower or "breakfast" in d_lower:
                title = "Buffet Lunch at 5-Star Hotel"
            elif idx == 0 or "pick" in d_lower:
                title = "Pickup & Scenic Drive"
            elif idx == len(itin["itineraryItems"]) - 1 or "goodbye" in d_lower or "drop" in d_lower:
                title = "Return Journey & Drop-off"
            else:
                title = f"Tour Stop {idx + 1}"

            dur = ""
            if it.get("duration") and "fixedDurationInMinutes" in it["duration"]:
                m = it["duration"]["fixedDurationInMinutes"]
                dur = f"{round(m/60)} hours" if m >= 60 else f"{m} mins"

            admission = "Admission Ticket Included" if it.get("admissionIncluded") == "YES" else ""

            items.append({
                "day": f"Stop {idx + 1}",
                "title": title,
                "description": desc,
                "duration": dur,
                "admission": admission
            })
        return items

    return items


def update_all():
    conn = pymysql.connect(**LIVE_DB)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, viator_code, title FROM tour_packages WHERE viator_code IS NOT NULL")
            rows = cur.fetchall()
            print(f"Updating itineraries for {len(rows)} tours...")

            for pid, v_code, title in rows:
                url = f"https://api.viator.com/partner/products/{v_code}"
                try:
                    req = urllib.request.Request(url, headers=HEADERS)
                    with urllib.request.urlopen(req, timeout=10) as res:
                        data = json.loads(res.read().decode("utf-8"))
                        parsed_itin = parse_itinerary(data)
                        if parsed_itin:
                            cur.execute("UPDATE tour_packages SET itinerary = %s WHERE id = %s", (json.dumps(parsed_itin), pid))
                            conn.commit()
                            print(f"  ✓ [{v_code}] Updated with {len(parsed_itin)} stops: {title[:40]}")
                        time.sleep(0.2)
                except Exception as e:
                    print(f"  ✗ Error for {v_code}: {e}")
        print("Done updating all rich itineraries!")
    finally:
        conn.close()


if __name__ == "__main__":
    update_all()
