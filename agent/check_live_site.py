import urllib.request
import re
import json

def check_live():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    for path in ['/', '/delhi-hotels']:
        url = f'https://gethotelstays.com{path}'
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as res:
                content = res.read().decode('utf-8')
                print(f"=== {url} ===")
                print(f"Status 200, Length: {len(content)}")
                
                # Check for images
                imgs = re.findall(r'src=["\']([^"\']+)["\']', content)
                bstatic_imgs = [i for i in imgs if 'bstatic.com' in i]
                print(f"Total img tags: {len(imgs)} | Booking CDN images: {len(bstatic_imgs)}")
                if bstatic_imgs:
                    print("Sample bstatic image:", bstatic_imgs[0])
                
                # Check for hotel names / mentions
                titles = re.findall(r'<h[2-4][^>]*>([^<]+)</h[2-4]>', content)
                print(f"Sample headings ({len(titles)}):", titles[:8])
        except Exception as e:
            print(f"Error {url}: {e}")

check_live()
