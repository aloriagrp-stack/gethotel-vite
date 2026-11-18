"""
Tour Packages Sitemap & IndexNow Fast Indexing Generator
Fetches all active tour packages via API, builds sitemap-packages.xml,
and submits to IndexNow for immediate crawler discovery.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

BASE_URL = "https://gethotelstays.com"
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

def generate_sitemap():
    # Fetch from local API or fallback to live API
    packages = []
    for api_url in ["http://localhost:5000/api/packages", "https://gethotelstays.com/api/packages"]:
        try:
            req = urllib.request.Request(api_url, headers={"User-Agent": "GHS-Sitemap-Generator"})
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode("utf-8"))
                packages = data.get("data", [])
                if packages:
                    print(f"✅ Fetched {len(packages)} tours from {api_url}")
                    break
        except Exception as e:
            print(f"  [API Fetch Notice] {api_url}: {e}")

    if not packages:
        print("❌ Could not fetch packages from API. Aborting sitemap generation.")
        return

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        f'    <loc>{BASE_URL}/packages</loc>',
        f'    <lastmod>{TODAY}</lastmod>',
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>'
    ]

    all_urls = [f"{BASE_URL}/packages"]

    for pkg in packages:
        slug = pkg.get("slug")
        if not slug:
            continue
        url = f"{BASE_URL}/packages/{slug}"
        all_urls.append(url)
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{url}</loc>')
        xml_lines.append(f'    <lastmod>{TODAY}</lastmod>')
        xml_lines.append('    <changefreq>daily</changefreq>')
        xml_lines.append('    <priority>0.9</priority>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')
    sitemap_content = "\n".join(xml_lines)

    # 1. Write to gethotel-next/public/sitemap-packages.xml
    out_path = os.path.join(PROJECT_ROOT, "gethotel-next", "public", "sitemap-packages.xml")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print(f"✅ Generated {out_path} with {len(all_urls)} URLs.")

    # 2. Also write IndexNow API Key verification file in public directory
    key_file = os.path.join(PROJECT_ROOT, "gethotel-next", "public", "4a81aac9d0de75fd4270aa9e98bfa3bf.txt")
    with open(key_file, "w", encoding="utf-8") as f:
        f.write("4a81aac9d0de75fd4270aa9e98bfa3bf")
    print(f"✅ Generated IndexNow verification file: {key_file}")

    # 3. Ensure robots.txt references sitemap-packages.xml
    robots_path = os.path.join(PROJECT_ROOT, "gethotel-next", "public", "robots.txt")
    if os.path.exists(robots_path):
        with open(robots_path, "r", encoding="utf-8") as f:
            r_txt = f.read()
        if "sitemap-packages.xml" not in r_txt:
            with open(robots_path, "a", encoding="utf-8") as f:
                f.write(f"\nSitemap: {BASE_URL}/sitemap-packages.xml\n")
            print(f"✅ Appended sitemap-packages.xml to robots.txt")

    # 4. Ping IndexNow for instant search engine indexing
    ping_indexnow(all_urls)


def ping_indexnow(url_list):
    print(f"\n⚡ Submitting {len(url_list)} URLs to IndexNow for immediate search indexing...")
    indexnow_url = "https://api.indexnow.org/indexnow"
    payload = {
        "host": "gethotelstays.com",
        "key": "4a81aac9d0de75fd4270aa9e98bfa3bf",
        "keyLocation": "https://gethotelstays.com/4a81aac9d0de75fd4270aa9e98bfa3bf.txt",
        "urlList": url_list[:100]
    }
    try:
        req = urllib.request.Request(
            indexnow_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json; charset=utf-8"}
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            print(f"✅ IndexNow HTTP Status: {res.status} (Successfully dispatched to search engines)")
    except Exception as e:
        print(f"  [Notice] IndexNow Ping response: {e}")


if __name__ == "__main__":
    generate_sitemap()
