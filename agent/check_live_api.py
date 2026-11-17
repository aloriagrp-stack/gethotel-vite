import urllib.request
import json

url = 'https://gethotelstays.com/api/hotels?listingType=directory'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as r:
    res = json.loads(r.read().decode('utf-8'))
    hotels = res.get('data', [])
    print(f"Total directory hotels returned: {len(hotels)}")
    with_phone = sum(1 for h in hotels if h.get('contactPhone'))
    with_thumb = sum(1 for h in hotels if h.get('thumbnail'))
    print(f"Hotels with thumbnail: {with_thumb}/{len(hotels)}")
    print(f"Hotels with phone: {with_phone}/{len(hotels)}")
    print("\nFirst 3 hotels:")
    for h in hotels[:3]:
        print(f"- ID: {h.get('id')} | Name: {h.get('name')}")
        print(f"  Phone: {h.get('contactPhone')}")
        print(f"  Thumbnail: {h.get('thumbnail')}")
