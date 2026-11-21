import urllib.request
import json

api_key = 'aac9d0de-75fd-4270-aa9e-98bfa3bfc713'
headers = {
    'exp-api-key': api_key,
    'Accept': 'application/json;version=2.0',
    'Accept-Language': 'en-US',
    'Content-Type': 'application/json'
}

destinations = {
    'Delhi': '804',
    'Agra': '4549',
    'Jaipur': '4550',
    'Goa': '4551',
    'Udaipur': '4552',
    'Varanasi': '4553'
}

for name, dest_id in destinations.items():
    try:
        url = 'https://api.viator.com/partner/products/search'
        payload = {
            'filtering': {'destination': dest_id},
            'currency': 'INR',
            'pagination': {'start': 1, 'count': 5}
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers)
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode())
            prods = data.get('products', [])
            print(f"{name} ({dest_id}) -> Found: {len(prods)}")
            if prods:
                print(f"   Sample: {prods[0].get('title')[:60]}")
    except Exception as e:
        print(f"{name} Error: {e}")
