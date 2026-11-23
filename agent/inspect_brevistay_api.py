import urllib.request
import json

with open('gethotel-next/src/data/delhiHourlyHotels.json', 'r', encoding='utf-8') as f:
    hotels = json.load(f)

print(f"Scanning 20 hotels to check slot variations...")
sample = [h for h in hotels if h.get('bookingUrl')][:20]

for idx, h in enumerate(sample):
    url = h['bookingUrl']
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            start = html.find('{', html.find('__NEXT_DATA__'))
            end = html.find('</script>', start)
            data = json.loads(html[start:end])
            hdata = data['props']['pageProps']['data']

            r3 = hdata.get('room1_rate3')
            r6 = hdata.get('room1_rate6')
            r12 = hdata.get('room1_rate12')
            r24 = hdata.get('room1_rate24')
            imgs = hdata.get('hotel_images') or []

            # Check if any slot is missing or 0 or None
            avail_slots = []
            if r3 and int(r3) > 0: avail_slots.append("3h")
            if r6 and int(r6) > 0: avail_slots.append("6h")
            if r12 and int(r12) > 0: avail_slots.append("12h")

            print(f"[{idx+1}/20] {hdata.get('hotelName')[:30]} | Slots: {avail_slots} | r3: ₹{r3}, r6: ₹{r6}, r12: ₹{r12} | Photos: {len(imgs)}")
    except Exception as e:
        print(f"[{idx+1}/20] Error on {url}: {e}")
