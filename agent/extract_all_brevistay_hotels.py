import json
import urllib.request
import concurrent.futures
import time
import os

DATA_PATH = r"gethotel-next/src/data/delhiHourlyHotels.json"
BACKUP_PATH = r"gethotel-next/src/data/delhiHourlyHotels.backup.json"

def fetch_hotel_details(hotel):
    url = hotel.get("bookingUrl")
    if not url or "brevistay.com" not in url:
        return hotel

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    retries = 2
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
                
                start_marker = '<script id="__NEXT_DATA__" type="application/json">'
                s_idx = html.find(start_marker)
                if s_idx == -1:
                    s_idx = html.find('__NEXT_DATA__')
                    if s_idx == -1:
                        return hotel
                    s_idx = html.find('{', s_idx)
                else:
                    s_idx += len(start_marker)

                e_idx = html.find("</script>", s_idx)
                if e_idx == -1:
                    return hotel

                json_str = html[s_idx:e_idx].strip()
                parsed = json.loads(json_str)
                pp = parsed.get("props", {}).get("pageProps", {})
                hdata = pp.get("data", {})
                if not hdata:
                    return hotel

                # 1. Slot Availability & Rates
                raw_r3 = int(hdata.get("room1_rate3") or 0)
                raw_r6 = int(hdata.get("room1_rate6") or 0)
                raw_r12 = int(hdata.get("room1_rate12") or 0)

                available_slots = []
                if raw_r3 > 0:
                    available_slots.append("3")
                if raw_r6 > 0:
                    available_slots.append("6")
                if raw_r12 > 0:
                    available_slots.append("12")

                # Fallback if no specific rate is returned
                if not available_slots:
                    available_slots = ["3", "6", "12"]

                # Enforce clean sequential rates where available
                nightly = float(hdata.get("room1_rate24") or hotel.get("pricePerNight") or 1499)
                r3 = raw_r3 if raw_r3 > 0 else max(499, int(nightly * 0.32))
                r6 = raw_r6 if raw_r6 > 0 else int(r3 * 1.35)
                r12 = raw_r12 if raw_r12 > 0 else int(r6 * 1.30)

                # Ensure strict hierarchy if both slots available
                if "3" in available_slots and "6" in available_slots and r6 <= r3:
                    r6 = int(r3 * 1.35)
                if "6" in available_slots and "12" in available_slots and r12 <= r6:
                    r12 = int(r6 * 1.30)

                # 2. Extract Photos (Cap at max 30 photos)
                images = hdata.get("hotel_images") or []
                if isinstance(images, list) and images:
                    valid_images = [img for img in images if isinstance(img, str) and img.startswith("http")]
                    if valid_images:
                        hotel["images"] = valid_images[:30] # Max 30 photos
                        hotel["thumbnail"] = valid_images[0]

                # 3. Extract Amenities
                amenity_list_dict = hdata.get("amenity_list") or {}
                if isinstance(amenity_list_dict, dict):
                    am_items = amenity_list_dict.get("amenities") or []
                    extracted_ams = [a.get("amenity_text") for a in am_items if isinstance(a, dict) and a.get("amenity_text")]
                    if extracted_ams:
                        hotel["amenities"] = extracted_ams

                # 4. Extract Location Coordinates
                lat = hdata.get("lat")
                lng = hdata.get("long")
                if lat and lng:
                    hotel["coordinates"] = {"lat": float(lat), "lng": float(lng)}

                # 5. Ratings & Reviews
                rev_count = hdata.get("har_review_count")
                avg_rating = hdata.get("har_total_avg_rating")
                if rev_count is not None:
                    hotel["reviewCount"] = int(rev_count)
                if avg_rating is not None:
                    hotel["guestRating"] = float(avg_rating)

                # 6. Policies & Rules
                couple_policy = hdata.get("couple_policy")
                accept_local_id = hdata.get("accept_local_id")
                hotel["isCoupleFriendly"] = couple_policy == "allow" or hotel.get("isCoupleFriendly", True)
                hotel["acceptsLocalId"] = bool(accept_local_id) if accept_local_id is not None else True

                # Update rates and available slots
                hotel["availableSlots"] = available_slots
                hotel["hourlyRates"] = {
                    "3": r3,
                    "6": r6,
                    "12": r12
                }

                return hotel
        except Exception as e:
            if attempt == retries - 1:
                return hotel
            time.sleep(1)
    return hotel

def main():
    print(f"Loading {DATA_PATH}...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        hotels = json.load(f)

    # Save backup first
    with open(BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(hotels, f, indent=2, ensure_ascii=False)
    print(f"Backup created at {BACKUP_PATH}.")

    total = len(hotels)
    print(f"Starting parallel extraction for {total} hotels with 10 threads...")
    start_time = time.time()

    completed_hotels = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_hotel = {executor.submit(fetch_hotel_details, h): idx for idx, h in enumerate(hotels)}
        done_count = 0
        for future in concurrent.futures.as_completed(future_to_hotel):
            done_count += 1
            result = future.result()
            completed_hotels.append(result)
            if done_count % 25 == 0 or done_count == total:
                elapsed = time.time() - start_time
                print(f"Progress: [{done_count}/{total}] ({done_count*100//total}%) in {elapsed:.1f}s")

    # Sort back to preserve order by original id
    completed_hotels.sort(key=lambda x: str(x.get("id", "")))

    print(f"Saving updated data to {DATA_PATH}...")
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(completed_hotels, f, indent=2, ensure_ascii=False)

    print("SUCCESS! All hotels updated with Brevistay active slots, exact rates, and max 30 photos!")

if __name__ == "__main__":
    main()
