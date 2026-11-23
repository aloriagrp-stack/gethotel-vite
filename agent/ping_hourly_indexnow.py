import json
import urllib.request
import re

with open("gethotel-next/src/lib/hourlyLocalitiesData.ts", "r", encoding="utf-8") as f:
    text = f.read()

slugs = re.findall(r'slug:\s*"([^"]+)"', text)
urls = [f"https://gethotelstays.com/hourly/{s}/" for s in slugs]
urls.insert(0, "https://gethotelstays.com/hourly/")

print(f"Submitting {len(urls)} hourly URLs to IndexNow...")

payload = {
    "host": "gethotelstays.com",
    "key": "4a81aac9d0de75fd4270aa9e98bfa3bf",
    "keyLocation": "https://gethotelstays.com/4a81aac9d0de75fd4270aa9e98bfa3bf.txt",
    "urlList": urls[:100]
}

req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json; charset=utf-8"}
)

try:
    with urllib.request.urlopen(req, timeout=10) as res:
        print(f"IndexNow Status: {res.status} (OK)")
except Exception as e:
    print(f"IndexNow notice: {e}")
